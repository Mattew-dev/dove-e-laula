# Dov'è l'aula?

Web app per gli studenti dell'Università della Calabria (campus di Arcavacata). Cerchi un'aula e scopri in che cubo si trova, a che piano e come arrivarci a piedi.

- Ricerca tollerante: `43b2` = `43B 2` = `Aula 43B-2`. Cerca anche negli alias e nei vecchi nomi (`ex FAC1`) e corregge i refusi sui nomi (`Burgarela`). Sui numeri non corregge mai: `FAC1` non diventa `FAC2`.
- Se un codice della nuova numerazione (es. `43B 1`) non è in elenco, l'app mostra il cubo ricavato dal codice e lo dichiara come **posizione dedotta**. Non inventa il piano.
- Ogni scheda riporta le fonti, lo stato (verificata / da verificare) e gli eventuali conflitti tra fonti.
- Mappa OpenStreetMap con la propria posizione (solo se l'utente la chiede) e pulsante **Portami lì**, che apre la navigazione a piedi: Apple Maps su iPhone/iPad, Google Maps altrove.
- Preferiti e voci aperte di recente salvati sul dispositivo.
- È una PWA: si installa sulla schermata Home e la ricerca funziona anche offline.

Sito statico: HTML, CSS e JavaScript senza framework né build. I dati sono file JSON.

## Struttura

```
index.html, css/, js/          l'app
config.js                      link per le segnalazioni (da configurare)
data/aule.json                 aule, laboratori, sale studio
data/cubi.json                 coordinate di cubi ed edifici
data/REPORT.md                 report della raccolta dati: fonti, conflitti, cosa manca
sw.js, manifest.webmanifest    PWA
vendor/leaflet/                Leaflet 1.9.4 (copia locale, così funziona offline)
scripts/valida-dati.mjs        controllo dei dati
scripts/costruisci-dati-iniziali.py   come è stato costruito il dataset iniziale (provenienza)
scripts/genera-icone.py        rigenera le icone PNG
tests/                         test automatici (node --test)
```

## Provarla sul proprio computer

Serve un server locale: il service worker e i moduli JS non funzionano aprendo `index.html` come file.

```bash
python3 -m http.server 8765
```

Poi apri http://localhost:8765.

Durante lo sviluppo il service worker tiene in cache i file dell'app. Se non vedi una modifica: DevTools → Application → Service workers → **Unregister**, poi ricarica. In alternativa spunta "Update on reload".

## Test

Servono Node 20 o più recente. Non ci sono dipendenze da installare.

```bash
npm test
```

I test coprono la normalizzazione, il parser dei codici, la ricerca (sul dataset vero) e i link di navigazione e segnalazione.

## Aggiornare `data/aule.json`

Ogni voce ha questa forma:

```json
{
  "id": "43b2",
  "nome": "43B2",
  "tipo": "aula",
  "alias": ["Aula 43B2"],
  "edificio": "43B",
  "piano": null,
  "livello": "carrabile",
  "dipartimento": "DIMES",
  "indicazioni": null,
  "stato": "verificata",
  "fonti": [{
    "url": "https://dimes.unical.it/dipartimento/organizzazione/strutture/",
    "titolo": "DIMES – Strutture",
    "data_fonte": null,
    "consultata_il": "2026-10-27",
    "riporta": { "nome": "43B2", "edificio": "43B", "livello": "carrabile", "dipartimento": "DIMES" }
  }],
  "conflitti": [],
  "note": null
}
```

Cosa contiene ogni campo:
- **`id`**: unico, in minuscolo. Una volta pubblicato non va più cambiato, perché preferiti e link lo usano.
- **`tipo`**: `aula`, `laboratorio` oppure `sala_studio`.
- **`edificio`**: deve essere un `id` presente in `data/cubi.json`.
- **`piano`**: va copiato com'è scritto nella fonte (es. `"2° piano"`, `"Piano terra"`). Se la fonte non lo dice, `null`. Non va mai ricavato dal codice dell'aula.
- **`livello`**: `"carrabile"` o `"pedonale"` solo se la fonte lo scrive esplicitamente, altrimenti `null`.
- **`indicazioni`**: testo libero su come arrivarci. Compare nella scheda se presente.
- **`fonti[].riporta`**: cosa dice quella fonte. Serve a ricostruire i conflitti.

Le regole:
1. **Mai inventare.** Ogni informazione deve venire da una fonte con URL.
2. **`stato: "verificata"`** solo se almeno una fonte ufficiale Unical indica il cubo e nessun'altra lo contraddice.
3. **Fonti in disaccordo**: lascia vuoto (`null`) il campo conteso, metti `stato: "da_verificare"` e registra il conflitto:
   ```json
   "conflitti": [{ "campo": "edificio", "valori": [
     { "valore": "31A", "fonte": "https://…" },
     { "valore": "30A", "fonte": "https://…" }
   ]}]
   ```
   L'app mostrerà entrambe le possibilità, entrambe sulla mappa.
4. Aggiorna `"aggiornato"` in cima al file.

Poi controlla i dati e lancia i test:

```bash
npm run valida
npm test
```

Il validatore segnala id doppi, edifici inesistenti, coordinate fuori dal campus, voci "verificate" con conflitti, e così via. Gli **avvisi** sui nomi ripetuti sono normali: ad esempio esistono più "Aula A" in dipartimenti diversi, e l'app le mostra tutte.

Per aggiungere un edificio a `data/cubi.json` servono `lat`/`lon` e una `precisione`:
- `mappa_ufficiale`: centro del poligono sulla [mappa ufficiale Unical](https://www.google.com/maps/d/viewer?mid=17RXFIMpyGYs5LC7TGMFLzcFw52Q);
- `osm`: da OpenStreetMap;
- `approssimata`: l'app la mostra con un cerchio tratteggiato e un avviso.

I dati sono serviti "prima dalla rete": una volta pubblicati, i telefoni li ricevono alla prossima apertura con connessione, senza toccare il service worker.

## Configurare le segnalazioni

In `config.js`, il pulsante "Segnala un errore / aula mancante" può aprire una di queste due cose.

**Una issue GitHub precompilata** (predefinito). Imposta `repo: "tuo-utente/dove-e-laula"`. Se vuoi un'etichetta, creala nel repository con lo stesso nome di `etichetta`. Per segnalare serve un account GitHub.

**Un Google Form precompilato.** Non serve un account, quindi è più adatto agli studenti.
1. Crea un form con almeno due domande a risposta breve/paragrafo, ad esempio "Aula" e "Dettagli".
2. Nel form: ⋮ → *Ottieni link precompilato*. Scrivi qualcosa nei campi e copia il link.
3. Nel link trovi parametri come `entry.123456=...`. Imposta:
   ```js
   tipo: "google-form",
   url: "https://docs.google.com/forms/d/e/…/viewform",
   campoTitolo: "entry.123456",
   campoDettagli: "entry.654321",
   ```

Finché `config.js` non è configurato, il pulsante appare disattivato con la scritta "Le segnalazioni non sono ancora attive".

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub (es. `dove-e-laula`) e carica il contenuto di questa cartella.
   ```bash
   git init
   git add .
   git commit -m "Prima versione"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/dove-e-laula.git
   git push -u origin main
   ```
2. Nel repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Dopo un minuto l'app è su `https://TUO-UTENTE.github.io/dove-e-laula/`. Tutti i percorsi sono relativi, quindi funziona anche in una sottocartella.
4. Ricordati di impostare `repo` in `config.js`.

**Quando modifichi l'app** (HTML, CSS, JS): aumenta `VERSIONE` in `sw.js` (es. `"v2"`) e aggiungi a `FILE_APP` gli eventuali file nuovi. Altrimenti chi l'ha installata continua a vedere la versione vecchia. Per i soli dati non serve.

## Note e limiti

- Il segnaposto indica il **cubo**, non l'ingresso dell'aula.
- "Per orientarti" (numeri da sud a nord, lettere da est a ovest) è ricavato dalle posizioni della mappa ufficiale ed è vero per tutti i cubi in `cubi.json`.
- Le tile della mappa vengono da openstreetmap.org e servono la connessione. Offline funzionano la ricerca e le schede.
- App non ufficiale. Cosa è stato verificato e cosa no è scritto in `data/REPORT.md`.

## Licenze

- Mappa: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
- [Leaflet](https://leafletjs.com) © Vladimir Agafonkin, licenza BSD-2 (`vendor/leaflet/LICENSE`).
