import { NextRequest } from "next/server";
import {
  getRoom,
  roomSnapshot,
  storageMode,
  subscribeRoom,
  updateRoom,
} from "@/lib/room-store";
import { validRoomId, type RoomMessage } from "@/lib/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!validRoomId(id))
    return Response.json(
      { error: "That room link is invalid." },
      { status: 400 },
    );
  try {
    const room = await getRoom(
      id,
      request.nextUrl.searchParams.get("welcome") === "1",
    );
    const encoder = new TextEncoder();
    let dispose: ((closeStream?: boolean) => void) | undefined;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const send = (message: RoomMessage) => {
          if (!closed)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`),
            );
        };
        const unsubscribe = subscribeRoom(room, send);
        for (const message of roomSnapshot(room)) send(message);
        controller.enqueue(
          encoder.encode(
            `event: ready\ndata: ${JSON.stringify({ storage: storageMode() })}\n\n`,
          ),
        );
        const heartbeat = setInterval(() => {
          if (!closed) controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 15_000);
        dispose = (closeStream = true) => {
          if (closed) return;
          closed = true;
          clearInterval(heartbeat);
          unsubscribe();
          request.signal.removeEventListener("abort", disposeAbort);
          if (closeStream) controller.close();
        };
        const disposeAbort = () => dispose?.();
        request.signal.addEventListener("abort", disposeAbort);
        if (request.signal.aborted) dispose();
      },
      cancel() {
        dispose?.(false);
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Unable to open room:", error);
    return Response.json(
      { error: "Unable to open this room. Check your storage configuration." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!validRoomId(id))
    return Response.json(
      { error: "That room link is invalid." },
      { status: 400 },
    );
  const origin = request.headers.get("origin");
  // nextUrl can contain the internal bind address (0.0.0.0) behind a proxy.
  // The browser-facing Host header is the correct origin to compare.
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host"))
        return Response.json(
          { error: "Cross-origin writes are not allowed." },
          { status: 403 },
        );
    } catch {
      return Response.json({ error: "Invalid origin." }, { status: 403 });
    }
  }
  try {
    const raw = await request.text();
    if (raw.length > 1_500_000)
      return Response.json(
        { error: "This update is too large." },
        { status: 413 },
      );
    const message: unknown = JSON.parse(raw);
    if (
      !message ||
      typeof message !== "object" ||
      !("type" in message) ||
      !("data" in message) ||
      (message.type !== "document" && message.type !== "awareness") ||
      typeof message.data !== "string" ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(message.data)
    ) {
      return Response.json({ error: "Invalid room update." }, { status: 400 });
    }
    const room = await getRoom(id);
    await updateRoom(room, { type: message.type, data: message.data });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to update room:", error);
    return Response.json(
      { error: "Your changes could not be saved. Retrying…" },
      { status: 503 },
    );
  }
}
