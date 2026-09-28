import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

type RequestLike = Pick<Request, "url" | "headers" | "method" | "mode">;
type FetchEvent = {
  request: RequestLike;
  respondWith(response: Promise<Response>): void;
  waitUntil(work: Promise<unknown>): void;
};

function worker() {
  const listeners = new Map<string, (event: FetchEvent) => void>();
  const stored = new Map<string, Response>([["/", new Response("<html>Minute app shell</html>")]]);
  runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    self: { location: { origin: "https://minute.test" }, addEventListener: (name: string, listener: (event: FetchEvent) => void) => listeners.set(name, listener) },
    caches: { match: async (request: string | RequestLike) => stored.get(typeof request === "string" ? request : request.url) },
    fetch: async () => { throw new Error("offline"); },
    URL, Response, Set,
  });
  return (path: string, mode: RequestMode = "navigate", headers = new Headers(), method = "GET") => {
    let response: Promise<Response> | undefined;
    listeners.get("fetch")?.({
      request: { url: `https://minute.test${path}`, headers, method, mode },
      respondWith: value => { response = value; },
      waitUntil: () => undefined,
    });
    return response;
  };
}

test("offline navigation to an unvisited meeting receives the cached app shell", async () => {
  const response = await worker()("/workspace/meetings/unvisited");
  assert.equal(await response?.text(), "<html>Minute app shell</html>");
});

test("the service worker never substitutes HTML for API or RSC responses", () => {
  const fetch = worker();
  assert.equal(fetch("/api/transcribe", "cors", new Headers(), "POST"), undefined);
  assert.equal(fetch("/workspace?_rsc=abc", "cors"), undefined);
  assert.equal(fetch("/workspace", "cors", new Headers({ RSC: "1" })), undefined);
});
