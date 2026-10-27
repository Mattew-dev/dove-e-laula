# One-off builder: turns the transcribed source rows into data/aule.json and data/cubi.json.
# Each row below is copied from a source page/PDF; nothing is inferred except where a note says so.
import json, re, sys, xml.etree.ElementTree as ET
from collections import OrderedDict

OUT = sys.argv[1]          # project data dir
KML = sys.argv[2]
OGGI = "2026-10-27"

S = {
 "AIA":     ("https://www.unical.it/media/medias/2023/Ubicazione_aule_AIA_Conference.pdf", "Ubicazione aule – XXXI AIA Conference (Unical)", "2023-09-08"),
 "TEST":    ("https://unical.it/media/publications_attachments/14141/ubicazione_aule.pdf", "Test ammissione Scienze della Formazione Primaria – Ubicazione aule", "2024-09-09"),
 "ESAMI":   ("https://www.unical.it/media/publications_attachments/10789/aule_esami.pdf", "Aule esami (Unical)", "2024-01-18"),
 "MTINF":   ("https://www.mat.unical.it/informatica/Aule", "CdS Informatica – Aule (vecchio sito)", None),
 "MTMAT":   ("https://www.mat.unical.it/matematica/Aule", "CdS Matematica – Aule (vecchio sito)", None),
 "DEMACS":  ("https://demacs.unical.it/dipartimento/organizzazione/strutture/", "DEMACS – Strutture", None),
 "FIS":     ("https://fisica.unical.it/dipartimento/organizzazione/strutture/", "Dipartimento di Fisica – Strutture", None),
 "FIS_OLD": ("http://web.archive.org/web/20240221075533/https://www2.unical.it/portale/strutture/dipartimenti_240/fisica/dipartimento/strutture/aule/", "Fisica – Aule didattiche (vecchio portale, copia Wayback)", "2024-02-21"),
 "DISU":    ("https://disu.unical.it/dipartimento/organizzazione/strutture/", "DiSU – Strutture", None),
 "DSU_OLD": ("http://web.archive.org/web/20231211161122/https://www2.unical.it/portale/strutture/dipartimenti_240/dsu/aule/", "DSU – Aule (vecchio portale, copia Wayback)", "2023-12-11"),
 "DSU_FAC1":("http://web.archive.org/web/20220302074801/https://www.unical.it/portale/strutture/dipartimenti_240/dsu/aule/fac1/", "DSU – Aula FAC 1 (vecchio portale, copia Wayback)", "2022-03-02"),
 "DESF":    ("https://desf.unical.it/dipartimento/organizzazione/strutture/", "DESF – Strutture", None),
 "DESF_OLD":("http://web.archive.org/web/20220302193508/https://www.unical.it/portale/strutture/dipartimenti_240/disesf/strutture/aule/", "DiSESF – Aule didattica (vecchio portale, copia Wayback)", "2022-03-02"),
 "DISCAG":  ("https://discag.unical.it/dipartimento/organizzazione/strutture/", "DiScAG – Strutture", None),
 "DIMEG":   ("https://dimeg.unical.it/dipartimento/organizzazione/strutture/", "DIMEG – Strutture", None),
 "DIMEG_OLD":("http://web.archive.org/web/20231207110720/https://www2.unical.it/portale/strutture/dipartimenti_240/dimeg/dipartimento/strutture.cfm?q_stru=aule", "DIMEG – Aule (vecchio portale, copia Wayback)", "2023-12-07"),
 "DIMES":   ("https://dimes.unical.it/dipartimento/organizzazione/strutture/", "DIMES – Strutture", None),
 "DINCI":   ("https://dinci.unical.it/dipartimento/organizzazione/strutture/", "DINCI – Strutture", None),
 "DIAM":    ("https://diam.unical.it/dipartimento/organizzazione/strutture/", "DIAm – Strutture", None),
 "DIBEST":  ("https://dibest.unical.it/dipartimento/organizzazione/strutture/", "DiBEST – Strutture", None),
 "DICES":   ("https://dices.unical.it/dipartimento/organizzazione/strutture/", "DiCES – Strutture", None),
 "DISPES":  ("https://dispes.unical.it/dipartimento/organizzazione/strutture/", "DiSPeS – Strutture", None),
 "DFSSN":   ("https://dfssn.unical.it/dipartimento/organizzazione/strutture/", "DFSSN (Farmacia) – Strutture", None),
 "CTC":     ("https://ctc.unical.it/dipartimento/organizzazione/strutture/", "CTC (Chimica) – Strutture", None),
}
# Pages from before 2023 count as "old": if they are an aula's only source, it stays da_verificare.
VECCHIE = {"DSU_FAC1", "DESF_OLD"}

# Row: (id, fonte, nome_nella_fonte, edificio, piano, livello, dipartimento, posti, alias_extra)
# piano/livello copied as the source states them; livello only when the source says carrabile/pedonale.
R = []
def r(id, fonte, nome, edif, piano=None, liv=None, dip=None, posti=None, alias=(), tipo="aula"):
    R.append(dict(id=id, fonte=fonte, nome=nome, edificio=edif, piano=piano, livello=liv, dip=dip, posti=posti, alias=list(alias), tipo=tipo))

