import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseConfiguration } from "./supabase-configuration";

const requests = new Map<string, { count: number; reset: number }>();

export async function guardRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "origin" }, { status: 403 });
  const TOKEN = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!TOKEN) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let configuration;
  try { configuration = getSupabaseConfiguration(); }
  catch { return NextResponse.json({ error: "not_configured" }, { status: 503 }); }
  const SUPABASE = createClient(configuration.url, configuration.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await SUPABASE.auth.getUser(TOKEN);
  if (error || !data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ACCOUNT_ID = data.user.id;
  const now = Date.now();
  if (requests.size > 1000) for (const [key, value] of requests) if (value.reset < now) requests.delete(key);
  const entry = requests.get(ACCOUNT_ID);
  if (entry && entry.reset > now && entry.count >= 30) return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  requests.set(ACCOUNT_ID, entry && entry.reset > now ? { ...entry, count: entry.count + 1 } : { count: 1, reset: now + 60_000 });
  return null;
}
