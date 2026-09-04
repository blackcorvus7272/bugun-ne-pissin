/* Bugün Ne Pişsin — çevrimdışı çalışma katmanı.
   Uygulama kabuğu kuruluşta önbelleğe alınır; yazı tipleri kullanıldıkça eklenir. */

const SURUM = "bnp-v5";
const KABUK = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SURUM)
      /* Tek bir dosya bulunamazsa kurulumun tamamı düşmesin. */
      .then(c => Promise.all(KABUK.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(adlar.filter(a => a !== SURUM).map(a => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const istek = e.request;
  if (istek.method !== "GET") return;

  const url = new URL(istek.url);
  const yaziTipi = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== self.location.origin && !yaziTipi) return;

  /* Sayfanın kendisi: önce ağ, olmazsa önbellek. Böylece güncelleme gelir,
     internet yoksa da uygulama açılır. */
  if (istek.mode === "navigate"){
    e.respondWith(
      fetch(istek)
        .then(y => {
          const kopya = y.clone();
          caches.open(SURUM).then(c => c.put("index.html", kopya)).catch(() => {});
          return y;
        })
        .catch(() => caches.match("index.html").then(y => y || caches.match(".")))
    );
    return;
  }

  /* Diğer her şey: önce önbellek, yoksa ağdan alıp sakla. */
  e.respondWith(
    caches.match(istek).then(bulunan => bulunan || fetch(istek).then(y => {
      if (y && (y.ok || y.type === "opaque")){
        const kopya = y.clone();
        caches.open(SURUM).then(c => c.put(istek, kopya)).catch(() => {});
      }
      return y;
    }).catch(() => bulunan || new Response("", {status:504, statusText:"Çevrimdışı"})))
  );
});
