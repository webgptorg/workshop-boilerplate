import { NextResponse } from "next/server";
import { guardRequest } from "@/lib/api-guard";
import { authenticateRequest } from "@/lib/supabase/server";
import { bindAccountIdentity, createAccountState } from "@/lib/account-state";
import { isAppState } from "@/lib/validation";

export const runtime = "nodejs";
const MAX_DATA_BYTES = 20 * 1024 * 1024;
const RESPONSE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const account = await authenticateRequest(request);
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: RESPONSE_HEADERS });
  const { data, error } = await account.client.from("account_data").select("state, revision").eq("user_id", account.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "load_failed" }, { status: 503, headers: RESPONSE_HEADERS });
  const identity = { id: account.user.id, email: account.email };
  if (data && !isAppState(data.state)) return NextResponse.json({ error: "invalid_saved_data" }, { status: 500, headers: RESPONSE_HEADERS });
  return NextResponse.json({
    state: data ? bindAccountIdentity(data.state, identity) : createAccountState({
      ...identity,
      name: typeof account.user.user_metadata.name === "string" ? account.user.user_metadata.name.slice(0, 80) : account.email.split("@")[0],
    }),
    revision: data?.revision ?? 0,
  }, { headers: RESPONSE_HEADERS });
}

export async function PUT(request: Request) {
  const blockedResponse = guardRequest(request);
  if (blockedResponse) return blockedResponse;
  const account = await authenticateRequest(request);
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (Number(request.headers.get("content-length")) > MAX_DATA_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
  try {
    const body = await readLimitedJson(request);
    if (!isSaveRequest(body)) return NextResponse.json({ error: "invalid_data" }, { status: 400 });
    const state = bindAccountIdentity(body.state, { id: account.user.id, email: account.email });
    const { data, error } = await account.client.rpc("save_account_data", { incoming_state: state, expected_revision: body.revision });
    if (error) return NextResponse.json({ error: error.code === "40001" ? "conflict" : "save_failed" }, { status: error.code === "40001" ? 409 : 503 });
    return NextResponse.json({ revision: data }, { headers: RESPONSE_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: "invalid_data" }, { status: error instanceof RangeError ? 413 : 400 });
  }
}

function isSaveRequest(value: unknown): value is { state: import("@/lib/types").AppState; revision: number } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return isAppState(body.state) && typeof body.revision === "number" && Number.isSafeInteger(body.revision) && body.revision >= 0;
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done: isDone, value } = await reader.read();
      if (isDone) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_DATA_BYTES) throw new RangeError("Data is too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