# --- AIA 2023
for n,c,p in [("Filol 1","27B","Piano terra"),("Filol 2","27B","Piano terra"),("Filol 3","27B","Piano terra"),("Filol 4","27B","Piano terra"),
              ("Filol 5","28B","2° piano"),("Filol 9","28B","Piano terra"),("Filippo Burgarella","28C","Piano terra"),("Mario Alcaro","28B","Piano terra"),("Storia 7","28D","Piano terra")]:
    r({"Filippo Burgarella":"burgarella","Mario Alcaro":"alcaro","Storia 7":"storia-7"}.get(n, "filol-"+n[-1]), "AIA", n, c, p)
r("caldora","AIA","Aula Caldora","CALDORA", None)
r("29c3","AIA","29C3","29C", "Ponte scoperto")
r("iris","AIA","Iris","29C", None, "pedonale")
# --- Test ammissione 2024
r("13c1","TEST","consolidata 13C1","13C",dip="DiScAG")
r("iana","TEST","consolidata 19B1 IANA","19B",dip="DiSU",alias=["19B1"])
r("29b1","TEST","consolidata 29B1 D.Dolci","29B",dip="DiSPeS",alias=["29B1"])
r("iris","TEST","Consolidata 29C1 IRIS","29C",dip="DiSU",alias=["29C1"])
r("32b1","TEST","consolidata 32B1","32B",dip="DIMES")
r("32c1","TEST","consolidata 32C1","32C",dip="Fisica")
r("40b1","TEST","40B1-DINCI","40B",dip="DINCI")
r("40c1","TEST","40C1-P. Borsellino","40C",dip="DIAm",alias=["P. Borsellino","Borsellino"])
# --- Aule esami 2024 (dipartimento non indicato)
r("esami-info1-3c","ESAMI","Aula informatica 1","3C","Piano terra")
r("esami-info2-3c","ESAMI","Aula informatica 2","3C","Piano terra")
r("ld3","ESAMI","Aula LD3","3D","Piano terra")
r("lab-statistico-3d","ESAMI","Laboratorio statistico informatico","3D","Piano terra")
r("labinfo-40b","ESAMI","Lab informatica sala A-B","40B",None,"carrabile")
r("labinfo-42d","ESAMI","Lab informatico 42-D","42D",None,"carrabile")
# --- Matematica e Informatica
mt_old = [("MT1","31B","Piano terra"),("MT2","31B","Piano terra"),("MT3","31B","Piano terra"),("MT4","30B","Piano terra"),("MT5","31A","Piano terra"),
          ("MT5bis","31A","Piano terra"),("MT6","30B","Piano terra"),("MT8","30B","Piano terra"),("MT13","31B","2° piano"),("MT14","31B","2° piano"),
          ("MT15","31A","1° piano"),("A","30A","Piano terra")]
for src in ("MTINF","MTMAT"):
    for n,c,p in mt_old:
        r("mt-a" if n=="A" else n.lower(), src, "Aula "+n, c, p, dip="DEMACS")
for n,c,p,alias in [("MT1","31B","Piano terra",()),("MT23","31B","Piano terra",()),("MT4","30B","Piano terra",()),("MT5","31A","Piano terra",()),
                    ("MT5bis","31A","Piano terra",()),("MT6","30B","Piano terra",()),("MT8","30B","Piano terra",()),("MT13","31B","2° piano",()),
                    ("MT14","31B","2° piano",()),("MT15","31A","1° piano",()),("A","30A","Piano terra",()),("DEA","31A","1° piano",()),
                    ("Turing","30B","2° piano",("ex MT10","MT10")),("Pitagora","30B","2° piano",("ex MT11","MT11")),("Gödel","30B","2° piano",("ex MT12","MT12","Godel")),
                    ("Collaborativa","30B","2° piano",())]:
    id = {"A":"mt-a","DEA":"dea","Turing":"turing","Pitagora":"pitagora","Gödel":"godel","Collaborativa":"collaborativa-demacs"}.get(n, n.lower())
    r(id, "DEMACS", "Aula "+n, c, p, dip="DEMACS", alias=alias)
# --- Fisica (nuovo sito e vecchio portale: stesso contenuto)
for src in ("FIS","FIS_OLD"):
    for n,c,p,alias in [("A","31C","Piano terra",()),("B/C","31C","Piano terra",("B","C")),("C1","32C","4° piano",("ex CF3","CF3")),
                        ("C2","32C","6° piano",("ex CF1","CF1")),("C3","32C","6° piano",("ex CF2","CF2")),("D","31C","Piano terra",()),
                        ("E/F","30C","Piano terra",("E","F")),("FIS1","30C","2° piano",()),("FIS2","30C","2° piano",()),("FIS3","30C","2° piano",()),
                        ("FIS4","30C","2° piano",()),("G","30C","Piano terra",())]:
        r("fis-"+n.lower().replace("/",""), src, "Aula "+n, c, p, dip="Fisica", alias=alias)
for i in (1,2,3):
    r(f"fis-info{i}","FIS",f"Aula Informatica {i}","31C","3° piano",dip="Fisica")
