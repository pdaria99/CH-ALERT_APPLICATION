const staticDevAlert = "dev-child-alert-v1";

const assets = [
    '/index.html',
    '/bundle.min.js'
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
      caches.open(staticDevAlert).then(cache => {
        cache.addAll(assets)
      })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })

