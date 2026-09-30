const CACHE = "minute-v2";
const STATIC_ASSETS = ["/icon.svg", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  // Delete the previous worker's cached pages, which predate account isolation.
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("minute-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Account pages, RSC responses and APIs must always reach the server.
  if (request.mode === "navigate" || request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;
  if (url.pathname.startsWith("/_next/static/") || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy))); }
      return response;
    })));
  }
});
