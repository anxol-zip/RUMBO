"""Google Places (feature 004), sin red: mapeo de la respuesta, motivos de falla y búsqueda del place_id."""

import urllib.error

import pytest

from turismo_core import google

DETALLES = {
    "regularOpeningHours": {"weekdayDescriptions": ["lunes: 8:00–22:00", "martes: 8:00–22:00"]},
    "currentOpeningHours": {"openNow": True},
    "priceLevel": "PRICE_LEVEL_MODERATE",
    "priceRange": {"startPrice": {"currencyCode": "MXN", "units": "200"},
                   "endPrice": {"currencyCode": "MXN", "units": "400"}},
    "attributions": [{"provider": "Proveedor X", "providerUri": "https://x"}],
}


@pytest.fixture
def con_llave(monkeypatch):
    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "llave-secreta")


def test_datos_mapea_la_respuesta(con_llave):
    pedidos = []

    def pedir(url, campos, llave, cuerpo=None, timeout=None):
        pedidos.append((url, campos, llave))
        return DETALLES

    d = google.datos("ChIJ1", "en", pedir=pedir)
    assert d == {"disponible": True, "motivo": None, "abierto_ahora": True,
                 "horario_semana": ["lunes: 8:00–22:00", "martes: 8:00–22:00"], "nivel_precio": "moderado",
                 "rango_precio": {"desde": 200, "hasta": 400, "moneda": "MXN"},
                 "atribuciones": ["Proveedor X"], "fuente": "Google Maps"}
    url, campos, llave = pedidos[0]
    assert url.endswith("/places/ChIJ1?languageCode=en") and "priceLevel" in campos and llave == "llave-secreta"
    assert "llave-secreta" not in str(d)


@pytest.mark.parametrize("nivel,esperado", [
    ("PRICE_LEVEL_FREE", "gratis"), ("PRICE_LEVEL_INEXPENSIVE", "economico"), ("PRICE_LEVEL_MODERATE", "moderado"),
    ("PRICE_LEVEL_EXPENSIVE", "caro"), ("PRICE_LEVEL_VERY_EXPENSIVE", "muy_caro"), ("PRICE_LEVEL_UNSPECIFIED", None)])
def test_niveles_de_precio(nivel, esperado):
    assert google.leer_detalles({"priceLevel": nivel, "currentOpeningHours": {"openNow": False}})["nivel_precio"] == esperado


def test_sin_place_id_o_sin_llave_no_llama(monkeypatch):
    def no_llamar(*a, **k):
        raise AssertionError("no debió llamar a Google")

    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "k")
    assert google.datos(None, pedir=no_llamar)["motivo"] == "sin_place_id"
    monkeypatch.delenv("GOOGLE_MAPS_API_KEY")
    monkeypatch.setattr(google, "clave", lambda nombre: None)
    assert google.datos("ChIJ1", pedir=no_llamar)["motivo"] == "sin_llave"


@pytest.mark.parametrize("error,motivo", [
    (google.Cuota(), "cuota"), (TimeoutError(), "error"), (urllib.error.URLError("sin red"), "error"),
    (urllib.error.HTTPError("u", 500, "x", {}, None), "error")])
def test_fallas_de_google_no_rompen_la_ficha(con_llave, error, motivo):
    def falla(*a, **k):
        raise error

    d = google.datos("ChIJ1", pedir=falla)
    assert (d["disponible"], d["motivo"], d["horario_semana"]) == (False, motivo, [])


def test_respuesta_vacia_cuenta_como_sin_datos(con_llave):
    assert google.datos("ChIJ1", pedir=lambda *a, **k: {})["disponible"] is False


def test_coincide_por_distancia_y_nombre():
    lugar = {"displayName": {"text": "Restaurante La Casa del Mendrugo"}, "location": {"latitude": 19.0400, "longitude": -98.2}}
    assert google.coincide("La Casa Del Mendrugo", 19.0402, -98.2, lugar)          # ~22 m
    assert google.coincide("La Casa Del Mendrugo", 19.0420, -98.2, lugar)          # ~220 m: el DENUE erra
    assert not google.coincide("La Casa Del Mendrugo", 19.0430, -98.2, lugar)      # ~330 m
    assert not google.coincide("Tacos Robert", 19.0400, -98.2, lugar)
    typo = {"displayName": {"text": "Dynasty. Legendary Chinese Food"}, "location": {"latitude": 19.0697, "longitude": -98.1722}}
    assert google.coincide("Dynasty Legendary Chenise Food", 19.0714, -98.1734, typo)   # 3 de 5 palabras, 224 m


def test_buscar_place_id_toma_el_que_coincide(con_llave):
    cuerpos = []

    def pedir(url, campos, llave, cuerpo=None, timeout=None):
        cuerpos.append(cuerpo)
        return {"places": [
            {"id": "otro", "displayName": {"text": "Oxxo"}, "location": {"latitude": 19.04, "longitude": -98.2}},
            {"id": "ChIJbueno", "displayName": {"text": "Café Tres Gallos"}, "location": {"latitude": 19.04, "longitude": -98.2}}]}

    assert google.buscar_place_id("Café Tres Gallos", "Puebla", 19.04, -98.2, pedir=pedir) == "ChIJbueno"
    assert cuerpos[0]["textQuery"] == "Café Tres Gallos, Puebla, Puebla"
    assert google.buscar_place_id("Otro lugar", "Puebla", 19.04, -98.2, pedir=pedir) is None
