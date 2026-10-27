import config from "../config.js";
import { creaIndice, cerca, auleDelCubo } from "./ricerca.js";
import { normalizza } from "./normalizza.js";
import { isApple, linkNavigazione, linkSegnalazione } from "./link.js";
import { mostraMappa, chiudiMappa, mostraPosizione } from "./mappa.js";
import * as memoria from "./storage.js";

const $ = (s) => document.querySelector(s);
const vista = $("#vista");
const input = $("#q");
const APPLE = isApple();

let indice = null;
let aule = new Map();
let cubi = new Map();
let aggiornato = "";

// ---------- Utilità di presentazione ----------

const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const dataIt = (iso) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : null);

const LIVELLI = {
  carrabile: "Ponte carrabile (livello superiore)",
  pedonale: "Ponte pedonale (livello inferiore)",
};
const TIPI = { laboratorio: "Laboratorio", sala_studio: "Sala studio" };
const CAMPI = { edificio: "cubo", piano: "piano", livello: "livello del ponte" };

const nomeEdificio = (id) => cubi.get(id)?.nome ?? id;
const conflitto = (aula, campo) => aula.conflitti.find((c) => c.campo === campo);

/** "Cubo 43B · Ponte carrabile · DIMES" per le righe della lista. */
function riassunto(aula) {
  const parti = [];
  const c = conflitto(aula, "edificio");
  parti.push(c ? `Cubo ${c.valori.map((v) => v.valore).join(" o ")}?` : nomeEdificio(aula.edificio));
  if (aula.piano) parti.push(aula.piano);
  if (aula.livello) parti.push(`Ponte ${aula.livello}`);
  if (aula.dipartimento) parti.push(aula.dipartimento);
  return parti.join(" · ");
}

const etichettaStato = (aula) =>
  aula.stato === "verificata"
    ? '<span class="etichetta ok" title="Una fonte ufficiale indica il cubo e nessuna la contraddice">✓ Verificata</span>'
    : '<span class="etichetta dubbio" title="Le fonti non sono d\'accordo o sono incomplete">⚠ Da verificare</span>';
const etichettaTipo = (aula) => (TIPI[aula.tipo] ? `<span class="etichetta tipo">${TIPI[aula.tipo]}</span>` : "");

function voceAula(aula) {
  return `<li><a class="voce" href="#/aula/${encodeURIComponent(aula.id)}">
    <span class="testo"><span class="nome">${h(aula.nome)}</span> ${aula.stato !== "verificata" ? '<span class="etichetta dubbio">⚠</span>' : ""} ${etichettaTipo(aula)}
    <br><span class="dove">${h(riassunto(aula))}</span></span><span class="freccia" aria-hidden="true">›</span></a></li>`;
}

const ICONA_CAMMINA =
  '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="13.5" cy="4" r="2"/><path d="M10.6 8.2 8 9.6V13h2v-2.2l1.2-.6-1.4 7.1L6.6 21l1.4 1.4 3.6-3.5.8-3.5 2.1 2V22h2v-6.4l-2.2-2.1.6-3c1 1.3 2.6 2.2 4.4 2.3v-2c-1.4-.1-2.5-.9-3.1-2l-1-1.6c-.4-.6-1.1-1-1.8-1-.3 0-.6.1-.9.2z"/></svg>';

function pulsanteNavigazione(punto, testo, primario = true) {
  return `<a class="pulsante ${primario ? "primario" : ""}" href="${h(linkNavigazione(punto, APPLE))}" target="_blank" rel="noopener">${ICONA_CAMMINA}${h(testo)}</a>`;
}

function pulsanteSegnala(testo, contenuto) {
  const url = linkSegnalazione(config.segnalazioni, contenuto);
  return url
    ? `<a class="pulsante piccolo" href="${h(url)}" target="_blank" rel="noopener">${h(testo)}</a>`
    : `<span class="pulsante piccolo" aria-disabled="true" title="Le segnalazioni non sono ancora configurate (config.js)">${h(testo)}</span>
       <p>Le segnalazioni non sono ancora attive.</p>`;
}

