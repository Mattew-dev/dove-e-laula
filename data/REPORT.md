# Report raccolta dati – Dov'è l'aula?

Raccolta del 27 ottobre 2026. File prodotti: `data/aule.json`, `data/cubi.json`.
Controllo automatico: `node scripts/valida-dati.mjs` → 0 errori, 9 avvisi (nomi ripetuti, vedi sotto).

## In sintesi

| | |
|---|---|
| Voci nel dataset | **281**: 234 aule, 36 laboratori didattici, 11 sale studio |
| Verificate | **264** |
| Da verificare | **17** (4 con conflitto tra fonti, 13 con altri dubbi) |
| Con piano indicato | 188 |
| Con livello del ponte (carrabile/pedonale) indicato | 27 |
| Fonti diverse usate | 24 pagine/PDF + la mappa ufficiale Unical |
| Edifici con coordinate | 112 (110 dalla mappa ufficiale, 2 approssimati) |

Regole applicate (decise con te):
- **verificata** = almeno una fonte ufficiale Unical indica esplicitamente il cubo/edificio e nessun'altra fonte la contraddice. Il piano può mancare.
- Le fonti più vecchie (prima del 2023) sono incluse con la loro data; se sono l'unica fonte di un'aula, l'aula resta "da verificare". Oggi questo caso non si presenta: le due fonti del 2022 hanno sempre una fonte più recente che le conferma.
- Se due fonti danno valori diversi per lo stesso campo, quel campo resta **vuoto** e il conflitto è registrato in `conflitti`, con le fonti in contrasto. L'app mostrerà entrambe le possibilità, senza sceglierne una.
- `piano` è copiato com'è scritto nella fonte. `livello` è valorizzato solo se la fonte scrive esplicitamente "carrabile" o "pedonale". Non deduco mai il piano dal numero dell'aula.

## Voci per dipartimento

| Dipartimento | Voci | Fonte principale |
|---|---|---|
| DiSU | 32 | disu.unical.it + vecchio portale DSU (Wayback) + PDF AIA 2023 |
| DFSSN (Farmacia) | 30 | dfssn.unical.it |
| DiBEST | 27 | dibest.unical.it |
| DIMES | 25 | dimes.unical.it |
| DEMACS (Matematica e Informatica) | 23 | demacs.unical.it + mat.unical.it |
| DiSPeS | 23 | dispes.unical.it |
| Fisica | 20 | fisica.unical.it + vecchio portale (Wayback) |
| DINCI | 18 | dinci.unical.it |
| DiCES | 15 | dices.unical.it |
| DESF | 14 | desf.unical.it |
| DIMEG | 13 | dimeg.unical.it |
| DIAm | 11 | diam.unical.it |
| DiScAG | 9 | discag.unical.it + desf.unical.it |
| CTC (Chimica) | 16 | ctc.unical.it |
| Non indicato | 5 | PDF "aule esami" 2024 |

### Seconda passata (27 ottobre 2026)

Ho riletto per intero le pagine "Strutture" di tutti i 14 dipartimenti. Nella prima passata avevo preso solo le aule per le lezioni; ora ho aggiunto **30 voci** dalle stesse pagine, tutte con cubo indicato:
- **laboratori didattici**: DEMACS LAB-16C/30A/31A/31B, laboratori DIMES 41C, 7 laboratori di Chimica nel 15C/17C, Elettromagnetismo e Ottica (Fisica), laboratori lingue LS1/LS3 e laboratori di fotografia e audiovisivo (DiSPeS), laboratorio Trasporti (DINCI), 2 laboratori DFSSN che avevo saltato;
- **sale studio**: MT7, DIMES 41C e 44Z, Atrio M (DIMEG), DIAm 45A, Fisica 1 e 2, CTC ex Aula B, Regine Laugier (DiSPeS), Pianificazione Territoriale (DINCI).

Inoltre Storia 7 e CSDIM compaiono anche nel sito DiSU attuale: ora hanno una fonte in più, e la nota su CSDIM «solo nel vecchio portale» non vale più.

Ogni voce ha un nuovo campo `tipo`: `aula`, `laboratorio` o `sala_studio`.

Non ho aggiunto:
- i laboratori di ricerca e le sale riunioni, perché non sono luoghi di lezione;
- il «Laboratorio Multimediale» DiSPeS, perché la fonte scrive «Cubo 0» senza lettera e sulla mappa esistono sia 0B sia 0C;
- i laboratori del Centro Linguistico (citati da DiSU nel «cubo 17/A»), perché la mappa ufficiale mette il CLA in un'altra posizione;
- il vecchio elenco aule di Filosofia e Storia, che ripete quello del vecchio portale DSU.

## Fonti

