-- Minimal contracts for testing application SQL on a disposable PostgreSQL database.
-- This is not a Supabase server and does not simulate Auth or Storage HTTP behavior.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE TABLE auth.users (
  instance_id uuid, id uuid PRIMARY KEY, aud text, role text, email text UNIQUE,
  encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb,
  raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz,
  confirmation_token text, recovery_token text, email_change_token_new text,
  email_change text, email_change_token_current text, reauthentication_token text,
  banned_until timestamptz
);
CREATE TABLE auth.identities (
  id uuid PRIMARY KEY, provider_id text NOT NULL, user_id uuid REFERENCES auth.users(id),
  identity_data jsonb NOT NULL, provider text NOT NULL, last_sign_in_at timestamptz,
  created_at timestamptz, updated_at timestamptz, UNIQUE (provider_id, provider)
);
CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint);
CREATE TABLE storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text REFERENCES storage.buckets(id), name text NOT NULL
);
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
  SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1];
$$;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;
