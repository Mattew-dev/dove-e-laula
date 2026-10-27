// Riconosce i codici della nuova numerazione e ne ricava SOLO il cubo.
// Formati visti nelle fonti:
//   cubo + numero          43B2, 29C 3, 5B3       (il numero NON è il piano)
//   cubo + piano + lettera 39B 1A, 41B0A          (DINCI/DIMES)
//   solo cubo              43B, cubo 43/B
import { normalizza } from "./normalizza.js";

const CODICE = /^(?:cubo)?(\d{1,2})([a-z])(\d{1,2}[a-z]?)?$/;

/**
 * @param {string} testo  quello che ha scritto l'utente
 * @param {Set<string>} cubiNoti  id dei cubi in cubi.json (es. "43B")
 * @returns {{cubo: string, resto: string|null} | null}  null se non è un codice o il cubo non esiste
 */
export function parseCodice(testo, cubiNoti) {
  const m = normalizza(testo).match(CODICE);
  if (!m) return null;
  const cubo = String(Number(m[1])) + m[2].toUpperCase();
  if (!cubiNoti.has(cubo)) return null;
  return { cubo, resto: m[3] ? m[3].toUpperCase() : null };
}
