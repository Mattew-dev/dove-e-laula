// Normalizzazione dei testi di ricerca: "Aula 43B-2" = "43b2" = "43 B 2".

// Parole che non distinguono un'aula da un'altra e che l'utente può scrivere o no.
const PAROLE_VUOTE = /\b(l'aula|aula|aule)\b/g;

/** Minuscole, senza accenti, senza "aula", senza spazi/trattini/punteggiatura. */
export function normalizza(testo) {
  return String(testo ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(PAROLE_VUOTE, " ")
    .replace(/[^a-z0-9]/g, "");
}

/** Le chiavi con cui un nome o alias viene trovato: "ex FAC1" si trova anche come "fac1". */
export function chiavi(testo) {
  const k = normalizza(testo);
  const out = new Set(k ? [k] : []);
  const senzaEx = normalizza(String(testo).replace(/^\s*ex\s+/i, ""));
  if (senzaEx) out.add(senzaEx);
  return [...out];
}
