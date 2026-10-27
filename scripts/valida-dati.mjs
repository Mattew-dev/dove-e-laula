// Controlla la coerenza di data/aule.json e data/cubi.json.
// Uso: node scripts/valida-dati.mjs   (esce con codice 1 se trova errori)
import { readFileSync } from "node:fs";

const leggi = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const { aule } = leggi("aule.json");
const { cubi } = leggi("cubi.json");

const errori = [];
const avvisi = [];
const idCubi = new Set();
const LIVELLI = [null, "carrabile", "pedonale"];
const STATI = ["verificata", "da_verificare"];
const TIPI = ["aula", "laboratorio", "sala_studio"];
const PRECISIONI = ["mappa_ufficiale", "osm", "approssimata"];

for (const c of cubi) {
  if (idCubi.has(c.id)) errori.push(`cubo duplicato: ${c.id}`);
  idCubi.add(c.id);
  if (!PRECISIONI.includes(c.precisione)) errori.push(`cubo ${c.id}: precisione non valida "${c.precisione}"`);
  // Il campus sta tutto in questo riquadro: una coordinata fuori è sicuramente sbagliata.
  if (!(c.lat > 39.34 && c.lat < 39.38 && c.lon > 16.21 && c.lon < 16.24)) errori.push(`cubo ${c.id}: coordinate fuori dal campus`);
}

const idAule = new Set();
const perNome = new Map();
for (const a of aule) {
  const dove = `aula ${a.id}`;
  if (idAule.has(a.id)) errori.push(`${dove}: id duplicato`);
  idAule.add(a.id);
  if (!a.nome) errori.push(`${dove}: nome mancante`);
  if (!a.fonti?.length) errori.push(`${dove}: nessuna fonte`);
  for (const f of a.fonti ?? []) if (!/^https?:\/\//.test(f.url)) errori.push(`${dove}: url fonte non valido`);
  if (!STATI.includes(a.stato)) errori.push(`${dove}: stato non valido "${a.stato}"`);
  if (!TIPI.includes(a.tipo)) errori.push(`${dove}: tipo non valido "${a.tipo}"`);
  if (!LIVELLI.includes(a.livello)) errori.push(`${dove}: livello non valido "${a.livello}"`);
  if (a.conflitti?.length && a.stato === "verificata") errori.push(`${dove}: ha conflitti ma è "verificata"`);
  const edificioConteso = a.conflitti?.some((c) => c.campo === "edificio");
  if (!a.edificio && !edificioConteso) errori.push(`${dove}: edificio mancante`);
  if (a.edificio && !idCubi.has(a.edificio)) errori.push(`${dove}: edificio "${a.edificio}" non presente in cubi.json`);
  for (const c of a.conflitti ?? []) for (const v of c.valori) {
    if (c.campo === "edificio" && !idCubi.has(v.valore)) errori.push(`${dove}: edificio in conflitto "${v.valore}" non presente in cubi.json`);
  }
  const chiave = a.nome.toLowerCase().replace(/[^a-z0-9]/g, "");
  perNome.set(chiave, [...(perNome.get(chiave) ?? []), a.id]);
}
for (const [nome, ids] of perNome) if (ids.length > 1) avvisi.push(`nome ripetuto "${nome}": ${ids.join(", ")}`);

for (const a of avvisi) console.log("avviso:", a);
for (const e of errori) console.error("ERRORE:", e);
console.log(`${aule.length} aule, ${cubi.length} edifici, ${errori.length} errori, ${avvisi.length} avvisi`);
process.exit(errori.length ? 1 : 0);
