// Mappa Leaflet + OpenStreetMap. Leaflet è caricato come script globale (window.L).

let attuale = null;

/**
 * @param {HTMLElement} el
 * @param {{lat: number, lon: number, etichetta: string, approssimata: boolean}[]} punti
 */
export function mostraMappa(el, punti) {
  chiudiMappa();
  const L = window.L;
  if (!L) {
    el.innerHTML = '<p class="didascalia" style="padding:16px">Mappa non disponibile.</p>';
    return null;
  }
  // Niente zoom con la rotella: altrimenti scorrendo la pagina si finisce a zoomare la mappa.
  const mappa = L.map(el, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mappa);

  const limiti = [];
  for (const p of punti) {
    const pos = [p.lat, p.lon];
    limiti.push(pos);
    if (p.approssimata) {
      L.circle(pos, { radius: 35, color: "#c48a00", weight: 2, dashArray: "6 6", fillOpacity: 0.12 }).addTo(mappa);
    }
    L.marker(pos, { title: p.etichetta, alt: p.etichetta }).addTo(mappa).bindTooltip(p.etichetta, { permanent: punti.length > 1, direction: "top", offset: [0, -36] });
  }
  if (limiti.length === 1) mappa.setView(limiti[0], 18);
  else mappa.fitBounds(limiti, { padding: [50, 50], maxZoom: 18 });

  attuale = { mappa, limiti, utente: null };
  return attuale;
}

export function chiudiMappa() {
  if (attuale) attuale.mappa.remove();
  attuale = null;
}

/** Chiede la posizione (solo su richiesta dell'utente) e la mostra insieme alla destinazione. */
export function mostraPosizione() {
  return new Promise((ok, errore) => {
    if (!attuale) return errore(new Error("Nessuna mappa aperta."));
    if (!("geolocation" in navigator)) return errore(new Error("Il dispositivo non fornisce la posizione."));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!attuale) return ok();
        const L = window.L;
        const { mappa, limiti } = attuale;
        const pos = [coords.latitude, coords.longitude];
        attuale.utente?.forEach((x) => x.remove());
        attuale.utente = [
          L.circle(pos, { radius: coords.accuracy, color: "#2a7de1", weight: 1, fillOpacity: 0.1 }).addTo(mappa),
          L.marker(pos, { icon: L.divIcon({ className: "", html: '<div class="punto-utente"></div>', iconSize: [18, 18] }), title: "Tu sei qui" }).addTo(mappa),
        ];
        mappa.fitBounds([...limiti, pos], { padding: [50, 50], maxZoom: 18 });
        ok(coords);
      },
      (e) => errore(new Error(e.code === 1 ? "Permesso negato: puoi attivarlo dalle impostazioni del browser." : "Posizione non disponibile in questo momento.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}
