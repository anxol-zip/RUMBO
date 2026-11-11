"""Pruebas con base: un esquema temporal ``prueba_<hex>`` por prueba en ``DATABASE_URL_PRUEBAS``.

Fija ``DATABASE_URL`` y ``RUMBO_ESQUEMA`` en el entorno de la prueba, así ``conectar()`` (y con él
el servidor MCP y los scripts) usa ese esquema. Al terminar lo borra. Sin la variable, se salta.
"""

import json
from contextlib import contextmanager
from uuid import uuid4

import psycopg
import pytest
from psycopg import sql

from turismo_core.bd import conectar, crear_esquema
from turismo_core.config import clave


@pytest.fixture
def esquema_prueba(monkeypatch):
    url = clave("DATABASE_URL_PRUEBAS")
    if not url:
        pytest.skip("Sin DATABASE_URL_PRUEBAS: se saltan las pruebas que usan base (ver INSTALACION.md)")
    esquema = f"prueba_{uuid4().hex[:8]}"
    with psycopg.connect(url, autocommit=True) as con:
        con.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(esquema)))
    monkeypatch.setenv("DATABASE_URL", url)
    monkeypatch.setenv("RUMBO_ESQUEMA", esquema)
    try:
        with conectar() as con:
            crear_esquema(con)
        yield conectar
    finally:
        with psycopg.connect(url, autocommit=True) as con:
            con.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(esquema)))


# ── Cuentas (feature 002): personas simuladas. Usar solo dentro de con.transaction(force_rollback=True),
# así las filas de auth.users (que vive fuera del esquema temporal) se deshacen al terminar.

def usuario(con, nombre: str | None = "Ana López") -> str:
    """Crea un usuario de Supabase de prueba; el trigger crear_perfil le hace su perfil. Devuelve su id."""
    uid = str(uuid4())
    meta = json.dumps({"full_name": nombre} if nombre else {})
    con.execute("INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data) "
                "VALUES (%s, 'authenticated', 'authenticated', %s, %s::jsonb)",
                (uid, f"{uid[:8]}@prueba.rumbo", meta))
    return uid


@contextmanager
def como(con, uid: str | None):
    """Las consultas dentro corren como esa persona con la clave pública (RLS); uid=None es anónimo."""
    rol = "authenticated" if uid else "anon"
    claims = {"sub": uid, "role": rol} if uid else {"role": rol}
    con.execute(sql.SQL("SET LOCAL ROLE {}").format(sql.Identifier(rol)))
    con.execute("SELECT set_config('request.jwt.claims', %s, true)", (json.dumps(claims),))
    try:
        yield con
    finally:
        con.execute("RESET ROLE")
        con.execute("SELECT set_config('request.jwt.claims', '', true)")   # vuelve a ser el equipo (postgres)


def hacer_admin(con, uid: str) -> None:
    con.execute("UPDATE perfil SET rol = 'administrador' WHERE id = %s", (uid,))
