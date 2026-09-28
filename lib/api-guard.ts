import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";

export async function guardRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "origin" }, { status: 403 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const quota = await supabase.rpc("consume_ai_quota");
  if (quota.error) return NextResponse.json({ error: "quota_unavailable" }, { status: 503 });
  if (!quota.data) return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  return null;
}