**PDF ufficiali**
- [Ubicazione aule – AIA Conference](https://www.unical.it/media/medias/2023/Ubicazione_aule_AIA_Conference.pdf) (8 set 2023): 12 aule DiSU, Aula Caldora.
- [Test ammissione SFP – ubicazione aule](https://unical.it/media/publications_attachments/14141/ubicazione_aule.pdf) (9 set 2024): 8 aule "consolidate", con la nuova numerazione (13C1, 19B1, 29B1, 29C1, 32B1, 32C1, 40B1, 40C1).
- [Aule esami](https://www.unical.it/media/publications_attachments/10789/aule_esami.pdf) (18 gen 2024): 6 aule e laboratori, senza dipartimento.

**Pagine "Strutture" dei nuovi siti di dipartimento** (`<dip>.unical.it/dipartimento/organizzazione/strutture/`). Sono le fonti più complete e aggiornate, ma **nessuna riporta una data**: nel dataset hanno `data_fonte: null` e `consultata_il: 2026-10-27`.
DEMACS, Fisica, DiSU, DESF, DiScAG, DIMEG, DIMES, DINCI, DIAm, DiBEST, DiCES, DiSPeS, DFSSN, CTC.

**Vecchi siti**
- mat.unical.it, pagine [Informatica](https://www.mat.unical.it/informatica/Aule) e [Matematica](https://www.mat.unical.it/matematica/Aule). Sono online ma rimandano al "nuovo sito".
- Il vecchio portale `www2.unical.it` non risponde più. Ho usato le copie della Wayback Machine per DSU (dic 2023), Aula FAC 1 (mar 2022), DiSESF (mar 2022), DIMEG (dic 2023) e Fisica (feb 2024).

**Coordinate**
- [Mappa ufficiale Unical su Google My Maps](https://www.google.com/maps/d/viewer?mid=17RXFIMpyGYs5LC7TGMFLzcFw52Q), linkata da [unical.it/campus/visita-il-campus/mappa](https://www.unical.it/campus/visita-il-campus/mappa/). Ha i contorni di quasi tutti i cubi, dei capannoni, del Polifunzionale e dell'Aula Caldora. Come coordinata uso il centro del contorno.

## Conflitti tra fonti (4 aule, campo lasciato vuoto)

| Aula | Campo | Valori | Fonti |
|---|---|---|---|
| MT5 | cubo | **31A** / **30A** | DEMACS e mat.unical.it dicono 31A; DiBEST dice 30A |
| N (DiSU) | cubo | **18B** / **18C** | nuovo sito DiSU 18B; vecchio portale DSU 18C. Sulla mappa ufficiale il 18B è indicato come DiCES |
| Seminari 1 (DiSU) | cubo | **17B** / **18C** | nuovo sito DiSU 17B; vecchio portale DSU 18C |
| 29B1 Danilo Dolci | piano | **4° piano** / **2° piano** | DiBEST 4°; DiCES 2° (il cubo 29B è confermato da 4 fonti) |

(29B1 conta come conflitto sul piano, ma il cubo è certo: sulla mappa la posizione è corretta.)

## Altre aule "da verificare" (13)

- **29C3 (ex FAC 2)**: il PDF AIA scrive «ponte scoperto», DiSU «ponte carrabile». Probabilmente sono la stessa cosa, ma nessuna fonte lo dice.
- **Laboratorio informatica 40B**: DIMES e DIMEG indicano il 7° piano, il PDF esami indica «ponte carrabile».
- **Laboratorio informatica 42D**: DIMES indica il piano terra, il PDF esami indica «ponte carrabile».
- **Seminari Giannattasio (45B)**: la stessa pagina DINCI scrive sia «ponte carrabile» sia «p. 1».
- **MT2, MT3**: compaiono solo sul vecchio sito mat.unical.it. L'elenco DEMACS attuale non le ha più e ha invece una **MT23** nello stesso cubo (31B): forse sono state unite.
- **7 aule di Chimica (CH-15-…, CH-17-…)**: CTC scrive «Cubo 15» e «Cubo 17» senza lettera. Sulla mappa le metto a metà tra 15C/15D e tra 17C/17D, i cubi assegnati a CTC, con `precisione: "approssimata"`.

## Probabili doppioni (tenuti separati, con una nota)

Due nomi diversi che potrebbero indicare la stessa aula. Non li ho uniti perché nessuna fonte lo dice:
- 32C1 (PDF test 2024) ↔ C1, ex CF3 (Fisica): entrambe nel cubo 32C.
- 40B1-DINCI ↔ DINCI 40B (Aula consolidata).
- 40C1 P. Borsellino ↔ DIAm A: entrambe nel 40C, entrambe da 280 posti, sul ponte pedonale.
- 43B (Consolidata), DIMEG ↔ una possibile "43B1", che non compare in nessuna fonte.
- MOD3A (DINCI) ↔ MOD3 (DIMES): stesso cubo, stesso piano.

Unica unione fatta su indizi: **Consolidata 2** (DiScAG) e «CONSOLIDATA 2B» (DiBEST). Hanno stesso cubo (2B) e stessa capienza (375), e la nota lo dichiara. Se preferisci, le separo.

## Nomi ripetuti (avvisi del validatore)

Alcuni nomi esistono in più dipartimenti e in posti diversi: "Aula A" (DEMACS 30A, Fisica 31C), "B", "N", "L1", "L2" (DiBEST cubo 4A, Polifunzionale), "Aula Seminari" (4 dipartimenti), "Aula Informatica 1/2", "Aula Collaborativa". Non sono errori. L'app dovrà mostrare **tutti** i risultati con dipartimento e cubo, senza scegliere il primo.

## Cosa manca

1. **[Ubicazione Seggi Elettorali 2024](https://www.unical.it/media/medias/2024/Ubicazione_Seggi_Elettorali.pdf)**: oggi risponde 404 e non è nella Wayback Machine. **Non usato.**
2. **Alias che mi hai indicato ma non ho trovato in nessuna fonte**: «ex P1 = 40C 2» e «ex ECO2 = 5B 3». Non li ho inseriti.
   - DIMEG chiama ancora l'aula «P1» (cubo 40C, ponte carrabile), senza nuovo nome.
   - La 5B3 esiste (DiBEST, cubo 5B, 4° piano), ma nessuna fonte la chiama ECO2.
   - «ex FAC1 = 29C 2» invece è confermato da DiSU.
3. **University Planner (Cineca)**: le pagine DINCI hanno link "Impegni aula" verso `unical.prod.up.cineca.it`, che probabilmente contiene l'anagrafica completa delle aule di ateneo. L'API però richiede autenticazione (risponde 401) e non ho provato ad aggirarla. È la fonte da chiedere ufficialmente all'Ateneo (es. ufficio logistica o area sistemi) per completare il dataset.
4. **OpenStreetMap**: Overpass era irraggiungibile (502 e timeout). Non è servito: la mappa ufficiale copre tutti gli edifici citati.
5. **Piano mancante per 93 voci**, soprattutto quelle del Polifunzionale. DiSPeS scrive solo «Polifunzionale» per G1–G4, H1–H4, L1, L2, 44, B, quindi anche **Aula H4** è nel dataset ma senza capannone. Le lettere fanno pensare ai capannoni G e H, ma non l'ho dedotto: il marker va sul Polifunzionale.
6. **Siti non raggiunti**: diatic.unical.it (timeout); www2.dimes.unical.it (403, ma il nuovo sito DIMES ha funzionato).
7. **Indicazioni a piedi**: nessuna fonte le dà. Il campo `indicazioni` è vuoto per tutte le aule.
8. **Capienza**: è nelle fonti ma non l'ho trascritta, perché non era tra i campi richiesti. Si può aggiungere.

## Cosa è cambiato rispetto allo schema che ti ho mostrato

- `cubi.json` → `precisione` ammette anche `"mappa_ufficiale"`, oltre a `"osm"` e `"approssimata"`, perché le coordinate vengono dalla mappa Unical.
- `cubi.json` → c'è un `tipo: "gruppo"` per «Cubo 15» e «Cubo 17» (Chimica), e ogni voce ha il campo `nome_su_mappa`.
- `aule.json` → c'è il campo `note` per le spiegazioni scritte a mano e il campo `tipo` (`aula` / `laboratorio` / `sala_studio`). Non c'è `posti`.

## Nota sulla nuova numerazione (serve per il parser)

Nelle fonti convivono due formati:
- **cubo + numero**: `43B2`, `32B1`, `29C2`, `5C3` (DIMES, DiSU, DiBEST, DiSPeS). Il numero **non** è il piano: per esempio la 43B2 è sul ponte carrabile.
- **cubo + piano + lettera**: `39B 1A`, `41B 6A`, `45B 0C` (DINCI, e DIMES «41B0A»). Qui la cifra corrisponde al piano dichiarato dalla fonte (0 = piano terra, 6 = sesto piano).

Il parser riconoscerà entrambi i formati, ma **da un codice ricaverà solo il cubo**, mai il piano.

## Come è stato costruito

`scripts/costruisci-dati-iniziali.py` contiene le righe trascritte da ogni fonte, la logica di unione e di rilevamento dei conflitti, e il calcolo delle coordinate dalla mappa ufficiale. Serve come documentazione di provenienza. D'ora in poi `aule.json` si modifica a mano, controllando con `scripts/valida-dati.mjs`; le istruzioni saranno nel README.
