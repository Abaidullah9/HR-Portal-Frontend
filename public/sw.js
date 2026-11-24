// Offline shell.
//
// - Bump CACHE whenever the strategy changes: `activate` deletes every other
//   cache, so an old worker cannot keep serving assets from a previous release.
// - Navigations are network-first. A cache-first HTML shell is what makes a
//   redeployed app look stale (old markup, old chunk names) until the user
//   clears storage; the network gets the new document, and the cache only covers
//   a genuinely offline load.
// - `_next/static` URLs are content-hashed and immutable, so they stay
//   cache-first.
// - API responses are never cached: they depend on the signed-in user's scope.
const CACHE = 'hr-portal-static-v2'
const PRECACHE = ['/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const putInCache = (request, response) => {
  if (!response.ok) return response
  const copy = response.clone()
  void caches.open(CACHE).then((cache) => cache.put(request, copy))
  return response
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(request, response))
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
    )
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname === '/icon.svg') {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((response) => putInCache(request, response)),
      ),
    )
  }
})
