// Nombre del caché (Actualizado a v2 para invalidar el anterior)
const CACHE_NAME = "sobrazero-pwa-v2";

// Archivos a cachear (mínimo para PWA instalable)
const ASSETS = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/iconos/icono-de-aplicacion-chico.png",
    "/iconos/icono-de-aplicacion-grande.png"
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
    // Solo manejamos GET
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // ESTRATEGIA: Network First para HTML y navegación (evita index.html viejo)
    if (event.request.mode === 'navigate' || url.pathname.endsWith(".html") || url.pathname === "/") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Si la red responde, actualizamos caché y devolvemos
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match(event.request)) // Si falla red, usamos caché
        );
        return;
    }

    // ESTRATEGIA: Cache First para estáticos (imágenes, js, css, fuentes)
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // Opcional: Cachear nuevos recursos dinámicamente si se quiere
                return response;
            });
        })
    );
});