const paginaCorrente = () => location.href;

// ---------- Viste ----------

function vistaHome() {
  const pref = memoria.preferiti().map((id) => aule.get(id)).filter(Boolean);
  const rec = memoria.recenti().map((id) => aule.get(id)).filter(Boolean);
  const esempi = ["43B2", "MT1", "ex FAC1", "Iris", "Storia 7", "Aula 45"];
  vista.innerHTML = `
    ${pref.length ? `<h2>Preferiti</h2><ul class="lista">${pref.map(voceAula).join("")}</ul>` : ""}
    ${rec.length ? `<h2>Aperte di recente</h2><ul class="lista">${rec.map(voceAula).join("")}</ul>
      <p><button type="button" class="pulsante piccolo" id="svuota-recenti">Cancella le recenti</button></p>` : ""}
    <h2>Prova a cercare</h2>
    <div class="esempi">${esempi.map((e) => `<button type="button" data-esempio="${h(e)}">${h(e)}</button>`).join("")}</div>
    <div class="box info" style="margin-top:20px">
      <p>Scrivi il nome dell'aula come lo trovi nell'orario: il codice nuovo (<b>43B 2</b>), il nome storico (<b>MT1</b>, <b>Filol 5</b>) o il vecchio nome (<b>ex FAC1</b>). Maiuscole, spazi e trattini non contano.</p>
    </div>
    <p class="piede">${aule.size} aule e spazi · dati aggiornati al ${h(dataIt(aggiornato))} · <a href="#/info">Da dove vengono i dati</a></p>`;
  vista.querySelectorAll("[data-esempio]").forEach((b) =>
    b.addEventListener("click", () => {
      input.value = b.dataset.esempio;
      aggiornaRicerca();
    }),
  );
  $("#svuota-recenti")?.addEventListener("click", () => {
    memoria.svuotaRecenti();
    vistaHome();
  });
}

function vistaRisultati(testo) {
  const { risultati, cubo, dedotto } = cerca(indice, testo);
  const forti = risultati.filter((r) => r.punteggio >= 50);
  const deboli = risultati.filter((r) => r.punteggio < 50);
  let html = "";

  if (cubo) {
    html += `<ul class="lista" style="margin-top:8px"><li><a class="voce speciale" href="#/cubo/${encodeURIComponent(cubo.id)}">
      <span class="testo"><span class="nome">${h(cubo.nome)}</span><br><span class="dove">Vedi il cubo sulla mappa e le aule che contiene</span></span>
      <span class="freccia" aria-hidden="true">›</span></a></li></ul>`;
  }
  if (dedotto) {
    html += `<ul class="lista" style="margin-top:8px"><li><a class="voce speciale" href="#/cubo/${encodeURIComponent(dedotto.cubo.id)}?codice=${encodeURIComponent(testo)}">
      <span class="testo"><span class="nome">${h(dedotto.cubo.nome)}</span> <span class="etichetta dubbio">Posizione dedotta dal codice</span>
      <br><span class="dove">«${h(testo.trim())}» non è nel nostro elenco, ma il codice indica questo cubo</span></span>
      <span class="freccia" aria-hidden="true">›</span></a></li></ul>`;
  }
  if (forti.length) html += `<h2>${forti.length === 1 ? "1 risultato" : `${forti.length} risultati`}</h2><ul class="lista">${forti.map((r) => voceAula(r.aula)).join("")}</ul>`;
  if (deboli.length) html += `<h2>${forti.length ? "Altri nomi simili" : "Forse cercavi"}</h2><ul class="lista">${deboli.map((r) => voceAula(r.aula)).join("")}</ul>`;

  if (!risultati.length && !cubo && !dedotto) {
    html += `<div class="box info" style="margin-top:12px">
      <p><b>Nessuna aula trovata per «${h(testo.trim())}».</b></p>
      <p>Non è nel nostro elenco: preferiamo dirtelo piuttosto che indovinare. Controlla come è scritta nell'orario, oppure segnalacela così la aggiungiamo.</p>
    </div>`;
  }
  if (!forti.length) {
    html += `<div class="segnala">${pulsanteSegnala("Segnala un'aula mancante", {
      titolo: `Aula mancante: ${testo.trim()}`,
      righe: [`**Aula cercata:** ${testo.trim()}`, "", "**Cubo (se lo sai):**", "", "**Piano (se lo sai):**", "", "**Dove hai trovato il nome (orario, avviso…):**", ""],
    })}</div>`;
  }
  vista.innerHTML = html;
}

