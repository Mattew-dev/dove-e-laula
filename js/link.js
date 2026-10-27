// Link esterni: navigazione a piedi e segnalazioni precompilate.

export function isApple(ua = navigator.userAgent, puntiTocco = navigator.maxTouchPoints) {
  // iPadOS si presenta come "Macintosh": lo riconosciamo dal touch.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && puntiTocco > 1);
}

export function linkNavigazione({ lat, lon }, apple) {
  return apple
    ? `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
}

/**
 * @param {object} config  la sezione `segnalazioni` di config.js
 * @param {{titolo: string, righe: string[]}} contenuto
 * @returns {string|null}  null se le segnalazioni non sono configurate
 */
export function linkSegnalazione(config, { titolo, righe }) {
  const testo = righe.join("\n");
  if (config.tipo === "github") {
    if (!config.repo || config.repo.includes("TUO-UTENTE")) return null;
    const p = new URLSearchParams({ title: titolo, body: testo });
    if (config.etichetta) p.set("labels", config.etichetta);
    return `https://github.com/${config.repo}/issues/new?${p}`;
  }
  if (config.tipo === "google-form") {
    if (!config.url) return null;
    const p = new URLSearchParams({ usp: "pp_url" });
    if (config.campoTitolo) p.set(config.campoTitolo, titolo);
    if (config.campoDettagli) p.set(config.campoDettagli, testo);
    return `${config.url}?${p}`;
  }
  return null;
}
