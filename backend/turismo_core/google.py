"""Google Places API (New): ``place_id`` de los lugares nuevos y horario y precio al abrir su ficha (feature 004).

Términos de Google Maps Platform: **no se guarda nada de esto salvo el place_id**. Ni en la base, ni en archivos,
ni en ChromaDB, ni en caché. Y no se muestra en el mapa (el nuestro no es de Google): solo en la ficha, con la
atribución "Google Maps". https://developers.google.com/maps/documentation/places/web-service/policies

La llave ``GOOGLE_MAPS_API_KEY`` vive solo en el backend. El tope de consultas lo pone la consola de Google; al
pasarlo responde 429 y aquí eso es ``motivo = "cuota"``.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from turismo_core.ampliar import distancia_m, normalizar
from turismo_core.config import clave

URL_DETALLES = "https://places.googleapis.com/v1/places/{place_id}?languageCode={idioma}"
URL_BUSCAR = "https://places.googleapis.com/v1/places:searchText"
# Field mask mínimo: estos campos son del SKU "Place Details Enterprise" (1,000 gratis al mes).
CAMPOS_DETALLES = ("regularOpeningHours.weekdayDescriptions,currentOpeningHours.openNow,"
                   "priceLevel,priceRange,attributions")
# Text Search con solo id, nombre y ubicación: SKU "Pro" (5,000 gratis al mes).
CAMPOS_BUSCAR = "places.id,places.displayName,places.location"
TIMEOUT_S = 3            # la ficha no espera a Google más que esto (SC-004)
COINCIDE_M = 250         # el resultado debe estar a esto o menos (el DENUE puede errar ~200 m en plazas)
PALABRAS_COMUNES = 0.6   # o compartir al menos esta parte de las palabras del nombre (typos del DENUE)

NIVELES = {"PRICE_LEVEL_FREE": "gratis", "PRICE_LEVEL_INEXPENSIVE": "economico",
           "PRICE_LEVEL_MODERATE": "moderado", "PRICE_LEVEL_EXPENSIVE": "caro",
           "PRICE_LEVEL_VERY_EXPENSIVE": "muy_caro"}
FUENTE = "Google Maps"


class Cuota(Exception):
    """Google respondió 429: se acabó el tope del día."""


def _llave() -> str | None:
    return clave("GOOGLE_MAPS_API_KEY")


def _pedir(url: str, campos: str, llave: str, cuerpo: dict | None = None, timeout: float = TIMEOUT_S) -> dict:
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(url, data=datos, headers={
        "X-Goog-Api-Key": llave, "X-Goog-FieldMask": campos, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 429:
            raise Cuota() from e
        raise


def vacio(motivo: str) -> dict:
    return {"disponible": False, "motivo": motivo, "abierto_ahora": None, "horario_semana": [],
            "nivel_precio": None, "rango_precio": None, "atribuciones": [], "fuente": FUENTE}


def _rango(r: dict | None) -> dict | None:
    if not r or "startPrice" not in r:
        return None
    ini, fin = r["startPrice"], r.get("endPrice") or {}
    return {"desde": int(ini.get("units", 0)), "hasta": int(fin["units"]) if "units" in fin else None,
            "moneda": ini.get("currencyCode", "MXN")}


def leer_detalles(d: dict) -> dict:
    """Respuesta de Place Details (New) -> lo que devuelve ``/api/puntos/{id}/google``."""
    salida = {
        "disponible": True, "motivo": None,
        "abierto_ahora": (d.get("currentOpeningHours") or {}).get("openNow"),
        "horario_semana": (d.get("regularOpeningHours") or {}).get("weekdayDescriptions", []),
        "nivel_precio": NIVELES.get(d.get("priceLevel", "")),
        "rango_precio": _rango(d.get("priceRange")),
        "atribuciones": [a["provider"] for a in d.get("attributions", []) if a.get("provider")],
        "fuente": FUENTE,
    }
    if not salida["horario_semana"] and salida["nivel_precio"] is None and salida["rango_precio"] is None \
            and salida["abierto_ahora"] is None:
        return vacio("error")            # Google no tiene nada útil de ese lugar
    return salida


def datos(place_id: str | None, idioma: str = "es", pedir=None) -> dict:
    """Horario y precio en este momento. Nunca lanza: si algo falla, ``disponible = False`` con su motivo."""
    if not place_id:
        return vacio("sin_place_id")
    llave = _llave()
    if not llave:
        return vacio("sin_llave")
    pedir = pedir or _pedir
    try:
        return leer_detalles(pedir(URL_DETALLES.format(place_id=place_id, idioma=idioma), CAMPOS_DETALLES, llave))
    except Cuota:
        return vacio("cuota")
    except (urllib.error.URLError, TimeoutError, ConnectionError, ValueError, KeyError, TypeError):
        return vacio("error")


def coincide(nombre: str, lat: float, lon: float, lugar: dict) -> bool:
    """El resultado de Text Search es el mismo lugar: a ≤ 250 m y con nombre equivalente o casi igual."""
    loc, texto = lugar.get("location") or {}, (lugar.get("displayName") or {}).get("text", "")
    if "latitude" not in loc or distancia_m(lat, lon, loc["latitude"], loc["longitude"]) > COINCIDE_M:
        return False
    a, b = normalizar(nombre), normalizar(texto)
    if not (a and b):
        return False
    pa, pb = set(a.split()), set(b.split())
    return a in b or b in a or len(pa & pb) / len(pa | pb) >= PALABRAS_COMUNES


def buscar_place_id(nombre: str, municipio: str, lat: float, lon: float, pedir=None) -> str | None:
    """``place_id`` del lugar, o None si no hay coincidencia confiable. Lanza ``Cuota`` con 429."""
    llave = _llave()
    if not llave:
        raise SystemExit("Falta GOOGLE_MAPS_API_KEY en backend/.env")
    cuerpo = {"textQuery": f"{nombre}, {municipio}, Puebla", "languageCode": "es", "maxResultCount": 3,
              "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lon}, "radius": float(COINCIDE_M)}}}
    respuesta = (pedir or _pedir)(URL_BUSCAR, CAMPOS_BUSCAR, llave, cuerpo, 10)
    return next((p["id"] for p in respuesta.get("places", []) if coincide(nombre, lat, lon, p)), None)