r("fis-seminari","FIS","Aula Seminari","31C","4° piano","pedonale",dip="Fisica")
# --- DiSU (nuovo) e DSU (vecchio)
disu_common = [("ARES","ares","17B","Piano terra",()),("DIONISO","dioniso","17B","2° piano",()),("F 1","f1-disu","18C","2° piano",("F1",)),
  ("F 2","f2-disu","18C","2° piano",("F2",)),("F 3","f3-disu","18C","2° piano",("F3",)),("FILOL 1","filol-1","27B","Piano terra",()),
  ("FILOL 2","filol-2","27B","Piano terra",()),("FILOL 3","filol-3","27B","Piano terra",()),("FILOL 4","filol-4","27B","Piano terra",()),
  ("FILOL 5","filol-5","28B","2° piano",()),("FILOL 9","filol-9","28B","Piano terra",()),("PAN","pan","17B","2° piano",()),
  ("LUIGI SPEZZAFERRO","spezzaferro","21B","Piano terra",()),("STORIA 2A","storia-2a","28C","Piano terra",()),("STORIA 2B","storia-2b","28C","Piano terra",()),
  ("STORIA 2C","storia-2c","28C","Piano terra",()),("STORIA 3","storia-3","28C","2° piano",()),("STORIA 4","storia-4","28C","2° piano",()),
  ("STORIA 5","storia-5","28C","2° piano",()),("STORIA 6","storia-6","28C","2° piano",()),("MARIO ALCARO","alcaro","28B","Piano terra",()),
  ("Seminari 2","seminari-2-disu","27B","2° piano",())]
for src in ("DISU","DSU_OLD"):
    for n,id,c,p,alias in disu_common:
        r(id, src, "Aula "+n, c, p, dip="DiSU", alias=alias)
r("iana","DISU","Aula IANA","19B",None,"pedonale",dip="DiSU");   r("iana","DSU_OLD","Aula IANA","19B",None,"pedonale",dip="DiSU")
r("iris","DISU","Aula IRIS","29C",None,"pedonale",dip="DiSU");   r("iris","DSU_OLD","Aula IRIS","29C",None,"pedonale",dip="DiSU")
r("29c2","DISU","Aula 29 C2 (FAC 1)","29C",None,"carrabile",dip="DiSU",alias=["FAC 1","ex FAC1"])
r("29c2","DSU_OLD","Aula FAC 1","29C",None,"carrabile",dip="DiSU",alias=["FAC 1"])
r("29c2","DSU_FAC1","Aula FAC 1","29C",None,"carrabile",dip="DiSU")
r("29c3","DISU","Aula 29 C3 (FAC 2)","29C",None,"carrabile",dip="DiSU",alias=["FAC 2","ex FAC2"])
r("29c3","DSU_OLD","Aula FAC 2","29C",None,"carrabile",dip="DiSU",alias=["FAC 2"])
r("burgarella","DISU","Aula Storia 1 (BURGARELLA)","28C","Piano terra",dip="DiSU",alias=["Storia 1","Filippo Burgarella"])
r("burgarella","DSU_OLD","Aula FILIPPO BURGARELLA","28C","Piano terra",dip="DiSU")
r("leone","DISU","Aula G (LEONE)","21B","Piano terra",dip="DiSU",alias=["Leone","G Leone"])
r("leone","DSU_OLD","Aula LEONE","21B","Piano terra",dip="DiSU")
r("n-disu","DISU","Aula N","18B","Piano terra",dip="DiSU")
r("n-disu","DSU_OLD","Aula N","18C","Piano terra",dip="DiSU")
r("seminari-1-disu","DISU","Aula seminari 1","17B","4° piano",dip="DiSU")
r("seminari-1-disu","DSU_OLD","Aula seminari 1","18C","4° piano",dip="DiSU")
r("storia-7","DSU_OLD","Aula STORIA 7","28D","Piano terra",dip="DiSU")
r("csdim","DSU_OLD","Aula INFORMATICA CSDIM","28A","1° piano",dip="DiSU")
# --- DESF / DiScAG (sito DESF nuovo e vecchio: stesso elenco; DiScAG ripete le sue)
desf = [("CONSOLIDATA 1","consolidata-1","2C","DESF"),("CONSOLIDATA 4","consolidata-4","5B","DESF"),("EP 1","ep1","1D","DESF"),("EP 2","ep2","1D","DESF"),
        ("EP 3","ep3","1D","DESF"),("EP 4","ep4","1D","DESF"),("EP 5","ep5","1D","DESF"),("EP 6","ep6","1D","DESF"),("ZENITH 1","zenith-1","13C","DESF"),
        ("CONSOLIDATA 2","consolidata-2","2B","DiScAG"),("CONSOLIDATA 3","consolidata-3","16C","DiScAG"),("CONSOLIDATA 5","consolidata-5","13C","DiScAG"),
        ("ZENITH 2","zenith-2","13C","DiScAG"),("OA/SG1","oasg1","3A","DiScAG"),("OA/SG2","oasg2","3A","DiScAG"),("OA/SG3","oasg3","3A","DiScAG"),("OA/SG4","oasg4","3A","DiScAG")]
for src in ("DESF","DESF_OLD"):
    for n,id,c,d in desf:
        r(id, src, n, c, dip=d, alias=[n.replace("/","")] if "/" in n else [])
for n,id,c,d in desf:
    if d=="DiScAG": r(id, "DISCAG", n, c, dip=d)
for n in ("Douglas-Calabria","van Gogh","Chaplin","Bilbao","Orientale"):
    r("auletta-"+n.lower().replace(" ","-"), "DESF", "Auletta "+n, "1C", "Piano terra", dip="DESF")
