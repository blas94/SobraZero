const NOMBRE_CACHE = "sobrazero-pwa-v3";

const RECURSOS_CACHEADOS = [
    "/",
    "/index.html",
    "/manifest.webmanifest",

    "/iconos/icono-apple.png",
    "/favicon-light.png",
    "/iconos/icono-de-aplicacion-chico.png",
    "/iconos/icono-de-aplicacion-grande.png",

    "/og-image.png",
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(NOMBRE_CACHE).then((cache) => cache.addAll(RECURSOS_CACHEADOS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches
            .keys()
            .then((claves) =>
                Promise.all(
                    claves
                        .filter((clave) => clave !== NOMBRE_CACHE)
                        .map((clave) => caches.delete(clave))
                )
            )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
    if (evento.request.method !== "GET") return;

    const url = new URL(evento.request.url);

    if (
        evento.request.mode === "navigate" ||
        url.pathname.endsWith(".html") ||
        url.pathname === "/"
    ) {
        evento.respondWith(
            fetch(evento.request)
                .then((respuesta) => {
                    const copiaRespuesta = respuesta.clone();
                    caches
                        .open(NOMBRE_CACHE)
                        .then((cache) => cache.put(evento.request, copiaRespuesta));
                    return respuesta;
                })
                .catch(
                    () => caches.match(evento.request) || caches.match("/index.html")
                )
        );
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then((recursoCacheado) => {
            if (recursoCacheado) return recursoCacheado;
            return fetch(evento.request);
        })
    );
});