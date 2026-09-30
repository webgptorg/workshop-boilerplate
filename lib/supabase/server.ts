import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";
import { getSupabaseConfig } from "./config";

export async function authenticateRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { url, publishableKey } = getSupabaseConfig();
  const client = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  // Validate with Auth, then use the user's token for all queries so RLS applies.
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) return null;
  const profile = await client.from("profiles").select("id, email").eq("id", data.user.id).single();
  if (profile.error || !profile.data) return null;
  return { client, user: data.user, email: String(profile.data.email) };
}