# --- DIMEG (nuovo e vecchio: stesso elenco)
for src in ("DIMEG","DIMEG_OLD"):
    for n,id,c,p,l in [("43B (Consolidata)","consolidata-43b","43B",None,"pedonale"),("B (Consolidata)","consolidata-b-43c","43C",None,"pedonale"),
                       ("P1","p1","40C",None,"carrabile"),("P3","p3","43C",None,"carrabile"),("P4","p4","43C",None,"carrabile"),
                       ("M1","m1","44C","1° piano",None),("M2","m2","44C","1° piano",None),("M3","m3","44C","1° piano",None),("M4","m4","44C","2° piano",None),
                       ("DS4","ds4","41B","Piano terra",None),("Auletta 46C","auletta-46c","46C","Piano terra",None)]:
        r(id, src, n, c, p, l, dip="DIMEG")
r("seminari-dimeg","DIMEG","Aula Seminari","44C","1° piano",dip="DIMEG")
r("labinfo-40b","DIMEG","LabInfo Laboratorio didattico Area Ingegneria","40B","7° piano",alias=["LabInfo"])
# --- DIMES
for n,c,p,l in [("32B1","32B",None,"pedonale"),("32B2","32B",None,"carrabile"),("32B3","32B",None,"carrabile"),("DS5","41B","2° piano",None),
                ("DS6","41B","2° piano",None),("DS7","41B","2° piano",None),("DS8","41B","2° piano",None),("I1","42D","Piano terra",None),
                ("I2","42D","Piano terra",None),("MOD3","39C","3° piano",None),("MOD4","39C",None,"pedonale"),("MOD5","39C",None,"pedonale"),
                ("43B2","43B",None,"carrabile"),("43B3","43B",None,"carrabile"),("Aula Automatica","42C","3° piano",None),("Aula Seminari","42C","5° piano",None),
                ("41B0A","41B","Piano terra",None)]:
    id = {"Aula Automatica":"automatica","Aula Seminari":"seminari-dimes"}.get(n, n.lower())
    r(id, "DIMES", n, c, p, l, dip="DIMES")
r("labinfo-40b","DIMES","Laboratorio Informatica","40B","7° piano",dip="DIMES",alias=["Laboratorio Informatica 40B"])
r("labinfo-42d","DIMES","Laboratorio didattico di informatica","42D","Piano terra",dip="DIMES")
r("lab-elettronica","DIMES","Laboratorio didattico di Elettronica","42C","1° piano",dip="DIMES")
r("collaborativa-dimes","DIMES","Aula collaborativa","39C","6° piano","carrabile",dip="DIMES")
r("aula-tecnica","DIMES","Aula tecnica","41C","1° piano",dip="DIMES")
# --- DINCI
for n,ex,c,p in [("39B 1A","STR1","39B","1° piano"),("39B 1B","STR2","39B","1° piano"),("39B 1C","STR3","39B","1° piano"),("39C 1A","MOD1A","39C","1° piano"),
                 ("39C 2A","MOD2D","39C","2° piano"),("39C 2B","MOD2E","39C","2° piano"),("41B 6A","Sala Consiglio","41B","6° piano"),
                 ("41B 6B","","41B","6° piano"),("44B 4A","DS11","44B","Ponte coperto"),("45B 0A","PT1","45B","Piano terra"),
                 ("45B 0B","PT2","45B","Piano terra"),("45B 0C","PT3","45B","Piano terra")]:
    alias = ["DINCI "+n] + (["ex "+ex, ex] if ex else [])
    if n=="41B 6A": alias.append("Aula Marone")
    if n=="41B 6B": alias.append("Aula studenti DINCI")
    r(n.lower().replace(" ",""), "DINCI", n, c, p, dip="DINCI", alias=alias)
r("mod3a","DINCI","MOD3A","39C","3° piano",dip="DINCI")
r("consolidata-40b","DINCI","DINCI 40B (Aula consolidata)","40B","Ponte coperto",dip="DINCI",alias=["40B consolidata","Consolidata 40B"])
r("41b0a","DINCI","DINCI 41B 0A","41B","Piano terra",dip="DINCI",alias=["41B 0A","ex DS3","DS3"])
r("giannattasio","DINCI","Aula seminari (Giannattasio)","45B",None,"carrabile",dip="DINCI")
r("giannattasio","DINCI","Aula Seminari “G. Giannattasio”","45B","1° piano",dip="DINCI")
# --- DIAm
for n,c,p,l in [("A","40C",None,"pedonale"),("B","42B","2° piano",None),("C","42B","2° piano",None),("D","42B","2° piano",None),("E","39C","Piano terra",None),
                ("F","39C","2° piano",None),("G","39C","2° piano",None),("H","39C","2° piano",None)]:
    r("diam-"+n.lower(), "DIAM", "Aula DIAm "+n, c, p, l, dip="DIAm")
