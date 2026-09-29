import { NextResponse } from "next/server";
import { authenticateRequest } from "./supabase/server";

export async function guardRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "origin" }, { status: 403 });
  const account = await authenticateRequest(request);
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: isAllowed, error } = await account.client.rpc("consume_ai_request");
  if (error) return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  if (!isAllowed) return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  return null;
}
