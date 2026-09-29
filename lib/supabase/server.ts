import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfiguration } from "./config";

export async function authenticateRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { url, publishableKey } = supabaseConfiguration();
  const client = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  // Verify with Auth; never trust a decoded JWT or a client-supplied account ID.
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) return null;
  return { client, user: data.user };
}
