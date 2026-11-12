"""SC-004: con la clave pública de Supabase nadie lee ni escribe ninguna tabla (RLS sin políticas).

Desde la feature 002 (cuentas) hay una excepción buscada: cualquiera lee las reseñas visibles, sus
votos y el resumen de un lugar. Sin sesión no se lee nada privado ni se escribe nada.

Solo corre con ``SUPABASE_URL`` y ``SUPABASE_PUBLISHABLE_KEY`` del ambiente (backend/.env); si faltan, se salta.
"""

import httpx
import pytest

from turismo_core.config import clave

TABLAS = ["fuente", "destino", "punto", "recinto_inah", "evento", "calendario", "hecho_observatorio", "hecho_inah",
          "establecimiento", "matriz_traslado", "obs_clima", "obs_trafico", "sesion", "reporte", "busqueda",
          "afluencia_estimada", "umbral_punto", "ajuste_manual",
          "perfil", "favorito", "resena_denuncia"]          # cuentas: privadas
NEGADO = (401, 403, 404)      # sin permiso o tabla no expuesta por la Data API


@pytest.fixture(scope="module")
def api():
    url, llave = clave("SUPABASE_URL"), clave("SUPABASE_PUBLISHABLE_KEY")
    if not (url and llave):
        pytest.skip("Sin SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY: se salta la prueba de seguridad")
    with httpx.Client(base_url=f"{url.rstrip('/')}/rest/v1", headers={"apikey": llave}, timeout=15) as c:
        yield c


@pytest.mark.parametrize("tabla", TABLAS)
def test_no_se_lee_ninguna_fila(api, tabla):
    r = api.get(f"/{tabla}", params={"select": "*", "limit": 1})
    assert r.status_code in NEGADO or (r.status_code == 200 and r.json() == []), r.text


@pytest.mark.parametrize("tabla, fila", [
    ("reporte", {"punto_id": 1, "creado_en": "2026-01-01T00:00:00", "nivel": 1}),
    ("sesion", {"id": "intruso"}),
    ("ajuste_manual", {"punto_id": 1, "color": "rojo", "motivo": "x", "creado_en": "2026-01-01", "hasta": "2026-01-02"}),
    ("resena", {"punto_id": 1, "estrellas": 5}),
    ("favorito", {"punto_id": 1}),
    ("resena_util", {"resena_id": 1}),
    ("resena_denuncia", {"resena_id": 1, "motivo": "x"}),
])
def test_no_se_escribe(api, tabla, fila):
    r = api.post(f"/{tabla}", json=fila)
    assert r.status_code in NEGADO, r.text


def test_resenas_publicas_solo_visibles(api):
    r = api.get("/resena", params={"select": "estado"})
    assert r.status_code == 200 and all(f["estado"] == "visible" for f in r.json()), r.text


def test_resumen_publico(api):
    r = api.post("/rpc/resumen_resenas", json={"p_punto": 1})
    assert r.status_code == 200 and set(r.json()[0]) >= {"promedio", "total", "pct_accesible"}, r.text


def test_sin_sesion_no_se_borra_cuenta(api):
    assert api.post("/rpc/borrar_mi_cuenta", json={}).status_code in NEGADO
