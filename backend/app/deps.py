"""Dependencias de FastAPI: conexión del pool por petición, la hora, el modo demo y el acceso al panel.

En las pruebas se reemplazan con ``app.dependency_overrides`` (BD temporal y hora fija).
"""

from __future__ import annotations

import logging
import os
from collections.abc import Iterator
from datetime import datetime
from functools import cache
from typing import Annotated

import jwt
import psycopg
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from turismo_core.config import clave

log = logging.getLogger(__name__)


def conexion(request: Request) -> Iterator[psycopg.Connection]:
    with request.app.state.pool.connection() as con:
        yield con


def ahora() -> datetime:
    """Siempre la hora real: no hay modo escenario (decisión del 2026-10-15)."""
    return datetime.now().replace(microsecond=0)


def es_demo() -> bool:
    """``PUEBLA_DEMO=1`` al levantar la API en el stand: las sesiones nuevas se marcan ``es_demo`` (RN_11)."""
    return os.environ.get("PUEBLA_DEMO", "0") == "1"


Con = Annotated[psycopg.Connection, Depends(conexion)]
Ahora = Annotated[datetime, Depends(ahora)]
EsDemo = Annotated[bool, Depends(es_demo)]


@cache
def _llaves() -> jwt.PyJWKClient | None:
    """Llaves públicas del proyecto de Supabase (JWKS). PyJWKClient las guarda en caché."""
    url = clave("SUPABASE_URL")
    if not url:
        log.warning("Falta SUPABASE_URL: el panel no puede verificar sesiones")
        return None
    return jwt.PyJWKClient(f"{url.rstrip('/')}/auth/v1/.well-known/jwks.json", cache_keys=True)


def solo_admin(con: Con, credenciales: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False))) -> str:
    """Deja pasar solo a administradores (feature 002): 401 sin sesión válida, 403 a los demás.

    Verifica el token de Supabase con sus llaves públicas y lee el rol en ``perfil``, así quitar el
    rol surte efecto de inmediato. Devuelve el id del administrador.
    """
    if credenciales is None:
        raise HTTPException(401, "Inicia sesión para entrar al panel.")
    llaves = _llaves()
    try:
        if llaves is None:
            raise jwt.InvalidTokenError("sin SUPABASE_URL")
        llave = llaves.get_signing_key_from_jwt(credenciales.credentials).key
        datos = jwt.decode(credenciales.credentials, llave, algorithms=["ES256", "RS256"], audience="authenticated")
    except jwt.PyJWKClientError as e:
        log.warning("No se encontró la llave del token (¿JWT Signing Keys activas en Supabase?): %s", e)
        raise HTTPException(401, "Tu sesión no es válida. Vuelve a iniciar sesión.") from None
    except jwt.PyJWTError:
        raise HTTPException(401, "Tu sesión no es válida. Vuelve a iniciar sesión.") from None
    fila = con.execute("SELECT rol FROM perfil WHERE id = %s", (datos.get("sub"),)).fetchone()
    if not fila or fila["rol"] != "administrador":
        raise HTTPException(403, "Solo administradores.")
    return datos["sub"]
