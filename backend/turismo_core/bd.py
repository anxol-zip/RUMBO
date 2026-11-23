"""Conexión a PostgreSQL (Supabase) y creación del esquema (sql/esquema_postgres.sql).

``DATABASE_URL`` (entorno o ``backend/.env``) es la URL del Session pooler del ambiente.
``RUMBO_ESQUEMA`` (opcional, solo pruebas) cambia el esquema de cada conexión con ``SET search_path``.
"""

from __future__ import annotations

from pathlib import Path

import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

BACKEND = Path(__file__).resolve().parents[1]
REPO = BACKEND.parent
DATA = BACKEND / "data"
ESQUEMA = BACKEND / "sql" / "esquema_postgres.sql"


def _clave(nombre: str) -> str | None:
    from turismo_core.config import clave   # config importa BACKEND de aquí
    return clave(nombre)


def url_bd() -> str:
    """La URL de ``DATABASE_URL``, o un error claro si falta o todavía es de SQLite."""
    url = _clave("DATABASE_URL")
    if not url:
        raise RuntimeError("Falta DATABASE_URL. Ponla en backend/.env con la URL del Session pooler de "
                           "Supabase (ver INSTALACION.md y backend/.env.example).")
    if url.startswith("sqlite:"):
        raise RuntimeError("DATABASE_URL apunta a SQLite, pero la base ahora está en Supabase. Cámbiala en "
                           "backend/.env por la URL del Session pooler (ver INSTALACION.md).")
    return url


def _usar_esquema(con: psycopg.Connection) -> None:
    if esquema := _clave("RUMBO_ESQUEMA"):
        con.execute(sql.SQL("SET search_path TO {}").format(sql.Identifier(esquema)))


def conectar(url: str | None = None) -> psycopg.Connection:
    """Conexión suelta (scripts, MCP, tareas). ``with conectar() as con:`` la cierra al salir."""
    con = psycopg.connect(url or url_bd(), row_factory=dict_row, autocommit=True, connect_timeout=10)
    _usar_esquema(con)
    return con


def crear_pool() -> ConnectionPool:
    """Pool de la API. ``max_size=10``: /api/chat retiene su conexión mientras responde el modelo;
    ``timeout=5``: con la base saturada o caída se responde 503 rápido; ``check`` descarta las
    conexiones que quedaron rotas tras un corte, así la app se recupera sola."""
    return ConnectionPool(url_bd(), min_size=1, max_size=10, timeout=5, open=True,
                          kwargs={"row_factory": dict_row, "autocommit": True, "connect_timeout": 10},
                          configure=_usar_esquema, check=ConnectionPool.check_connection)


# Columnas agregadas al esquema después de crear la BD. Ya vienen en el CREATE TABLE; esto es por si
# un ambiente se creó antes con una versión vieja del esquema.
COLUMNAS_NUEVAS = [
    ("evento", "nota", "TEXT"),
    ("matriz_traslado", "minutos_pie", "REAL"),
    ("matriz_traslado", "km_pie", "REAL"),
    ("obs_trafico", "minutos_actual", "REAL"),      # paso 10: TomTom Routing por corredor
    ("obs_trafico", "minutos_libre", "REAL"),
    ("obs_trafico", "minutos_historico", "REAL"),
    ("obs_trafico", "km", "REAL"),
]
TIPO_PG = {"TEXT": 'TEXT COLLATE "C"', "REAL": "DOUBLE PRECISION"}


def crear_esquema(con: psycopg.Connection) -> None:
    """Crea lo que falte sin tocar los datos."""
    con.execute(ESQUEMA.read_text(encoding="utf-8"))
    for tabla, columna, tipo in COLUMNAS_NUEVAS:
        con.execute(f"ALTER TABLE {tabla} ADD COLUMN IF NOT EXISTS {columna} {TIPO_PG[tipo]}")
