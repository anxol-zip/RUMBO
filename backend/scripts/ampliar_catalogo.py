"""Feature 004: genera ``catalogo/puntos_ampliados.csv`` (~100 lugares nuevos de DENUE y OpenStreetMap).

    uv run python -m scripts.ampliar_catalogo            # genera el CSV
    uv run python -m scripts.ampliar_catalogo --ver      # solo el resumen, sin escribir
    uv run python -m scripts.ampliar_catalogo --sin-osm  # sin consultar Overpass (solo DENUE)

No toca la base (eso lo hace ``cargar_bd``). La respuesta de Overpass se guarda en ``data/raw/osm_ampliado.json``
y se reutiliza; bórrala para volver a consultar. Al regenerar se conservan ``google_place_id`` y ``oculto``.
La lógica (duplicados, puntaje, horario de OSM) está en ``turismo_core.ampliar``.
"""

from __future__ import annotations

import csv
import json
import sys
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date

from scripts import CATALOGO, CATALOGO_AMPLIADO, OSM_AMPLIADO, PROCESSED
from turismo_core import ampliar

OVERPASS = "https://overpass-api.de/api/interpreter"
FECHA_DENUE = "05/2026"   # versión del DENUE que usa el pipeline (la misma que cita el catálogo curado)


def consulta_overpass(curados: list[dict]) -> str:
    """Una sola consulta: lugares con nombre a ≤ 1.5 km de cada curado."""
    filtros = ['["amenity"~"^(restaurant|cafe)$"]', '["tourism"~"^(museum|gallery|attraction|viewpoint)$"]',
               '["leisure"="park"]']
    partes = [f'nwr(around:{ampliar.RADIO_M},{p["lat"]},{p["lon"]}){f}["name"];' for p in curados for f in filtros]
    return f'[out:json][timeout:120];({"".join(partes)});out center tags;'


def elementos_osm(curados: list[dict]) -> list[dict]:
    if OSM_AMPLIADO.exists():
        print(f"  OSM: se reutiliza {OSM_AMPLIADO.name}")
        return json.loads(OSM_AMPLIADO.read_text(encoding="utf-8"))["elements"]
    datos = urllib.parse.urlencode({"data": consulta_overpass(curados)}).encode()
    req = urllib.request.Request(OVERPASS, data=datos, headers={"User-Agent": "RUMBO-catalogo/0.1"})
    with urllib.request.urlopen(req, timeout=180) as r:
        respuesta = json.load(r)
    OSM_AMPLIADO.parent.mkdir(parents=True, exist_ok=True)
    OSM_AMPLIADO.write_text(json.dumps(respuesta, ensure_ascii=False), encoding="utf-8")
    print(f"  OSM: consulta nueva a Overpass ({len(respuesta['elements'])} elementos)")
    return respuesta["elements"]


def _leer(ruta) -> list[dict]:
    with ruta.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def generar(sin_osm: bool = False) -> tuple[list[dict], int, int]:
    curados = _leer(CATALOGO)
    candidatos = [c for f in _leer(PROCESSED / "denue_zona_piloto.csv") if (c := ampliar.desde_denue(f))]
    if not sin_osm:
        candidatos += [c for e in elementos_osm(curados) if (c := ampliar.desde_osm(e))]
    unicos, descartados = ampliar.deduplicar(candidatos, curados)
    previas = _leer(CATALOGO_AMPLIADO) if CATALOGO_AMPLIADO.exists() else []
    # Los ocultos a mano no ocupan cupo (entra otro en su lugar), pero se quedan en el CSV para que no vuelvan.
    ocultas = [p for p in previas if (p.get("oculto") or "0").strip() == "1"]
    fuera = {p["id"] for p in ocultas}
    elegidos = ampliar.elegir([u for u in unicos if u["id"] not in fuera], curados)
    hoy = date.today().isoformat()
    filas = [ampliar.fila(c, FECHA_DENUE, hoy) for c in elegidos]
    # La fecha de generación no cuenta como cambio: si el lugar ya estaba, se conserva su texto de fuente.
    fuente_previa = {p["id"]: p["fuente"] for p in previas}
    for f in filas:
        f["fuente"] = fuente_previa.get(f["id"], f["fuente"])
    filas = ampliar.juntar(previas, filas) + ocultas
    return sorted(filas, key=lambda f: f["id"]), len(candidatos), descartados


def resumen(filas: list[dict], n_candidatos: int, descartados: int) -> None:
    visibles = [f for f in filas if str(f["oculto"]) != "1"]
    print(f"  candidatos {n_candidatos}; duplicados o ya curados {descartados}; "
          f"elegidos {len(visibles)} (+{len(filas) - len(visibles)} ocultos a mano)")
    filas = visibles
    for nombre, cuenta in (("tipo", Counter(f["tipo"] for f in filas)),
                           ("fuente", Counter("osm" if f["osm_id"] else "denue" for f in filas)),
                           ("destino", Counter(f["destino"] for f in filas))):
        print(f"  por {nombre}: " + ", ".join(f"{k} {v}" for k, v in cuenta.most_common()))
    print(f"  con horario propio: {sum(bool(f['horario']) for f in filas)}")


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    filas, n, descartados = generar(sin_osm="--sin-osm" in argv)
    resumen(filas, n, descartados)
    if "--ver" in argv:
        return
    with CATALOGO_AMPLIADO.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=ampliar.COLUMNAS, lineterminator="\n")
        w.writeheader()
        w.writerows(filas)
    print(f"  escrito {CATALOGO_AMPLIADO.relative_to(CATALOGO.parent.parent)}")


if __name__ == "__main__":
    main()
