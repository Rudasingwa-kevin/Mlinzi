const CACHE_VERSION = "v2";
const STATIC_CACHE = `mlinzi-static-${CACHE_VERSION}`;
const PAGES_CACHE = `mlinzi-pages-${CACHE_VERSION}`;
const API_CACHE = `mlinzi-api-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/mlinzi-icon.png",
  "/full.png",
  "/favicon.svg",
  "/manifest.json",
];

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mlinzi — Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 400px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 64px; height: 64px; margin: 0 auto 20px; background: #E8F5E9; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 32px; height: 32px; color: #2E7D32; }
    h1 { font-size: 20px; color: #0B1220; margin-bottom: 8px; }
    p { color: #64748B; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
    .btn { display: inline-block; background: #2E7D32; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
    .btn:hover { background: #1B5E20; }
    .help { margin-top: 16px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h1>You're offline</h1>
    <p>Mlinzi needs an internet connection to analyze reports and connect you with counselors. Please check your connection and try again.</p>
    <button class="btn" onclick="window.location.reload()">Try Again</button>
    <p class="help">If you're in immediate danger, call 112 (Police) or 116 (Child Helpline)</p>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html").then((r) => r || new Response(OFFLINE_PAGE, { headers: { "Content-Type": "text/html" } })))
    );
    return;
  }

  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || Response.json({ error: "Offline" }, { status: 503 });
  }
}