function righeDove(aula) {
  const riga = (etichetta, campo, valore) => {
    const c = conflitto(aula, campo);
    if (c) return `<dt>${etichetta}</dt><dd class="incerto">Incerto: ${c.valori.map((v) => h(campo === "edificio" ? nomeEdificio(v.valore) : campo === "livello" ? LIVELLI[v.valore] ?? v.valore : v.valore)).join(" oppure ")}</dd>`;
    return valore ? `<dt>${etichetta}</dt><dd>${h(valore)}</dd>` : null;
  };
  const righe = [
    riga("Edificio", "edificio", aula.edificio && nomeEdificio(aula.edificio)),
    riga("Piano", "piano", aula.piano),
    riga("Livello", "livello", LIVELLI[aula.livello]),
    aula.dipartimento ? `<dt>Dipartimento</dt><dd>${h(aula.dipartimento)}</dd>` : null,
  ].filter(Boolean);
  if (!aula.piano && !aula.livello && !conflitto(aula, "piano") && !conflitto(aula, "livello")) {
    righe.splice(1, 0, '<dt>Piano</dt><dd class="assente">Non indicato dalle fonti</dd>');
  }
  return `<dl class="righe">${righe.join("")}</dl>`;
}

/** Spiegazione generale per orientarsi, ricavata dalla mappa ufficiale (vedi README). */
function orientamento(idCubo) {
  const m = /^(\d+)([A-Z])$/.exec(idCubo ?? "");
  if (!m) return "";
  return `<p>I cubi sono numerati lungo il Ponte Pietro Bucci da sud (cubo 0) a nord (cubo 46). Nello stesso numero, le lettere vanno da est (A) verso ovest (D). Per il <b>cubo ${h(idCubo)}</b> cerca il numero ${h(m[1])} lungo il ponte, poi la lettera ${h(m[2])}.</p>`;
}

const SPIEGA_LIVELLI = "<p>Il ponte ha due livelli: sopra il ponte carrabile, sotto il ponte pedonale.</p>";

/** I punti da mostrare sulla mappa: uno, o tutti i candidati se le fonti sono in conflitto sul cubo. */
function puntiAula(aula) {
  const c = conflitto(aula, "edificio");
  const ids = c ? c.valori.map((v) => v.valore) : [aula.edificio];
  return ids.map((id) => cubi.get(id)).filter(Boolean).map((cubo) => ({ cubo, lat: cubo.lat, lon: cubo.lon, etichetta: cubo.nome, approssimata: cubo.precisione === "approssimata" }));
}

function blocchiMappa(punti) {
  const appross = punti.some((p) => p.approssimata);
  return `<div class="mappa" id="mappa" role="img" aria-label="Mappa con ${h(punti.map((p) => p.etichetta).join(", "))}"></div>
    <div class="mappa-azioni"><button type="button" class="pulsante piccolo" id="mia-posizione">📍 Mostra dove sono io</button></div>
    <p class="didascalia" id="esito-posizione">${appross ? "⚠ Posizione approssimata: la fonte non indica il cubo esatto. " : ""}Il segnaposto indica il cubo, non l'ingresso dell'aula.</p>`;
}

function attivaMappa(punti) {
  mostraMappa($("#mappa"), punti);
  $("#mia-posizione").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    b.textContent = "Cerco la tua posizione…";
    try {
      await mostraPosizione();
      b.textContent = "📍 Aggiorna la mia posizione";
    } catch (err) {
      $("#esito-posizione").textContent = err.message;
      b.textContent = "📍 Mostra dove sono io";
    }
    b.disabled = false;
  });
}

