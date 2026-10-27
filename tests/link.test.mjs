import { test } from "node:test";
import assert from "node:assert/strict";
import { isApple, linkNavigazione, linkSegnalazione } from "../js/link.js";

const P = { lat: 39.366194, lon: 16.225581 };

test("navigazione a piedi: Apple Maps su iOS, Google Maps altrove", () => {
  assert.equal(linkNavigazione(P, true), "https://maps.apple.com/?daddr=39.366194,16.225581&dirflg=w");
  assert.equal(linkNavigazione(P, false), "https://www.google.com/maps/dir/?api=1&destination=39.366194,16.225581&travelmode=walking");
});

test("riconoscimento iOS, compreso iPadOS", () => {
  assert.equal(isApple("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", 5), true);
  assert.equal(isApple("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5), true);
  assert.equal(isApple("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0), false);
  assert.equal(isApple("Mozilla/5.0 (Linux; Android 14)", 5), false);
});

test("segnalazione GitHub precompilata", () => {
  const url = new URL(linkSegnalazione({ tipo: "github", repo: "mario/dove-e-laula", etichetta: "segnalazione" }, { titolo: "Errore: 43B2", righe: ["a", "b"] }));
  assert.equal(url.pathname, "/mario/dove-e-laula/issues/new");
  assert.equal(url.searchParams.get("title"), "Errore: 43B2");
  assert.equal(url.searchParams.get("body"), "a\nb");
  assert.equal(url.searchParams.get("labels"), "segnalazione");
});

test("segnalazioni non configurate", () => {
  assert.equal(linkSegnalazione({ tipo: "github", repo: "TUO-UTENTE/dove-e-laula" }, { titolo: "x", righe: [] }), null);
  assert.equal(linkSegnalazione({ tipo: "google-form", url: "" }, { titolo: "x", righe: [] }), null);
});

test("segnalazione Google Form precompilata", () => {
  const url = new URL(linkSegnalazione({ tipo: "google-form", url: "https://docs.google.com/forms/d/e/X/viewform", campoTitolo: "entry.1", campoDettagli: "entry.2" }, { titolo: "T", righe: ["r"] }));
  assert.equal(url.searchParams.get("entry.1"), "T");
  assert.equal(url.searchParams.get("entry.2"), "r");
  assert.equal(url.searchParams.get("usp"), "pp_url");
});
