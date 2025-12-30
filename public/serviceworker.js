const CACHE_NAME = "version-1";
const URLS_TO_CACHE = [
  "/", 
  "/index.html",
  "/offline.html"
];

// 🔹 INSTALL
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 🔹 FETCH
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request).catch(() => {
//       return caches.match(event.request).then((response) => {
//         return response || caches.match("/offline.html");
//       }).catch((err)=>{
//         return aches.match("/offline.html")
//       });
//     })
//   );
// });

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 🚫 API calls ko ignore karo
  if (
    url.pathname.startsWith("/api") ||
    request.method !== "GET"
  ) {
    return; // browser direct handle karega
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/offline.html");
        });
      })
  );
});


// 🔹 ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});
