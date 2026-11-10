"""Pruebas con base: un esquema temporal ``prueba_<hex>`` por prueba en ``DATABASE_URL_PRUEBAS``.

Fija ``DATABASE_URL`` y ``RUMBO_ESQUEMA`` en el entorno de la prueba, así ``conectar()`` (y con él
el servidor MCP y los scripts) usa ese esquema. Al terminar lo borra. Sin la variable, se salta.
"""

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