r("giannattasio","DIAM","Aula Giannattasio","45B",None,"carrabile",dip="DIAm")
r("visiting-diam","DIAM","Aula Visiting Professor","41B","4° piano",dip="DIAm")
# --- DiBEST
for n,c,p in [("5C1","5C","2° piano"),("5C2","5C","2° piano"),("5C3","5C","4° piano"),("5C4","5C","4° piano"),("COVELLO","6C","4° piano"),
              ("B5","4D","Piano terra"),("B6","4D","1° piano"),("MAGNA","15B","3° piano"),("A","15B","3° piano"),("B","15B","3° piano"),("C","15B","3° piano"),
              ("E","15B","3° piano"),("F","15B","3° piano"),("AULA INFORMATICA","15B","1° piano"),("M","15B","1° piano"),("N","15B","1° piano"),
              ("5B2","5B","4° piano"),("5B3","5B","4° piano"),("L1","4A","1° piano"),("L2","4A","1° piano"),("L3","4A","1° piano"),("L4","4A","1° piano"),
              ("L5","4A","1° piano"),("AULA RESTAURO","12B","4° piano")]:
    id = n.lower() if re.match(r"^\d",n) else "dibest-"+n.lower().replace(" ","-")
    r(id, "DIBEST", n, c, p, dip="DiBEST", alias=(["Magna DiBEST"] if n=="MAGNA" else []))
r("mt5","DIBEST","MT5","30A","Piano terra",dip="DiBEST")
r("poli-l1","DIBEST","L1","POLI",dip="DiBEST");  r("poli-l2","DIBEST","L2","POLI",dip="DiBEST")
r("29b1","DIBEST","29B1","29B","4° piano",dip="DiBEST")
r("consolidata-2","DIBEST","CONSOLIDATA 2B","2B",dip="DiBEST",alias=["Consolidata 2B"])
# --- DiCES
for n,c,p,l in [("A Ling.","20B","Piano terra",None),("Apollo","18B","Piano terra",None),("Athena","18B","2° piano",None),("Aurora","17B","Piano terra",None),
                ("B Ling.","20B","Piano terra",None),("E Ling.","20B","2° piano",None),("F Ling.","20B","2° piano",None),("Hera","18B","2° piano",None),
                ("Informatica 1","20B","2° piano",None),("Informatica 2","20B","Piano terra",None),("Multimediale","20B","2° piano",None),
                ("Nettuno","17B","Piano terra",None),("Solano","19B",None,"carrabile"),("Ventura","18B","Piano terra",None),("Zeus","18B","2° piano",None)]:
    r("dices-"+re.sub(r"[^a-z0-9]+","-",n.lower()).strip("-"), "DICES", n, c, p, l, dip="DiCES")
r("29b1","DICES","Dolci","29B","2° piano",dip="DiCES")
# --- DiSPeS
r("29b1","DISPES","29B1 - D. Dolci","29B",dip="DiSPeS",alias=["Danilo Dolci","D. Dolci","Dolci"])
r("poli-l1","DISPES","L1","POLI",dip="DiSPeS"); r("poli-l2","DISPES","L2","POLI",dip="DiSPeS")
for n in ("G1","G2","G3","G4","H1","H2","H3","H4","44","B"):
    r("poli-"+n.lower(), "DISPES", n, "POLI", dip="DiSPeS")
for i in range(1,6):
    r(f"ssp{i}","DISPES",f"SSP{i}","1A",dip="DiSPeS")
r("29b2","DISPES","29B2 S. Aleramo","29B",dip="DiSPeS",alias=["Aleramo","S. Aleramo"])
r("29b3","DISPES","29B3 C. Mortati","29B",dip="DiSPeS",alias=["Mortati","C. Mortati"])
r("aula-gialla-0b","DISPES","Aula Gialla (sala studio)","0B","2° piano",dip="DiSPeS")
# --- DFSSN (Farmacia)
for n,e in [("Aula Medicina Traslazionale","POLI"),("Aula 13","CAP-C"),("Aula 14","CAP-C"),("Aula 15","CAP-C"),("Aula 20","CAP-D"),("Aula 21","CAP-D"),
            ("Aula 25","CAP-D"),("Aula 45","CAP-F"),("Aula 46","CAP-F"),("Aula 52","CAP-F"),("Aula 53","CAP-F"),("Aula Circolare","POLI"),
            ("Laboratorio A","POLI"),("Laboratorio Informatica","POLI"),("Laboratorio B","CAP-E"),("Laboratorio C","CAP-E"),
            ("ex biblioteca Brandemayer","POLI"),("Seminari (ex Dip.to Farmaco Biol.)","POLI"),("Aula Gialla - A (superiore)","POLI"),
            ("Aula Gialla - B (inferiore)","POLI"),("Aula Seminari Medicina","POLI"),("Aula Centro di Simulazione (MED-TD)","POLI"),
            ("CP1","POLI"),("CP2","POLI"),("CP3","POLI"),("CP4","POLI"),("CP5","POLI"),("CP6","POLI")]:
    r("dfssn-"+re.sub(r"[^a-z0-9]+","-",n.lower()).strip("-"), "DFSSN", n, e, dip="DFSSN")
# --- CTC (Chimica): la fonte scrive "Cubo 15" / "Cubo 17" senza lettera
for n,c,p in [("CH-15-6A-3T","15","6° piano"),("CH-15-7A","15","7° piano"),("CH-15-6B-1M","15","6° piano"),("CH-17-7B","17","7° piano"),
              ("CH-17-6A-2T","17","6° piano"),("CH-17-6B-2M","17","6° piano"),("CH-17-7A-1T","17","7° piano")]:
    r(n.lower(), "CTC", "Aula "+n, c, p, dip="CTC")
