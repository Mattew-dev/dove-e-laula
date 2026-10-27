// Service worker: l'app e l'elenco delle aule funzionano anche offline.
// Quando cambi un file dell'app, aumenta VERSIONE: i telefoni scaricheranno la nuova copia.
const VERSIONE = "v1";
const CACHE = `dove-e-laula-${VERSIONE}`;

const FILE_APP = [
  "./",
  "index.html",
  "config.js",
  "manifest.webmanifest",
  "css/style.css",
  "js/app.js",
  "js/normalizza.js",
  "js/parser.js",
  "js/ricerca.js",
  "js/link.js",
  "js/mappa.js",
  "js/storage.js",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "vendor/leaflet/images/marker-icon.png",
  "vendor/leaflet/images/marker-icon-2x.png",
  "vendor/leaflet/images/marker-shadow.png",
  "icons/icona.svg",
  "icons/icona-192.png",
  "data/aule.json",
  "data/cubi.json",
];
const DATI = ["data/aule.json", "data/cubi.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE_APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomi) => Promise.all(nomi.filter((n) => n.startsWith("dove-e-laula-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // tile della mappa e link esterni: rete normale

  // I dati delle aule: prima la rete (per avere le correzioni), poi la copia salvata se offline.
  if (DATI.some((d) => url.pathname.endsWith(d))) {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          if (r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Il resto dell'app: prima la copia salvata (avvio istantaneo e offline).
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((salvata) => salvata || fetch(e.request)),
  );
});
