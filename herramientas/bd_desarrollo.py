"""Base de datos de desarrollo: corre el backend sin `data/raw/` ni `.env`.

Usa el mismo pipeline del backend con los datos ya procesados que vienen en git
(`backend/data/processed/`, el catálogo y los eventos) y calcula la afluencia estimada
de los próximos días. Lo único inventado son los **traslados**: OpenRouteService necesita
una clave, así que se aproximan con la distancia en línea recta. El clima y el tráfico
quedan vacíos (sin lluvia ni tráfico) y el asistente responde 503 si no hay Ollama.

Escribe en la base de `DATABASE_URL` (backend/.env), que debe ser `rumbo-dev` en Supabase.
Antes de tocar nada comprueba el proyecto al que apunta esa URL: solo corre contra el de
`rumbo-dev` (`PROYECTOS_DESARROLLO`), exige que `SUPABASE_URL` sea del mismo proyecto y pide
confirmación. `rumbo-demo` se carga con el pipeline completo (`scripts/pipeline.py`) en la laptop
que tiene `data/raw/` y las claves.

    cd backend
    uv run python ../herramientas/bd_desarrollo.py            # carga rumbo-dev (14 días de afluencia)
    uv run python ../herramientas/bd_desarrollo.py --dias 7
    uv run python ../herramientas/bd_desarrollo.py --si       # sin preguntar (scripts)
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

BACKEND = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND))

from scripts import calcular_afluencia, cargar_bd  # noqa: E402
from turismo_core.bd import conectar  # noqa: E402
from turismo_core.config import clave  # noqa: E402

# Proyectos de Supabase en los que esta herramienta puede escribir: solo rumbo-dev. El identificador
# (ref) no es secreto: va en la URL pública de cada proyecto. Si rumbo-dev se recrea, cambia aquí.
PROYECTOS_DESARROLLO = {"xrxhocitzsksamhsvfpi": "rumbo-dev"}

FUENTE = "Traslados aproximados para desarrollo (no oficiales)"
FACTOR_CALLE = 1.35        # la ruta en coche es más larga que la línea recta
FACTOR_PIE = 1.25
KMH_COCHE = 24             # velocidad promedio en ciudad, sin tráfico
KMH_PIE = 4.5
MINUTOS_ESTACIONAR = 4


def proyecto_de_bd(url: str) -> str | None:
    """Ref del proyecto de Supabase en una URL de Postgres (pooler o conexión directa)."""
    partes = urlsplit(url)
    usuario, host = partes.username or "", (partes.hostname or "").lower()
    if host.endswith(".pooler.supabase.com"):           # postgres.<ref>@aws-0-<región>.pooler…
        m = re.fullmatch(r"postgres\.([a-z0-9]+)", usuario)
    else:                                                # postgres@db.<ref>.supabase.co
        m = re.fullmatch(r"db\.([a-z0-9]+)\.supabase\.co", host)
    return m.group(1) if m else None


def proyecto_de_api(url: str) -> str | None:
    """Ref del proyecto en SUPABASE_URL (https://<ref>.supabase.co)."""
    m = re.fullmatch(r"([a-z0-9]+)\.supabase\.co", (urlsplit(url).hostname or "").lower())
    return m.group(1) if m else None


def destino_permitido(database_url: str | None, supabase_url: str | None) -> tuple[str, str]:
    """(nombre, host) de la base si se puede escribir en ella; si no, termina con el motivo."""
    if not database_url:
        sys.exit("Falta DATABASE_URL en backend/.env (la de rumbo-dev).")
    ref = proyecto_de_bd(database_url)
    if ref not in PROYECTOS_DESARROLLO:
        sys.exit(f"DATABASE_URL apunta a {ref or 'una base que no es de Supabase'}, que no es rumbo-dev. "
                 "Esta herramienta solo escribe en rumbo-dev: revisa backend/.env.")
    if supabase_url and proyecto_de_api(supabase_url) != ref:
        sys.exit(f"SUPABASE_URL es de otro proyecto ({proyecto_de_api(supabase_url)}) que DATABASE_URL ({ref}). "
                 "Las dos tienen que ser de rumbo-dev.")
    return PROYECTOS_DESARROLLO[ref], urlsplit(database_url).hostname


def confirmar(nombre: str, host: str, si: bool) -> None:
    print(f"== Va a reemplazar catálogo, datos oficiales, eventos, traslados y afluencia en {nombre} ({host}).")
    print("   Las sesiones, los reportes y las reseñas no se tocan.")
    if si:
        return
    if not sys.stdin.isatty():
        sys.exit("Sin terminal para confirmar: vuelve a correrlo con --si.")
    if input("   ¿Continuar? [s/N] ").strip().lower() not in {"s", "si", "sí"}:
        sys.exit("Cancelado; la base no cambió.")


def km_linea_recta(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def traslados_aproximados(con):
    puntos = [(r["id"], (r["lat"], r["lon"])) for r in con.execute("SELECT id, lat, lon FROM punto ORDER BY id")]
    con.execute(
        "INSERT INTO fuente (nombre, url, licencia, frecuencia, fecha_descarga) VALUES (%s, %s, %s, %s, %s) "
        "ON CONFLICT(nombre) DO UPDATE SET fecha_descarga = excluded.fecha_descarga",
        (FUENTE, "herramientas/bd_desarrollo.py", "Cálculo propio", "única", date.today().isoformat()),
    )
    fuente_id = con.execute("SELECT id FROM fuente WHERE nombre = %s", (FUENTE,)).fetchone()["id"]
    filas = []
    for o, a in puntos:
        for d, b in puntos:
            km = km_linea_recta(a, b)
            km_coche, km_pie = km * FACTOR_CALLE, km * FACTOR_PIE
            min_coche = 0 if o == d else km_coche / KMH_COCHE * 60 + MINUTOS_ESTACIONAR
            filas.append((o, d, round(min_coche, 1), round(km_coche, 2),
                          round(km_pie / KMH_PIE * 60, 1), round(km_pie, 2), fuente_id))
    con.execute("DELETE FROM matriz_traslado")
    con.cursor().executemany(
        "INSERT INTO matriz_traslado (origen_id, destino_id, minutos_base, km, minutos_pie, km_pie, fuente_id) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)", filas)
    return len(filas)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--dias", type=int, default=14, help="días de afluencia estimada a partir de hoy")
    p.add_argument("--si", action="store_true", help="no pedir confirmación")
    args = p.parse_args()

    if clave("RUMBO_AMBIENTE") == "demo":
        sys.exit("Esta herramienta no escribe en la base de demostración. Usa el .env de rumbo-dev.")
    nombre, host = destino_permitido(clave("DATABASE_URL"), clave("SUPABASE_URL"))
    confirmar(nombre, host, args.si)
    cargar_bd.main()
    with conectar() as con, con.transaction():
        print(f"== Traslados aproximados: {traslados_aproximados(con)} pares")
    calcular_afluencia.main(dias=args.dias)
    print("\nListo. Levanta el backend (usa DATABASE_URL de backend/.env):\n"
          "  PUEBLA_TAREAS=0 uv run uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    main()
