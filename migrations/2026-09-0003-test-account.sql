create extension if not exists pgcrypto with schema extensions;

-- A development fixture, never an administrator. Known credentials are banned by default.
-- Do not replace an existing account or reset its password when adopting this application.
do $$
declare test_user_id uuid := gen_random_uuid();
begin
    if not exists (select 1 from auth.users where lower(email) = 'test@ptbk.io') then
        insert into auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, recovery_token, email_change, email_change_token_new,
            email_change_token_current, reauthentication_token, phone_change, phone_change_token, banned_until
        ) values (
            '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated',
            'test@ptbk.io', extensions.crypt('password123', extensions.gen_salt('bf', 10)), now(),
            '{"provider":"email","providers":["email"]}', '{"name":"Test user"}', now(), now(),
            '', '', '', '', '', '', '', '',
            case when current_setting('minute.enable_test_account', true) = 'true'
                then null else now() + interval '100 years' end
        );
        insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
        values (gen_random_uuid(), test_user_id, test_user_id::text,
            jsonb_build_object('sub', test_user_id::text, 'email', 'test@ptbk.io', 'email_verified', true),
            'email', now(), now(), now());
    end if;
end;
$$;
