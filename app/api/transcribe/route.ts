import { NextResponse } from "next/server";
import { guardRequest } from "@/lib/api-guard";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const blocked = await guardRequest(request);
  if (blocked) return blocked;
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (Number(request.headers.get("content-length")) > 26 * 1024 * 1024)
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    if (!/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i.test(file.name))
      return NextResponse.json({ error: "unsupported_file" }, { status: 400 });
    const form = new FormData();
    form.append("file", file);
    form.append("model", process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe");
    form.append("response_format", "json");
    const language = data.get("language");
    if (language === "en" || language === "cs") form.append("language", language);
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(110_000),
    });
    if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "rate_limit" : "transcription_failed" }, { status: 502 });
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("text" in result) || typeof result.text !== "string")
      throw new Error("Invalid transcript");
    return NextResponse.json({ text: result.text });
  } catch {
    return NextResponse.json({ error: "transcription_failed" }, { status: 502 });
  }
}