r("seminari-ctc","CTC","Aula Seminari","15C","2° piano",dip="CTC")

# --- Seconda passata: laboratori didattici, sale studio e righe saltate nelle stesse pagine "Strutture"
L, SS = "laboratorio", "sala_studio"
# DiSU: Storia 7 e CSDIM sono anche nel sito nuovo
r("storia-7","DISU","Aula STORIA 7","28D","Piano terra",dip="DiSU")
r("csdim","DISU","Aula INFORMATICA CSDIM","28A","1° piano",dip="DiSU",tipo=L)
# DIMES
r("labinfo-41c","DIMES","Laboratorio didattico di informatica","41C","1° piano",dip="DIMES",tipo=L,alias=["Laboratorio informatica 41C"])
r("studio-41c","DIMES","Aula Studio 5° piano cubo 41C","41C","5° piano","pedonale",dip="DIMES",tipo=SS)
r("studio-44z","DIMES","Aula studio piano terra cubo 44Z","44Z","Piano terra",dip="DIMES",tipo=SS)
# DEMACS
r("mt7","DEMACS","Aula MT7","30B","Piano terra",dip="DEMACS",tipo=SS)
r("mt7","MTINF","Aula MT7","30B","Piano terra",dip="DEMACS",tipo=SS)
r("lab-16c","DEMACS","Laboratorio LAB-16C","16C",None,"carrabile",dip="DEMACS",tipo=L,alias=["Lab-16C","LAB 16C"])
r("lab-30a","DEMACS","Laboratorio LAB-30A","30A","Piano terra",dip="DEMACS",tipo=L,alias=["Lab-30A","LAB 30A"])
r("lab-31a","DEMACS","Laboratorio LAB-31A","31A","1° piano",dip="DEMACS",tipo=L,alias=["Lab-31A","LAB 31A"])
r("lab-31b","DEMACS","Laboratorio LAB-31B","31B","2° piano",dip="DEMACS",tipo=L,alias=["Lab-31B","LAB 31B"])
# DIMEG
r("atrio-m","DIMEG","Atrio M","44C","Piano terra",dip="DIMEG",tipo=SS)
# DINCI
r("lab-trasporti","DINCI","Laboratorio Didattico di Ingegneria dei Trasporti","46B","Piano terra",dip="DINCI",tipo=L)
r("sala-pianificazione","DINCI","Sala Sezione Pianificazione Territoriale","45B","2° piano",dip="DINCI",tipo=SS)
# DIAm
r("studio-45a","DIAM","Sala Studio","45A","Piano terra",dip="DIAm",tipo=SS,alias=["Sala studio DIAm"])
# DiSPeS
r("ls1","DISPES","LS1","POLI",dip="DiSPeS",tipo=L,alias=["Laboratorio lingue LS1"])
r("ls3","DISPES","LS3","POLI",dip="DiSPeS",tipo=L,alias=["Laboratorio lingue LS3"])
r("lab-foto-marra","DISPES","Laboratorio di fotografia “Saverio Marra”","17B",dip="DiSPeS",tipo=L,alias=["Saverio Marra"])
r("lab-audiovisivo-ruiz","DISPES","Laboratorio audiovisivo “Raul Ruiz”","17B",dip="DiSPeS",tipo=L,alias=["Raul Ruiz"])
r("studio-laugier","DISPES","Sala Studio “Regine Laugier”","AMPL-POLI","Piano terra",dip="DiSPeS",tipo=SS,alias=["Regine Laugier","Laugier"])
# DFSSN: le due righe saltate nella prima passata
r("dfssn-laboratorio-a-microbiologia","DFSSN","Laboratorio A Microbiologia, Igiene e Sanità Pubblica","CAP-E",dip="DFSSN",tipo=L)
r("dfssn-laboratorio-sottovia","DFSSN","Laboratorio Sottovia Morfo-Funzionale","POLI","Sottovia",dip="DFSSN",tipo=L)
# Fisica
r("fis-studio-1","FIS","Aula Studio 1","30C","2° piano","pedonale",dip="Fisica",tipo=SS)
r("fis-studio-2","FIS","Aula Studio 2","30C","2° piano","pedonale",dip="Fisica",tipo=SS)
r("fis-lab-elettromagnetismo","FIS","Laboratorio di Elettromagnetismo e Ottica","31C","2° piano",dip="Fisica",tipo=L)
# CTC (qui la lettera del cubo c'è)
for n,c,p in [("CHIMICA ANALITICA","15C","1° piano"),("CHIMICA FISICA","15C","1° piano"),("CHIMICA GENERALE ED INORGANICA","15C","1° piano"),
              ("CHIMICA INORGANICA - PLS","17C","5° piano"),("CHIMICA ORGANICA STRUMENTALE","15C","5° piano"),("CHIMICA ORGANICA","15C","3° piano"),
              ("INFORMATICA CHIMICA","15C","2° piano")]:
    r("ctc-lab-"+re.sub(r"[^a-z0-9]+","-",n.lower()).strip("-"), "CTC", "Laboratorio di "+n.title(), c, p, dip="CTC", tipo=L)
r("ctc-aula-studio","CTC","Aula Studio (ex Aula B)","15C","2° piano",dip="CTC",tipo=SS)

