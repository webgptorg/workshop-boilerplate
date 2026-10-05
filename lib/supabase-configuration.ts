export function getSupabaseConfiguration() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!URL || !PUBLISHABLE_KEY) throw new Error("Supabase is not configured. Follow the setup instructions in README.md.");
  return { url: URL, publishableKey: PUBLISHABLE_KEY };
}