function barraAzioni(punti, idPreferito) {
  const appross = punti.some((p) => p.approssimata);
  const nav =
    punti.length === 1
      ? pulsanteNavigazione(punti[0], appross ? "Portami lì (zona approssimata)" : "Portami lì")
      : punti.map((p, i) => pulsanteNavigazione(p, `Vai al ${p.etichetta}`, i === 0)).join("");
  const stella = idPreferito
    ? `<button type="button" class="pulsante stella" id="preferito" aria-pressed="${memoria.isPreferito(idPreferito)}" aria-label="Salva nei preferiti">${memoria.isPreferito(idPreferito) ? "★" : "☆"}</button>`
    : "";
  return `<div class="barra-azioni"><div class="dentro">${nav}${stella}</div></div>`;
}

function attivaPreferito(id) {
  $("#preferito")?.addEventListener("click", (e) => {
    const attivo = memoria.cambiaPreferito(id);
    e.currentTarget.setAttribute("aria-pressed", attivo);
    e.currentTarget.textContent = attivo ? "★" : "☆";
  });
}

function vistaAula(id) {
  const aula = aule.get(id);
  if (!aula) return vistaNonTrovata();
  memoria.aggiungiRecente(id);
  const punti = puntiAula(aula);
  // Gli alias che differiscono dal nome solo per "Aula", spazi o maiuscole non dicono niente di nuovo.
  const visti = new Set([normalizza(aula.nome)]);
  const alias = aula.alias.filter((a) => !visti.has(normalizza(a)) && visti.add(normalizza(a)));

  const conflitti = aula.conflitti.length
    ? `<div class="box dubbio"><p><b>Le fonti non sono d'accordo</b>, quindi non scegliamo noi:</p><ul>${aula.conflitti
        .map((c) => `<li>${h(CAMPI[c.campo] ?? c.campo)}: ${c.valori.map((v) => `<b>${h(c.campo === "edificio" ? nomeEdificio(v.valore) : v.valore)}</b> (<a href="${h(v.fonte)}" target="_blank" rel="noopener">fonte</a>)`).join(" oppure ")}</li>`)
        .join("")}</ul></div>`
    : "";
  const fonti = aula.fonti
    .map((f) => `<li><a href="${h(f.url)}" target="_blank" rel="noopener">${h(f.titolo)}</a><br>${f.data_fonte ? `Documento del ${h(dataIt(f.data_fonte))}` : "Pagina senza data"} · consultata il ${h(dataIt(f.consultata_il))}</li>`)
    .join("");

  vista.innerHTML = `
    <a href="#/" class="indietro" data-indietro>‹ Indietro</a>
    <h1>${h(aula.nome)}</h1>
    <p>${etichettaStato(aula)} ${etichettaTipo(aula)}</p>
    ${alias.length ? `<p class="alias">Conosciuta anche come: ${alias.map(h).join(", ")}</p>` : ""}
    <div class="scheda">${righeDove(aula)}</div>
    ${conflitti}
    ${aula.note ? `<div class="box ${aula.stato === "verificata" ? "info" : "dubbio"}"><p>${h(aula.note)}</p></div>` : ""}
    ${aula.indicazioni ? `<h2>Come arrivarci</h2><div class="box info"><p>${h(aula.indicazioni)}</p></div>` : ""}
    ${punti.length ? blocchiMappa(punti) : ""}
    ${punti.length === 1 && punti[0].cubo.tipo === "cubo" ? `<h2>Per orientarti</h2><div class="box info">${orientamento(punti[0].cubo.id)}${aula.livello ? SPIEGA_LIVELLI : ""}<p><a href="#/cubo/${encodeURIComponent(punti[0].cubo.id)}">Tutte le aule del ${h(punti[0].cubo.nome)} ›</a></p></div>` : ""}
    <h2>Fonti</h2>
    <ul class="fonti">${fonti}</ul>
    <div class="segnala">${pulsanteSegnala("Segnala un errore", {
      titolo: `Errore: ${aula.nome} (${aula.id})`,
      righe: [`**Aula:** ${aula.nome} (id: ${aula.id})`, `**Nel dataset:** ${riassunto(aula)}`, "", "**Cosa è sbagliato?**", "", "**Fonte (se ce l'hai):**", "", `_Inviata da ${paginaCorrente()}_`],
    })}</div>
    ${punti.length ? barraAzioni(punti, aula.id) : ""}`;
  if (punti.length) attivaMappa(punti);
  attivaPreferito(aula.id);
}

