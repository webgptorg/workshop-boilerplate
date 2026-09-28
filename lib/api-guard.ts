import { NextResponse } from "next/server";

const requests = new Map<string, { count: number; reset: number }>();

export function guardRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "origin" }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  if (requests.size > 1000) for (const [key, value] of requests) if (value.reset < now) requests.delete(key);
  const entry = requests.get(ip);
  if (entry && entry.reset > now && entry.count >= 30) return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  requests.set(ip, entry && entry.reset > now ? { ...entry, count: entry.count + 1 } : { count: 1, reset: now + 60_000 });
  return null;
}
