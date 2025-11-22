self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("task-app-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "Task.html",
        "system1.html",
        "Performances.html",
        "Strategy.html",
        "Login.html",
        "manifest.json",
        "icons/icon-192.png",
        "icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

