// Ricerca tollerante su nomi e alias, con fuzzy matching per i refusi.
import { normalizza, chiavi } from "./normalizza.js";
import { parseCodice } from "./parser.js";

/** Distanza di Damerau-Levenshtein (versione "optimal string alignment"). */
export function distanza(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + costo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Quanti errori tolleriamo. Sui codici ("43b2", "mt9", "ds11") un carattere diverso è un'altra aula
// (43B2 → 43B3), quindi niente refusi: solo sui nomi.
const sembraCodice = (q) => /^\d|^[a-z]{1,4}\d+[a-z]?$/.test(q);
const sogliaRefusi = (q) => (sembraCodice(q) || q.length <= 3 ? 0 : q.length <= 6 ? 1 : 2);

export function creaIndice(aule, cubi) {
  const voci = aule.map((aula) => {
    const nomi = [aula.nome, ...aula.alias];
    return {
      aula,
      chiavi: [...new Set(nomi.flatMap(chiavi))],
      // Le singole parole servono per i refusi su un pezzo del nome ("Burgarela" → "Storia 1 – Filippo Burgarella").
      parole: [...new Set(nomi.flatMap((n) => n.split(/[\s\-–—/(),.“”"]+/)).map(normalizza).filter((p) => p.length >= 4))],
    };
  });
  return { voci, cubi: new Map(cubi.map((c) => [c.id, c])) };
}

/**
 * @returns {{
 *   risultati: {aula: object, punteggio: number, esatto: boolean}[],
 *   cubo: object|null,          // l'utente ha scritto proprio un cubo ("43B", "cubo 43b")
 *   dedotto: {cubo: object, codice: string}|null  // codice non in elenco ma cubo riconosciuto
 * }}
 */
export function cerca(indice, testo, max = 30) {
  const q = normalizza(testo);
  if (!q) return { risultati: [], cubo: null, dedotto: null };

  const soglia = sogliaRefusi(q);
  // I numeri devono coincidere: "Stoira 7" → Storia 7 sì, "FAC1" → FAC2 no.
  const cifre = (s) => s.replace(/\D/g, "");
  const cifreQ = cifre(q);
  const simile = (k, base) => {
    if (!soglia || Math.abs(k.length - q.length) > soglia || cifre(k) !== cifreQ) return 0;
    const d = distanza(q, k);
    return d <= soglia ? base - d * 10 : 0;
  };

  const risultati = [];
  for (const v of indice.voci) {
    let migliore = 0;
    for (const k of v.chiavi) {
      let p = 0;
      if (k === q) p = 100;
      else if (q.length >= 2 && k.startsWith(q)) p = 80 - Math.min(k.length - q.length, 20);
      else if (q.length >= 3 && k.includes(q)) p = 60 - Math.min(k.length - q.length, 20);
      else p = simile(k, 35);
      if (p > migliore) migliore = p;
    }
    for (const k of v.parole) {
      const p = k === q ? 70 : q.length >= 3 && k.startsWith(q) ? 55 : simile(k, 30);
      if (p > migliore) migliore = p;
    }
    if (migliore) risultati.push({ aula: v.aula, punteggio: migliore, esatto: migliore === 100 });
  }
  risultati.sort((a, b) => b.punteggio - a.punteggio || a.aula.nome.localeCompare(b.aula.nome, "it"));

  const codice = parseCodice(testo, new Set(indice.cubi.keys()));
  const cubo = codice && !codice.resto ? indice.cubi.get(codice.cubo) : null;
  const dedotto =
    codice && codice.resto && !risultati.some((r) => r.esatto)
      ? { cubo: indice.cubi.get(codice.cubo), codice: codice.cubo + " " + codice.resto }
      : null;

  return { risultati: risultati.slice(0, max), cubo, dedotto };
}

/** Tutte le voci di un cubo (per la scheda del cubo). */
export function auleDelCubo(indice, idCubo) {
  return indice.voci
    .map((v) => v.aula)
    .filter((a) => a.edificio === idCubo || a.conflitti.some((c) => c.campo === "edificio" && c.valori.some((x) => x.valore === idCubo)))
    .sort((a, b) => a.nome.localeCompare(b.nome, "it", { numeric: true }));
}
