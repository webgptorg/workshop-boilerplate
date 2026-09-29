import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server";
import { bindAccount, createAccountState } from "@/lib/account";
import { isAppState } from "@/lib/validation";

export const runtime = "nodejs";
const MAXIMUM_STATE_BYTES = 20 * 1024 * 1024;
const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const account = await authenticateRequest(request);
  if (!account) return respond({ error: "unauthorized" }, 401);
  const { client, user } = account;
  const { error: insertError } = await client.from("account_data").upsert(
    { user_id: user.id, payload: createAccountState(user), revision: 1 },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (insertError) return respond({ error: "load_failed" }, 503);
  const { data, error } = await client.from("account_data").select("payload, revision").eq("user_id", user.id).single();
  if (error || !isAppState(data?.payload)) return respond({ error: "load_failed" }, 503);
  return respond({ state: bindAccount(data.payload, user), revision: data.revision });
}

async function readLimitedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid_body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done: isDone } = await reader.read();
    if (isDone) break;
    size += value.byteLength;
    if (size > MAXIMUM_STATE_BYTES) { await reader.cancel(); throw new Error("too_large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond({ error: "origin" }, 403);
  const account = await authenticateRequest(request);
  if (!account) return respond({ error: "unauthorized" }, 401);
  let body: unknown;
  try { body = await readLimitedBody(request); }
  catch (error) { return respond({ error: "invalid_body" }, error instanceof Error && error.message === "too_large" ? 413 : 400); }
  if (!body || typeof body !== "object" || !("state" in body) || !("revision" in body) ||
      !isAppState(body.state) || !Number.isSafeInteger(body.revision) || typeof body.revision !== "number" || body.revision < 1) {
    return respond({ error: "invalid_state" }, 400);
  }
  const { client, user } = account;
  const { data, error } = await client.from("account_data")
    .update({ payload: bindAccount(body.state, user), revision: body.revision + 1 })
    .eq("user_id", user.id).eq("revision", body.revision).select("revision").maybeSingle();
  if (error) return respond({ error: "save_failed" }, 503);
  if (!data) return respond({ error: "conflict" }, 409);
  return respond({ revision: data.revision });
}
