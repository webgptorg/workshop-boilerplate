import type { NextConfig } from "next";

const NEXT_CONFIG: NextConfig = {
  // Support the existing server-named public settings without exposing the secret key.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
  },
  outputFileTracingIncludes: { "/*": ["./migrations/*.sql"] },
};

export default NEXT_CONFIG;