function vistaCubo(id, codice) {
  const cubo = cubi.get(id);
  if (!cubo) return vistaNonTrovata();
  const punti = [{ cubo, lat: cubo.lat, lon: cubo.lon, etichetta: cubo.nome, approssimata: cubo.precisione === "approssimata" }];
  const contenute = auleDelCubo(indice, id);
  vista.innerHTML = `
    <a href="#/" class="indietro" data-indietro>‹ Indietro</a>
    <h1>${h(cubo.nome)}</h1>
    ${codice ? `<div class="box dubbio">
      <p><b>Posizione dedotta dal codice.</b> «${h(codice)}» non è nel nostro elenco: dal codice ricaviamo solo il cubo, non il piano né il livello del ponte.</p>
      <p>Una volta nel cubo, cerca le indicazioni sul posto.</p></div>` : ""}
    ${cubo.note ? `<div class="box dubbio"><p>${h(cubo.note)}</p></div>` : ""}
    ${blocchiMappa(punti)}
    ${cubo.tipo === "cubo" ? `<h2>Per orientarti</h2><div class="box info">${orientamento(cubo.id)}</div>` : ""}
    <h2>${contenute.length ? `Nel nostro elenco (${contenute.length})` : "Nessuna aula di questo cubo nel nostro elenco"}</h2>
    ${contenute.length ? `<ul class="lista">${contenute.map(voceAula).join("")}</ul>` : ""}
    ${codice ? `<div class="segnala">${pulsanteSegnala("Segnala l'aula mancante", {
      titolo: `Aula mancante: ${codice}`,
      righe: [`**Aula cercata:** ${codice}`, `**Cubo dedotto dal codice:** ${cubo.id}`, "", "**Piano (se lo sai):**", "", "**Dove hai trovato il nome (orario, avviso…):**", ""],
    })}</div>` : ""}
    <p class="didascalia">Coordinate: ${cubo.precisione === "mappa_ufficiale" ? `<a href="${h(cubo.fonte)}" target="_blank" rel="noopener">mappa ufficiale Unical</a>` : "approssimate"}</p>
    ${barraAzioni(punti, null)}`;
  attivaMappa(punti);
}

function vistaInfo() {
  const n = [...aule.values()];
  const verificate = n.filter((a) => a.stato === "verificata").length;
  vista.innerHTML = `
    <a href="#/" class="indietro" data-indietro>‹ Indietro</a>
    <h1>Da dove vengono i dati</h1>
    <div class="box info">
      <p>L'elenco contiene <b>${n.length}</b> aule, laboratori e sale studio. <b>${verificate}</b> sono verificate.</p>
      <p>I dati vengono dalle pagine ufficiali dei dipartimenti e da documenti pubblicati su unical.it. Ogni scheda indica le sue fonti.</p>
      <p><b>Verificata</b> vuol dire che almeno una fonte ufficiale indica il cubo e nessun'altra lo contraddice. <b>Da verificare</b> vuol dire che le fonti non sono d'accordo o sono incomplete: in quel caso mostriamo tutte le possibilità, senza sceglierne una.</p>
      <p>Le posizioni dei cubi vengono dalla <a href="https://www.google.com/maps/d/viewer?mid=17RXFIMpyGYs5LC7TGMFLzcFw52Q" target="_blank" rel="noopener">mappa ufficiale Unical</a>. Il segnaposto indica il cubo, non la porta dell'aula.</p>
      <p>Dati aggiornati al ${h(dataIt(aggiornato))}. App non ufficiale, realizzata da studenti.</p>
    </div>
    <div class="segnala">${pulsanteSegnala("Segnala un errore o un'aula mancante", { titolo: "Segnalazione", righe: ["**Cosa vuoi segnalare?**", ""] })}</div>`;
}

