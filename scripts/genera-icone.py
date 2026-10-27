# Genera le icone PNG dell'app (segnaposto bianco su fondo verde) senza dipendenze.
# Uso: python3 scripts/genera-icone.py
import math, struct, zlib, pathlib

SFONDO = (11, 110, 95)
BIANCO = (255, 255, 255)
CARTELLA = pathlib.Path(__file__).resolve().parent.parent / "icons"


def dentro_segnaposto(x, y, scala):
    # Segnaposto: cerchio + punta verso il basso, con un foro al centro. Coordinate in [0,1].
    cx, cy, r = 0.5, 0.42, 0.2 * scala
    punta = 0.42 + 0.36 * scala
    d = math.hypot(x - cx, y - cy)
    if d < r * 0.42:
        return False  # foro
    if d <= r:
        return True
    if cy <= y <= punta:
        # lati tangenti al cerchio che si chiudono sulla punta
        t = (punta - y) / (punta - cy)
        return abs(x - cx) <= r * 0.92 * t ** 0.85
    return False


def png(lato, scala, arrotonda):
    righe = []
    ss = 4  # supersampling per bordi morbidi
    raggio = 0.22 if arrotonda else 0
    for py in range(lato):
        riga = bytearray([0])
        for px in range(lato):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx + 0.5) / ss) / lato
                    y = (py + (sy + 0.5) / ss) / lato
                    if raggio:
                        qx, qy = max(abs(x - 0.5) - (0.5 - raggio), 0), max(abs(y - 0.5) - (0.5 - raggio), 0)
                        if math.hypot(qx, qy) > raggio:
                            continue
                    c = BIANCO if dentro_segnaposto(x, y, scala) else SFONDO
                    acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 255
            n = ss * ss
            a = acc[3] / n
            riga += bytes([round(acc[0] / max(acc[3] / 255, 1e-9)) if a else 0,
                           round(acc[1] / max(acc[3] / 255, 1e-9)) if a else 0,
                           round(acc[2] / max(acc[3] / 255, 1e-9)) if a else 0, round(a)])
        righe.append(bytes(riga))
    def blocco(tipo, dati):
        return struct.pack(">I", len(dati)) + tipo + dati + struct.pack(">I", zlib.crc32(tipo + dati) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + blocco(b"IHDR", struct.pack(">IIBBBBB", lato, lato, 8, 6, 0, 0, 0))
            + blocco(b"IDAT", zlib.compress(b"".join(righe), 9)) + blocco(b"IEND", b""))


CARTELLA.mkdir(exist_ok=True)
for nome, lato, scala, arrotonda in [("icona-192.png", 192, 1, True), ("icona-512.png", 512, 1, True),
                                      ("icona-maskable-512.png", 512, 0.8, False), ("apple-touch-icon.png", 180, 1, False)]:
    (CARTELLA / nome).write_bytes(png(lato, scala, arrotonda))
    print("scritta", nome)
