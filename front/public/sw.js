// Nombre del caché
const CACHE_NAME = "sobrazero-pwa-v1";

// Archivos a cachear (mínimo para PWA instalable)
const ASSETS = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// INSTALACIÓN DEL SERVICE WORKER
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// ACTIVACIÓN DEL SERVICE WORKER
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// INTERCEPCIÓN DE LAS REQUESTS
self.addEventListener("fetch", (event) => {
    // Sólo cacheamos GET
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request);
        })
    );
});