function vistaNonTrovata() {
  vista.innerHTML = `<a href="#/" class="indietro">‹ Torna alla ricerca</a><div class="box info"><p>Questa pagina non esiste (forse il link è vecchio).</p></div>`;
}

// ---------- Navigazione ----------

function rotta() {
  const [percorso, query] = location.hash.replace(/^#/, "").split("?");
  const parti = percorso.split("/").filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(query ?? "");
  chiudiMappa();
  if (parti[0] === "aula") vistaAula(parti[1]);
  else if (parti[0] === "cubo") vistaCubo(parti[1], params.get("codice"));
  else if (parti[0] === "info") vistaInfo();
  else return mostraHomeORisultati();
  vista.querySelector("[data-indietro]")?.addEventListener("click", (e) => {
    // Se siamo arrivati da un'altra pagina dell'app, "Indietro" torna lì (con la ricerca ancora scritta).
    if (history.state?.profondita > 0) {
      e.preventDefault();
      history.back();
    }
  });
  window.scrollTo(0, 0);
}

// Ogni voce di cronologia creata dall'app ricorda quanto è "profonda": 0 = la prima pagina aperta.
let profondita = 0;
function segnaProfondita() {
  if (typeof history.state?.profondita === "number") profondita = history.state.profondita; // avanti/indietro
  else history.replaceState({ profondita: ++profondita }, ""); // nuova pagina
}

function mostraHomeORisultati() {
  const t = input.value.trim();
  t ? vistaRisultati(t) : vistaHome();
}

function aggiornaRicerca() {
  $("#svuota").hidden = !input.value;
  if (location.hash && location.hash !== "#/") {
    history.pushState({ profondita: ++profondita }, "", "#/");
    chiudiMappa();
  }
  mostraHomeORisultati();
}

// ---------- Tema ----------

const ICONE_TEMA = { null: "◐", light: "☀", dark: "☾" };
const NOMI_TEMA = { null: "automatico", light: "chiaro", dark: "scuro" };
function mostraTema() {
  const t = memoria.leggiTema();
  $("#tema").textContent = ICONE_TEMA[t];
  $("#tema").setAttribute("aria-label", `Tema ${NOMI_TEMA[t]}: tocca per cambiarlo`);
  $("#tema").title = `Tema ${NOMI_TEMA[t]}`;
}
$("#tema").addEventListener("click", () => {
  const ordine = [null, "light", "dark"];
  const prossimo = ordine[(ordine.indexOf(memoria.leggiTema()) + 1) % ordine.length];
  memoria.salvaTema(prossimo);
  if (prossimo) document.documentElement.dataset.theme = prossimo;
  else delete document.documentElement.dataset.theme;
  mostraTema();
});

// ---------- Avvio ----------

async function avvia() {
  mostraTema();
  try {
    const [a, c] = await Promise.all(["data/aule.json", "data/cubi.json"].map((f) => fetch(f).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))));
    aule = new Map(a.aule.map((x) => [x.id, x]));
    cubi = new Map(c.cubi.map((x) => [x.id, x]));
    aggiornato = a.aggiornato;
    indice = creaIndice(a.aule, c.cubi);
  } catch {
    vista.innerHTML = '<div class="box dubbio"><p>Non riesco a caricare l\'elenco delle aule. Controlla la connessione e ricarica la pagina.</p></div>';
    return;
  }
  input.addEventListener("input", aggiornaRicerca);
  $("#form-cerca").addEventListener("submit", (e) => {
    e.preventDefault();
    input.blur(); // chiude la tastiera e lascia vedere i risultati
  });
  $("#svuota").addEventListener("click", () => {
    input.value = "";
    aggiornaRicerca();
    input.focus();
  });
  history.replaceState({ profondita: 0 }, "");
  window.addEventListener("hashchange", () => {
    segnaProfondita();
    rotta();
  });
  rotta();
}

const statoRete = () => ($("#offline").hidden = navigator.onLine);
window.addEventListener("online", statoRete);
window.addEventListener("offline", statoRete);
statoRete();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

avvia();
