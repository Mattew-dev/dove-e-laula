// Test sul dataset vero: se qualcuno cambia aule.json in modo da rompere questi casi, ce ne accorgiamo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { creaIndice, cerca, distanza, auleDelCubo } from "../js/ricerca.js";

const dati = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const indice = creaIndice(dati("aule.json").aule, dati("cubi.json").cubi);
const primo = (q) => cerca(indice, q).risultati[0]?.aula.id;

test("distanza di Damerau-Levenshtein", () => {
  assert.equal(distanza("iris", "iris"), 0);
  assert.equal(distanza("iris", "irsi"), 1); // scambio
  assert.equal(distanza("iris", "iriss"), 1);
  assert.equal(distanza("", "abc"), 3);
});

test("stesso risultato con scritture diverse", () => {
  for (const q of ["43b2", "43B 2", "Aula 43B-2", "aula 43 b 2"]) assert.equal(primo(q), "43b2", q);
});

test("alias e nomi 'ex ...'", () => {
  assert.equal(primo("ex FAC1"), "29c2");
  assert.equal(primo("fac 1"), "29c2");
  assert.equal(primo("ex CF3"), "fis-c1");
  assert.equal(primo("ex DS3"), "41b0a");
  assert.equal(primo("ex MT10"), "turing");
});

test("nomi storici", () => {
  assert.equal(primo("MT1"), "mt1");
  assert.equal(primo("Storia 7"), "storia-7");
  assert.equal(primo("filol 5"), "filol-5");
  assert.equal(primo("Caldora"), "caldora");
});

test("refusi sui nomi lunghi", () => {
  assert.equal(primo("Burgarela"), "burgarella");
  assert.equal(primo("Spezaferro"), "spezzaferro");
  assert.equal(primo("Irsi"), "iris");
});

test("nessun refuso tollerato sui codici", () => {
  assert.ok(!cerca(indice, "mt9").risultati.some((x) => x.aula.id === "mt1"), "MT9 non deve proporre MT1");
  assert.ok(!cerca(indice, "43b2").risultati.some((x) => x.aula.id === "43b3"), "43B2 non deve proporre 43B3");
  assert.ok(!cerca(indice, "43b1").risultati.some((x) => x.aula.id.startsWith("43b")), "43B1 non deve proporre altre 43B");
});

test("refusi sì, ma mai sui numeri", () => {
  assert.equal(primo("Stoira 7"), "storia-7");
  const ids = cerca(indice, "ex fac1").risultati.map((r) => r.aula.id);
  assert.deepEqual(ids, ["29c2"], "ex FAC1 non deve proporre 29C3 (ex FAC2)");
});

test("nomi ripetuti: tutti i risultati, non solo il primo", () => {
  const ids = cerca(indice, "Aula A").risultati.filter((r) => r.esatto).map((r) => r.aula.id);
  assert.ok(ids.includes("mt-a") && ids.includes("fis-a"), ids.join());
});

test("codice non in elenco: cubo dedotto, nessuna aula inventata", () => {
  const r = cerca(indice, "43B 1");
  assert.equal(r.dedotto?.cubo.id, "43B");
  assert.ok(!r.risultati.some((x) => x.esatto));
});

test("codice in elenco: niente deduzione", () => {
  assert.equal(cerca(indice, "43B2").dedotto, null);
});

test("ricerca di un cubo", () => {
  const r = cerca(indice, "cubo 43b");
  assert.equal(r.cubo?.id, "43B");
  const ids = auleDelCubo(indice, "43B").map((a) => a.id);
  assert.ok(ids.includes("43b2") && ids.includes("43b3"));
});

test("nulla di simile: nessun risultato", () => {
  const r = cerca(indice, "zzzzqqq");
  assert.equal(r.risultati.length, 0);
  assert.equal(r.dedotto, null);
  assert.equal(r.cubo, null);
});

test("un'aula con il cubo in conflitto compare in entrambi i cubi", () => {
  assert.ok(auleDelCubo(indice, "31A").some((a) => a.id === "mt5"));
  assert.ok(auleDelCubo(indice, "30A").some((a) => a.id === "mt5"));
});
