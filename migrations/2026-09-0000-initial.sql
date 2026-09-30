-- All migrations in this startup batch are committed together by the application.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  banned_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) AND (banned_until IS NULL OR banned_until <= now()));

-- Auth owns identity; never trust a client-supplied email or role.
CREATE FUNCTION minute_private.sync_auth_profile() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, banned_until)
  VALUES (NEW.id, lower(NEW.email), NEW.banned_until)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, banned_until = EXCLUDED.banned_until;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION minute_private.sync_auth_profile() FROM PUBLIC;
CREATE TRIGGER minute_sync_auth_profile AFTER INSERT OR UPDATE OF email, banned_until ON auth.users
  FOR EACH ROW EXECUTE FUNCTION minute_private.sync_auth_profile();
INSERT INTO public.profiles (id, email, banned_until)
  SELECT id, lower(email), banned_until FROM auth.users WHERE email IS NOT NULL;

-- A versioned per-account document keeps the starter's existing domain model small.
-- Workspaces/memberships inside it are private to the account, not shared permissions.
CREATE TABLE public.account_data (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object' AND state->>'version' IS NOT NULL AND state->>'version' = '1'),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_data_identity CHECK (state->'user'->>'id' IS NOT NULL AND state->'user'->>'id' = user_id::text),
  CONSTRAINT account_data_size CHECK (octet_length(state::text) <= 20971520)
);
ALTER TABLE public.account_data ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_data FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.account_data TO authenticated;
CREATE POLICY account_data_read_own ON public.account_data FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id));
CREATE POLICY account_data_insert_own ON public.account_data FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id));
CREATE POLICY account_data_update_own ON public.account_data FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id))
  WITH CHECK (user_id = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id));

CREATE FUNCTION minute_private.check_account_data() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  account_email text;
BEGIN
  SELECT email INTO account_email FROM public.profiles WHERE id = NEW.user_id;
  IF account_email IS NULL OR NEW.state->'user'->>'email' IS DISTINCT FROM account_email THEN
    RAISE EXCEPTION 'Account identity does not match authenticated profile' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN RAISE EXCEPTION 'Invalid initial revision' USING ERRCODE = '23514'; END IF;
  ELSE
    IF NEW.user_id <> OLD.user_id OR NEW.revision <> OLD.revision + 1 THEN
      RAISE EXCEPTION 'Invalid account revision' USING ERRCODE = '23514';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION minute_private.check_account_data() FROM PUBLIC;
CREATE TRIGGER minute_check_account_data BEFORE INSERT OR UPDATE ON public.account_data
  FOR EACH ROW EXECUTE FUNCTION minute_private.check_account_data();

-- Compare-and-swap prevents another tab/device from silently overwriting changes.
CREATE FUNCTION public.save_account_data(incoming_state jsonb, expected_revision integer) RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  saved_revision integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF expected_revision = 0 THEN
    INSERT INTO public.account_data (user_id, state) VALUES (auth.uid(), incoming_state)
      ON CONFLICT (user_id) DO NOTHING RETURNING revision INTO saved_revision;
  ELSE
    UPDATE public.account_data SET state = incoming_state, revision = revision + 1
      WHERE user_id = auth.uid() AND revision = expected_revision RETURNING revision INTO saved_revision;
  END IF;
  IF saved_revision IS NULL THEN RAISE EXCEPTION 'Account data changed' USING ERRCODE = '40001'; END IF;
  RETURN saved_revision;
END;
$$;
REVOKE ALL ON FUNCTION public.save_account_data(jsonb, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_account_data(jsonb, integer) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('recordings', 'recordings', false, 26214400);
CREATE POLICY minute_recordings_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid())));
CREATE POLICY minute_recordings_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid())));
CREATE POLICY minute_recordings_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid())));

-- Requested SQL fixture: use Auth APIs for all normal registrations.
-- The bcrypt hash, confirmed email, and email identity make it a real password login.
DO $$
DECLARE
  test_user_id uuid = gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'test@ptbk.io') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, reauthentication_token, banned_until
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated',
      'test@ptbk.io', extensions.crypt('password123', extensions.gen_salt('bf', 12)), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Test user"}', now(), now(),
      '', '', '', '', '', '',
      CASE WHEN current_setting('minute.is_production', true) = 'true' THEN 'infinity'::timestamptz ELSE NULL END
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), test_user_id::text, test_user_id,
      jsonb_build_object('sub', test_user_id::text, 'email', 'test@ptbk.io', 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now());
  END IF;
END;
$$;