# Notes and manual flags (conflicts the automatic check cannot see).
NOTE = {
 "29c3": "La conferenza AIA 2023 indica «ponte scoperto», DiSU indica «piano ponte carrabile».",
 "mt2": "Presente solo sul vecchio sito mat.unical.it, non nell'elenco attuale DEMACS (che elenca invece MT23 nello stesso cubo).",
 "mt3": "Presente solo sul vecchio sito mat.unical.it, non nell'elenco attuale DEMACS (che elenca invece MT23 nello stesso cubo).",
 "mt15": "Il vecchio sito scrive «Primo piano» in italiano e «Second Floor» in inglese; qui si usa la versione italiana, confermata da DEMACS.",
 "mt-a": "Il vecchio sito scrive «Piano terra» in italiano e «Second Floor» in inglese; qui si usa la versione italiana, confermata da DEMACS.",
 "labinfo-40b": "DIMES e DIMEG indicano il 7° piano, il PDF «aule esami» indica «Ponte carrabile». Potrebbero coincidere, ma nessuna fonte lo dice.",
 "labinfo-42d": "DIMES indica il piano terra, il PDF «aule esami» indica «Ponte carrabile».",
 "giannattasio": "La stessa pagina DINCI indica sia «Ponte carrabile» sia «p. 1».",
 "consolidata-2": "DiBEST la chiama «CONSOLIDATA 2B»: stesso cubo (2B) e stessa capienza (375) di Consolidata 2 di DiScAG.",
 "oasg4": "Capienza diversa tra le fonti: 75 (DESF) e 120 (DiScAG).",
 "32c1": "Probabilmente è l'aula C1 di Fisica (stesso cubo), ma nessuna fonte lo dice.",
 "40b1": "Probabilmente è l'aula consolidata DINCI 40B, ma nessuna fonte lo dice.",
 "40c1": "Probabilmente è l'aula DIAm A (cubo 40C, ponte pedonale, 280 posti), ma nessuna fonte lo dice.",
 "consolidata-43b": "Probabilmente è la «43B1» della nuova numerazione, ma nessuna fonte lo dice.",
 "mod3a": "DINCI la elenca senza nuovo nome; DIMES ha un'aula MOD3 nello stesso cubo e piano (forse la stessa).",
}
DA_VERIFICARE = {"mt2","mt3","labinfo-40b","labinfo-42d","giannattasio","29c3"}
for id in [x["id"] for x in R if x["edificio"] in ("15","17")]:
    NOTE[id] = "La fonte indica «Cubo %s» senza lettera: la posizione sulla mappa è approssimata." % ("15" if "-15-" in id else "17")
    DA_VERIFICARE.add(id)
for id in [x["id"] for x in R if x["edificio"]=="POLI" and x["id"].startswith("poli-")]:
    NOTE.setdefault(id, "La fonte indica solo «Polifunzionale», senza capannone né piano.")

def norm_piano(p):
    return None if p is None else p.lower()

# --- merge
aule = OrderedDict()
for x in R:
    a = aule.setdefault(x["id"], dict(id=x["id"], nome=None, tipo=x["tipo"], alias=[], edificio=None, piano=None, livello=None, dipartimento=None,
                                      indicazioni=None, stato=None, fonti=[], conflitti=[], note=None))
    src = S[x["fonte"]]
    riporta = {k: v for k, v in dict(nome=x["nome"], edificio=x["edificio"], piano=x["piano"], livello=x["livello"], dipartimento=x["dip"]).items() if v}
    a["fonti"].append(dict(url=src[0], titolo=src[1], data_fonte=src[2], consultata_il=OGGI, riporta=riporta))
    for al in [x["nome"]] + x["alias"]:
        if al not in a["alias"]: a["alias"].append(al)

# Tipo: labs and study rooms recorded before the "tipo" column existed.
TIPO = {**{k:"laboratorio" for k in ("labinfo-40b","labinfo-42d","lab-elettronica","lab-statistico-3d","esami-info1-3c","esami-info2-3c",
        "fis-info1","fis-info2","fis-info3","29b2","29b3","csdim","dfssn-laboratorio-a","dfssn-laboratorio-informatica",
        "dfssn-laboratorio-b","dfssn-laboratorio-c")}, "aula-gialla-0b":"sala_studio"}
for id,t in TIPO.items():
    assert id in aule, id
    aule[id]["tipo"] = t

FONTE_RANK = lambda f: (f["data_fonte"] is None, f["data_fonte"] or "")   # live pages (no date) rank as newest
NOMI = {"29c2":"29C2","29c3":"29C3","iris":"Iris","iana":"Iana","29b1":"29B1 Danilo Dolci","burgarella":"Storia 1 – Filippo Burgarella",
        "alcaro":"Mario Alcaro","leone":"G – Leone","caldora":"Aula Caldora","giannattasio":"Seminari Giannattasio","labinfo-40b":"Laboratorio Informatica 40B (LabInfo)",
        "labinfo-42d":"Laboratorio di informatica 42D","consolidata-2":"Consolidata 2","41b0a":"41B 0A","n-disu":"N","seminari-1-disu":"Seminari 1 (DiSU)"}
