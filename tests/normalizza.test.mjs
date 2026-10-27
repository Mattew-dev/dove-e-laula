import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizza, chiavi } from "../js/normalizza.js";

test("maiuscole, spazi e trattini non contano", () => {
  for (const s of ["43b2", "43B 2", "Aula 43B-2", " aula 43 b 2 ", "43/B.2", "AULA 43B2"]) {
    assert.equal(normalizza(s), "43b2", s);
  }
});

test("accenti e apostrofi", () => {
  assert.equal(normalizza("Aula Gödel"), "godel");
  assert.equal(normalizza("l'aula Iris"), "iris");
  assert.equal(normalizza("Laboratorio “Saverio Marra”"), "laboratoriosaveriomarra");
});

test("'aula' viene tolta solo come parola intera", () => {
  assert.equal(normalizza("Aula Magna"), "magna");
  assert.equal(normalizza("Aulario"), "aulario");
  assert.equal(normalizza("Auletta 46C"), "auletta46c");
});

test("input vuoti", () => {
  assert.equal(normalizza(""), "");
  assert.equal(normalizza(null), "");
  assert.equal(normalizza("  - "), "");
});

test("gli alias 'ex ...' si trovano con e senza 'ex'", () => {
  assert.deepEqual(chiavi("ex FAC1").sort(), ["exfac1", "fac1"]);
  assert.deepEqual(chiavi("Aula MT1"), ["mt1"]);
  assert.deepEqual(chiavi("Index"), ["index"]); // "ex" solo come parola iniziale
});
