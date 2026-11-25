"""Feature 004: busca en Google el ``place_id`` de cada lugar de ``catalogo/puntos_ampliados.csv``.

    uv run python -m scripts.buscar_place_id [--limite 25]

Es lo único de Google que se guarda (términos de Places). Solo busca los que tienen ``google_place_id`` vacío;
``-`` marca "Google no tiene una coincidencia confiable" y no se vuelve a buscar. Los 23 curados nunca se buscan
(no consultan a Google). Para al primer 429 (tope diario de la consola) y guarda lo avanzado: se puede correr
otro día. Después hay que correr ``scripts.cargar_bd`` para pasar los ids a la base.
"""

from __future__ import annotations

import csv
import sys
import urllib.error

from scripts import CATALOGO_AMPLIADO
from turismo_core import google
from turismo_core.ampliar import COLUMNAS

SIN_COINCIDENCIA = "-"


def _guardar(filas: list[dict]) -> None:
    with CATALOGO_AMPLIADO.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNAS, lineterminator="\n")
        w.writeheader()
        w.writerows(filas)


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    limite = int(argv[argv.index("--limite") + 1]) if "--limite" in argv else 25
    with CATALOGO_AMPLIADO.open(encoding="utf-8", newline="") as f:
        filas = list(csv.DictReader(f))
    pendientes = [f for f in filas if not f["google_place_id"].strip() and f["oculto"] != "1"]
    encontrados = sin = 0
    try:
        for f in pendientes[:limite]:
            pid = google.buscar_place_id(f["nombre"], f["municipio"], float(f["lat"]), float(f["lon"]))
            f["google_place_id"] = pid or SIN_COINCIDENCIA
            encontrados += pid is not None
            sin += pid is None
    except google.Cuota:
        print("  Google respondió 429: se acabó el tope del día. Se guarda lo avanzado.")
    except urllib.error.HTTPError as e:
        print(f"  Google respondió {e.code}: se guarda lo avanzado. Revisa la llave y que Places API (New) esté activa.")
    finally:
        _guardar(filas)
    faltan = sum(not f["google_place_id"].strip() and f["oculto"] != "1" for f in filas)
    con_id = sum(f["google_place_id"] not in ("", SIN_COINCIDENCIA) and f["oculto"] != "1" for f in filas)
    visibles = sum(f["oculto"] != "1" for f in filas)
    print(f"  encontrados {encontrados}; sin coincidencia {sin}; faltan {faltan}")
    print(f"  con place_id: {con_id} de {visibles} ({100 * con_id // max(visibles, 1)} %; meta ≥ 70 %)")


if __name__ == "__main__":
    main()