for a in aule.values():
    fonti = sorted(a["fonti"], key=FONTE_RANK, reverse=True)
    best = fonti[0]["riporta"]
    a["nome"] = NOMI.get(a["id"], best["nome"])
    for campo in ("edificio","piano","livello","dipartimento"):
        valori = OrderedDict()
        for f in fonti:
            v = f["riporta"].get(campo)
            if v: valori.setdefault(norm_piano(v) if campo=="piano" else v, (v, f["url"]))
        if campo == "dipartimento":
            a[campo] = next(iter(valori.values()))[0] if valori else None
            continue
        if len(valori) > 1:
            # Contested field: leave it empty rather than pick a side; the app shows the conflict instead.
            a["conflitti"].append(dict(campo=campo, valori=[dict(valore=v, fonte=u) for v,u in valori.values()]))
            a[campo] = None
            continue
        a[campo] = next(iter(valori.values()))[0] if valori else None
    a["alias"] = [al for al in a["alias"] if al != a["nome"]]
    solo_vecchie = all(f["url"] in [S[k][0] for k in VECCHIE] for f in a["fonti"])
    a["note"] = NOTE.get(a["id"])
    a["stato"] = "da_verificare" if (a["conflitti"] or a["id"] in DA_VERIFICARE or solo_vecchie) else "verificata"

# --- cubi from the official Unical My Maps KML
k = {"k":"http://www.opengis.net/kml/2.2"}
root = ET.parse(KML).getroot()
poly = {}
for f in root.iter("{http://www.opengis.net/kml/2.2}Folder"):
    if not f.find("k:name",k).text.startswith("Strutture"): continue
    for p in f.findall("k:Placemark",k):
        name = " ".join(p.find("k:name",k).text.split())
        c = p.find(".//k:Polygon//k:coordinates",k)
        if c is None: continue
        pts = [tuple(map(float, t.split(",")[:2])) for t in c.text.split()]
        if pts[0] == pts[-1]: pts = pts[:-1]
        lon = sum(q[0] for q in pts)/len(pts); lat = sum(q[1] for q in pts)/len(pts)
        poly.setdefault(name, []).append((round(lat,6), round(lon,6)))
KMLURL = "https://www.google.com/maps/d/viewer?mid=17RXFIMpyGYs5LC7TGMFLzcFw52Q"
cubi = OrderedDict()
def add(id, tipo, nome, lat, lon, prec, kmlname=None, note=None, dip=None):
    cubi[id] = dict(id=id, tipo=tipo, nome=nome, lat=lat, lon=lon, precisione=prec, dipartimenti_mappa=dip,
                    fonte=KMLURL if kmlname else None, nome_su_mappa=kmlname, note=note)
for name, cs in poly.items():
    m = re.match(r"^Cubo (\d{1,2}[A-Z])\s*(?:-\s*(.+))?$", name)
    if m:
        id = m.group(1)
        if id in cubi: continue
        nota = "Sulla mappa ufficiale ci sono %d poligoni con questo nome: si usa il primo." % len(cs) if len(cs)>1 and len(set(cs))>1 else None
        add(id, "cubo", "Cubo "+id, cs[0][0], cs[0][1], "mappa_ufficiale", name, nota, m.group(2))
special = {"POLI":("Polifunzionale - DFSSN","edificio","Polifunzionale"),"CALDORA":("Aula Caldora","edificio","Aula Caldora (Centro Residenziale)"),
           "CAP-C":("Capannone C","capannone","Capannone C"),"CAP-D":("Capannone D","capannone","Capannone D"),"CAP-E":("Capannone E","capannone","Capannone E"),
           "CAP-F":("Capannone F","capannone","Capannone F"),"CAP-G":("Capannone G","capannone","Capannone G"),"CAP-H":("Capannone H","capannone","Capannone H"),
           "AULA-MAGNA":("Aula Magna","edificio","Aula Magna"),"AMPL-POLI":("Edificio Ampliamento Polifunzionale - DISPeS","edificio","Ampliamento Polifunzionale")}
for id,(kn,tipo,nome) in special.items():
    lat,lon = poly[kn][0]; add(id, tipo, nome, lat, lon, "mappa_ufficiale", kn)
for g, parts in (("15",["15C","15D"]),("17",["17C","17D"])):
    lat = round(sum(cubi[p]["lat"] for p in parts)/2,6); lon = round(sum(cubi[p]["lon"] for p in parts)/2,6)
    add(g, "gruppo", "Cubo %s (lettera non indicata)" % g, lat, lon, "approssimata",
        note="Punto medio tra i cubi %s, assegnati a CTC sulla mappa ufficiale. Le fonti CTC scrivono «Cubo %s» senza lettera." % (" e ".join(parts), g))

json.dump(dict(versione=1, aggiornato=OGGI, aule=list(aule.values())), open(OUT+"/aule.json","w"), ensure_ascii=False, indent=1)
json.dump(dict(versione=1, aggiornato=OGGI, fonte=KMLURL, cubi=sorted(cubi.values(), key=lambda c:(c["tipo"]!="cubo", int(re.match(r"\d+",c["id"]).group()) if c["id"][0].isdigit() else 0, c["id"]))),
          open(OUT+"/cubi.json","w"), ensure_ascii=False, indent=1)
missing = sorted({a["edificio"] for a in aule.values()} - set(cubi))
print(len(aule), "aule;", sum(a["stato"]=="verificata" for a in aule.values()), "verificate;", len(cubi), "cubi; edifici mancanti:", missing)
