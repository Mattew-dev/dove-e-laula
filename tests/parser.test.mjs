import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCodice } from "../js/parser.js";

const CUBI = new Set(["5B", "29C", "39B", "41B", "43B", "44Z"]);

test("cubo + numero (nuova numerazione)", () => {
  assert.deepEqual(parseCodice("43B 2", CUBI), { cubo: "43B", resto: "2" });
  assert.deepEqual(parseCodice("Aula 43b-2", CUBI), { cubo: "43B", resto: "2" });
  assert.deepEqual(parseCodice("29C3", CUBI), { cubo: "29C", resto: "3" });
  assert.deepEqual(parseCodice("5B 3", CUBI), { cubo: "5B", resto: "3" });
});

test("cubo + piano + lettera (formato DINCI/DIMES)", () => {
  assert.deepEqual(parseCodice("39B 1A", CUBI), { cubo: "39B", resto: "1A" });
  assert.deepEqual(parseCodice("41B0A", CUBI), { cubo: "41B", resto: "0A" });
});

test("solo il cubo", () => {
  assert.deepEqual(parseCodice("43B", CUBI), { cubo: "43B", resto: null });
  assert.deepEqual(parseCodice("cubo 43/b", CUBI), { cubo: "43B", resto: null });
  assert.deepEqual(parseCodice("Cubo 44Z", CUBI), { cubo: "44Z", resto: null });
});

test("lo zero iniziale non crea un cubo diverso", () => {
  assert.deepEqual(parseCodice("05B3", CUBI), { cubo: "5B", resto: "3" });
});

test("cubi che non esistono: nessuna deduzione", () => {
  assert.equal(parseCodice("99Z1", CUBI), null);
  assert.equal(parseCodice("43X2", CUBI), null);
});

test("testi che non sono codici", () => {
  for (const s of ["MT1", "Iris", "ex FAC1", "", "43", "B2", "43B 123", "Storia 7"]) {
    assert.equal(parseCodice(s, CUBI), null, s);
  }
});
