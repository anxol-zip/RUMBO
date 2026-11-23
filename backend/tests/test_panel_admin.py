"""El panel solo responde a administradores (feature 002, US2): 401 sin sesión válida, 403 a turistas.

Los tokens se firman con una llave EC de prueba que sustituye a las llaves públicas (JWKS) de Supabase.
Los usuarios de prueba se crean en auth.users y se borran al terminar.
"""

import time
from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app import deps
from app.main import app
from turismo_core.bd import conectar

LLAVE = ec.generate_private_key(ec.SECP256R1())


def token(sub, aud="authenticated", vence_en=3600, llave=LLAVE):
    datos = {"sub": sub, "aud": aud, "role": "authenticated", "exp": int(time.time()) + vence_en}
    return jwt.encode(datos, llave, algorithm="ES256")


@pytest.fixture
def api(esquema_prueba, monkeypatch):
    monkeypatch.setenv("PUEBLA_TAREAS", "0")
    llaves = SimpleNamespace(get_signing_key_from_jwt=lambda _t: SimpleNamespace(key=LLAVE.public_key()))
    monkeypatch.setattr(deps, "_llaves", lambda: llaves)
    creados = []

    def persona(rol):
        uid = str(uuid4())
        with conectar() as con:
            con.execute("INSERT INTO auth.users (id, aud, role, email) VALUES (%s, 'authenticated', 'authenticated', %s)",
                        (uid, f"{uid[:8]}@prueba.rumbo"))
            con.execute("UPDATE perfil SET rol = %s WHERE id = %s", (rol, uid))
        creados.append(uid)
        return uid

    def conexion():
        with conectar() as c:
            yield c

    app.dependency_overrides[deps.conexion] = conexion        # sin override de solo_admin: corre de verdad
    try:
        yield TestClient(app), persona
    finally:
        app.dependency_overrides.clear()
        with conectar() as con:
            con.execute("DELETE FROM auth.users WHERE id = ANY(%s::uuid[])", (creados,))


def con_token(t):
    return {"Authorization": f"Bearer {t}"}


AJUSTE = {"punto_id": 1, "color": "rojo", "motivo": "Obra", "horas": 2}


def test_sin_encabezado_401(api):
    c, _ = api
    r = c.get("/api/panel/umbrales")
    assert r.status_code == 401 and r.json()["detail"] == "Inicia sesión para entrar al panel."


@pytest.mark.parametrize("malo", ["basura",
                                  token(str(uuid4()), vence_en=-60),
                                  token(str(uuid4()), aud="otro"),
                                  token(str(uuid4()), llave=ec.generate_private_key(ec.SECP256R1()))])
def test_token_invalido_401(api, malo):
    c, _ = api
    r = c.get("/api/panel/umbrales", headers=con_token(malo))
    assert r.status_code == 401 and r.json()["detail"] == "Tu sesión no es válida. Vuelve a iniciar sesión."


def test_turista_403(api):
    c, persona = api
    r = c.get("/api/panel/umbrales", headers=con_token(token(persona("turista"))))
    assert r.status_code == 403 and r.json()["detail"] == "Solo administradores."


def test_sin_perfil_403(api):
    c, _ = api
    assert c.get("/api/panel/umbrales", headers=con_token(token(str(uuid4())))).status_code == 403


def test_administrador_200(api):
    c, persona = api
    assert c.get("/api/panel/umbrales", headers=con_token(token(persona("administrador")))).status_code == 200


def test_post_rechazado_no_crea_ajuste(api):
    c, persona = api
    assert c.post("/api/panel/ajustes", json=AJUSTE).status_code == 401
    assert c.post("/api/panel/ajustes", json=AJUSTE, headers=con_token(token(persona("turista")))).status_code == 403
    with conectar() as con:
        assert con.execute("SELECT count(*) AS n FROM ajuste_manual").fetchone()["n"] == 0
