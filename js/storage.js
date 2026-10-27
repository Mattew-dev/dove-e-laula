// Preferiti e voci aperte di recente, solo su questo dispositivo.
// localStorage può mancare (navigazione privata, dati bloccati): l'app deve funzionare lo stesso.

function leggi(chiave) {
  try {
    const v = JSON.parse(localStorage.getItem(chiave));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function scrivi(chiave, valore) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
  } catch {}
}

const MAX_RECENTI = 8;

export const preferiti = () => leggi("preferiti");
export const isPreferito = (id) => preferiti().includes(id);
export function cambiaPreferito(id) {
  const p = preferiti();
  const nuovo = p.includes(id) ? p.filter((x) => x !== id) : [id, ...p];
  scrivi("preferiti", nuovo);
  return nuovo.includes(id);
}

export const recenti = () => leggi("recenti");
export function aggiungiRecente(id) {
  scrivi("recenti", [id, ...recenti().filter((x) => x !== id)].slice(0, MAX_RECENTI));
}
export const svuotaRecenti = () => scrivi("recenti", []);

export function leggiTema() {
  try { return localStorage.getItem("tema"); } catch { return null; }
}
export function salvaTema(tema) {
  try { tema ? localStorage.setItem("tema", tema) : localStorage.removeItem("tema"); } catch {}
}
