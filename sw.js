const CACHE = "kasir-qris-v1";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const put = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {}); return res; };
  if (r.mode === "navigate") {
    // Halaman utama: coba internet dulu supaya selalu versi terbaru, cadangan dari cache.
    e.respondWith(fetch(r).then(put).catch(() => caches.match("./index.html")));
    return;
  }
  // Pustaka, font, ikon: cache dulu, lalu internet.
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(put)));
});
