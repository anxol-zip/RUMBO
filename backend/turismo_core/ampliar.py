"""Catálogo ampliado: lugares nuevos de DENUE y OpenStreetMap alrededor de los 23 curados (feature 004).

Funciones puras (sin red ni base) que usa ``scripts.ampliar_catalogo``. De Google aquí no entra nada: los
términos de Places solo dejan guardar el ``place_id``, que pone ``scripts.buscar_place_id``.

Cómo se eligen (research R2): a ≤ 1.5 km de un curado; primero los de OSM con horario, luego los del DENUE con
6 personas o más, luego el resto, y dentro de cada nivel el más cercano. Cupo por grupo para que no todo sea comida y tope por curado para que no se amontonen en un solo lugar.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from collections import Counter
from collections.abc import Iterable

RADIO_M = 1500            # distancia máxima a un curado
MISMO_LUGAR_M = 200       # dos registros a menos de esto con nombre equivalente son el mismo lugar
                          # (las zonas grandes, como la pirámide de Cholula, tienen el punto lejos del centro)
POR_CURADO = 5            # tope de lugares nuevos cerca de un mismo curado, para repartirlos en la zona
CUPO = {"comida": 50, "atractivos": 50}
GRUPO = {"restaurante": "comida", "cafe": "comida",
         "museo": "atractivos", "atractivo": "atractivos", "mirador": "atractivos", "parque": "atractivos"}

DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"]
_DIAS_OSM = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

# SCIAN del DENUE que sí son lugares a donde ir (sin comida para llevar, comedores ni bares).
SCIAN_TIPO = {
    "722511": "restaurante", "722512": "restaurante", "722513": "restaurante", "722514": "restaurante",
    "722516": "restaurante", "722519": "restaurante", "722515": "cafe",
    "712111": "museo", "712112": "museo", "712131": "parque", "712190": "atractivo",
}
OSM_TIPO = {
    ("amenity", "restaurant"): "restaurante", ("amenity", "cafe"): "cafe",
    ("tourism", "museum"): "museo", ("tourism", "gallery"): "museo",
    ("tourism", "attraction"): "atractivo", ("tourism", "viewpoint"): "mirador", ("leisure", "park"): "parque",
}
CATEGORIAS = {"restaurante": "gastronomia", "cafe": "gastronomia", "museo": "cultura,arte",
              "atractivo": "cultura", "mirador": "naturaleza", "parque": "naturaleza,familia"}
DURACION = {"restaurante": "1-2 h", "cafe": "30-60 min", "museo": "1-2 h",
            "atractivo": "30-60 min", "mirador": "30-60 min", "parque": "1-2 h"}
INTERIOR = {"restaurante": 1, "cafe": 1, "museo": 1, "atractivo": 0, "mirador": 0, "parque": 0}
NOMBRE_TIPO = {"restaurante": "Restaurante", "cafe": "Café", "museo": "Museo",
               "atractivo": "Atractivo", "mirador": "Mirador", "parque": "Parque"}

# Cadenas y nombres que no aportan a un turista (lista corta a propósito; lo demás se oculta a mano con oculto=1).
CADENAS = ("oxxo", "starbucks", "mcdonald", "burger king", "kfc", "domino", "little caesars", "subway",
           "vips", "sanborns", "italian coffee", "punta del cielo", "toks", "carls jr", "pizza hut", "7 eleven",
           "dunkin", "wings", "cafe del pacifico", "el globo", "ihop", "herbalife", "nutricion",
           "videojuegos", "workosfera", "coworking", "mc donald", "italian coff", "chilis", "sin nombre",
           "unidad de servicios", "cancha")

_VACIAS = {"restaurante", "restaurant", "rest", "cafe", "cafeteria", "coffee", "museo", "el", "la", "los", "las",
           "de", "del", "y", "the", "ac", "sa", "cv", "sc", "bar"}


# ───────────── Nombres y distancia ─────────────

def normalizar(nombre: str) -> str:
    """``'Restaurante El Mural de los Poblanos'`` -> ``'mural poblanos'``: sin acentos, signos ni palabras vacías."""
    s = unicodedata.normalize("NFKD", nombre or "").encode("ascii", "ignore").decode().lower().replace(".", "")
    return " ".join(p for p in re.sub(r"[^a-z0-9]+", " ", s).split() if p not in _VACIAS)


def nombre_bonito(nombre: str) -> str:
    """El DENUE viene en mayúsculas: ``'LA CASA DEL MOLE'`` -> ``'La Casa del Mole'``."""
    if nombre != nombre.upper():
        return nombre.strip()
    menores = {"de", "del", "la", "las", "el", "los", "y", "en", "a"}
    palabras = nombre.lower().split()
    return " ".join(p if i and p in menores else p[:1].upper() + p[1:] for i, p in enumerate(palabras))


def distancia_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = (math.sin((p2 - p1) / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2)
    return 2 * r * math.asin(math.sqrt(a))


def mismo_lugar(a: dict, b: dict) -> bool:
    """Misma clave DENUE u OSM, o a < 200 m con nombre igual o uno dentro del otro."""
    for k in ("clee_denue", "osm_id"):
        if a.get(k) and a.get(k) == b.get(k):
            return True
    if distancia_m(float(a["lat"]), float(a["lon"]), float(b["lat"]), float(b["lon"])) >= MISMO_LUGAR_M:
        return False
    na, nb = normalizar(a["nombre"]), normalizar(b["nombre"])
    return bool(na and nb) and (na == nb or na in nb or nb in na)


def es_cadena(nombre: str) -> bool:
    n = " " + re.sub(r"[^a-z0-9]+", " ", unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore")
                     .decode().lower()) + " "
    return any(f" {c} " in n or n.strip().startswith(c) for c in CADENAS)


# ───────────── Horario de OpenStreetMap ─────────────

_REGLA = re.compile(r"^([A-Za-z,\-]+)\s+(\d{2}:\d{2}-\d{2}:\d{2}(?:,\d{2}:\d{2}-\d{2}:\d{2})*)$")


def _dias(texto: str) -> list[int] | None:
    dias: list[int] = []
    for parte in texto.split(","):
        if "-" in parte:
            ini, fin = parte.split("-")
            if ini not in _DIAS_OSM or fin not in _DIAS_OSM:
                return None
            i, f = _DIAS_OSM.index(ini), _DIAS_OSM.index(fin)
            dias += [(i + k) % 7 for k in range((f - i) % 7 + 1)]
        elif parte in _DIAS_OSM:
            dias.append(_DIAS_OSM.index(parte))
        else:
            return None
    return dias


def horario_osm(texto: str | None) -> str | None:
    """``opening_hours`` de OSM -> JSON por día del catálogo, solo en el formato simple.

    ``'Mo-Fr 09:00-18:00; Sa 10:00-14:00'`` -> ``'{"lun": "09:00-18:00", …, "sab": "10:00-14:00"}'``.
    Festivos, meses, ``off``, horarios después de medianoche o cualquier cosa rara -> ``None`` (se usa el
    horario supuesto del tipo).
    """
    if not texto:
        return None
    texto = texto.strip()
    if texto == "24/7":
        return json.dumps({d: "00:00-24:00" for d in DIAS}, ensure_ascii=False)
    por_dia: dict[int, str] = {}
    for regla in (r.strip() for r in texto.split(";")):
        m = _REGLA.match(regla)
        if not m or (dias := _dias(m.group(1))) is None:
            return None
        for rango in m.group(2).split(","):
            ini, fin = rango.split("-")
            if not ("00:00" <= ini < fin <= "24:00") or int(ini[3:]) >= 60 or int(fin[3:]) >= 60:
                return None
        for d in dias:
            por_dia[d] = m.group(2)
    return json.dumps({DIAS[d]: por_dia[d] for d in sorted(por_dia)}, ensure_ascii=False) if por_dia else None


# ───────────── Candidatos ─────────────

def tipo_denue(codigo_act: str) -> str | None:
    return SCIAN_TIPO.get(codigo_act.strip())


def tipo_osm(etiquetas: dict[str, str]) -> str | None:
    for (k, v), tipo in OSM_TIPO.items():
        if etiquetas.get(k) == v:
            return tipo
    return None


def _clave(prefijo: str, texto: str) -> str:
    return f"{prefijo}_{hashlib.sha1(texto.encode()).hexdigest()[:8]}"


def desde_denue(fila: dict) -> dict | None:
    """Una fila de ``denue_zona_piloto.csv`` -> candidato, o None si no es de un giro que interese."""
    tipo = tipo_denue(fila["codigo_act"])
    if tipo is None or not fila.get("lat") or es_cadena(fila["nombre"]):
        return None
    return {"id": _clave("denue", fila["clee"]), "fuente": "denue", "nombre": nombre_bonito(fila["nombre"]),
            "tipo": tipo, "lat": float(fila["lat"]), "lon": float(fila["lon"]), "municipio": fila["municipio"],
            "clee_denue": fila["clee"], "osm_id": "", "horario": None,
            "grande": not fila["per_ocu"].startswith("0 a 5")}


def desde_osm(elemento: dict) -> dict | None:
    """Un elemento de Overpass (``out center tags``) -> candidato, o None."""
    etiquetas = elemento.get("tags", {})
    tipo, nombre = tipo_osm(etiquetas), etiquetas.get("name")
    lat = elemento.get("lat", elemento.get("center", {}).get("lat"))
    lon = elemento.get("lon", elemento.get("center", {}).get("lon"))
    if tipo is None or not nombre or lat is None or es_cadena(nombre):
        return None
    osm_id = f"{elemento['type']}/{elemento['id']}"
    return {"id": _clave("osm", osm_id), "fuente": "osm", "nombre": nombre.strip(), "tipo": tipo,
            "lat": float(lat), "lon": float(lon), "municipio": "", "clee_denue": "", "osm_id": osm_id,
            "horario": horario_osm(etiquetas.get("opening_hours")), "grande": False}


def _cercano(c: dict, curados: list[dict]) -> tuple[dict, float]:
    return min(((p, distancia_m(c["lat"], c["lon"], float(p["lat"]), float(p["lon"]))) for p in curados),
               key=lambda x: x[1])


def _nivel(c: dict) -> int:
    if c["fuente"] == "osm" and c["horario"]:
        return 0
    return 1 if c["grande"] or c["fuente"] == "osm" else 2


def deduplicar(candidatos: Iterable[dict], curados: list[dict]) -> tuple[list[dict], int]:
    """Quita los que ya son curados y junta DENUE con OSM (gana OSM, que trae horario; conserva la clave DENUE)."""
    unicos: list[dict] = []
    descartados = 0
    # OSM primero: así, cuando un DENUE coincide, el que se queda es el de OSM.
    for c in sorted(candidatos, key=lambda c: (c["fuente"] != "osm", c["id"])):
        if any(mismo_lugar(c, p) for p in curados):
            descartados += 1
            continue
        igual = next((u for u in unicos if mismo_lugar(c, u)), None)
        if igual is None:
            unicos.append(c)
            continue
        descartados += 1
        if not igual["clee_denue"] and c["clee_denue"]:
            igual["clee_denue"] = c["clee_denue"]
            igual["grande"] = igual["grande"] or c["grande"]
    return unicos, descartados


def elegir(candidatos: list[dict], curados: list[dict], cupo: dict[str, int] = CUPO) -> list[dict]:
    """Los mejores por grupo (research R2). Si un grupo no llena su cupo, el otro usa lo que sobra."""
    cerca = []
    for c in candidatos:
        p, d = _cercano(c, curados)
        if d <= RADIO_M:
            cerca.append(c | {"_curado": p, "_dist": d})
    orden = sorted(cerca, key=lambda c: (_nivel(c), c["_dist"], c["id"]))
    total = sum(cupo.values())
    elegidos: list[dict] = []
    por_curado: Counter = Counter()

    def tomar(filas: list[dict], n: int) -> None:
        for c in filas:
            if n <= 0:
                return
            clave = (c["_curado"]["id"], GRUPO[c["tipo"]])
            if c not in elegidos and por_curado[clave] < POR_CURADO:
                elegidos.append(c)
                por_curado[clave] += 1
                n -= 1

    for grupo, n in cupo.items():
        tomar([c for c in orden if GRUPO[c["tipo"]] == grupo], n)
    tomar(orden, total - len(elegidos))
    return sorted(elegidos, key=lambda c: c["id"])


# ───────────── Fila del catálogo ─────────────

COLUMNAS = ["id", "nombre", "destino", "municipio", "tipo", "categorias", "interior", "lat", "lon", "horario",
            "costo_mxn", "duracion_sugerida", "inah", "ficha", "fuente", "verificado", "clee_denue", "osm_id",
            "google_place_id", "oculto"]


def ficha_propia(c: dict, curado: dict, distancia: float) -> str:
    """Texto para la ficha y el asistente; solo datos propios (nunca de Google)."""
    cerca = f"a {round(distancia / 50) * 50:.0f} m de {curado['nombre']}" if distancia >= 50 else f"junto a {curado['nombre']}"
    fuente = "OpenStreetMap" if c["fuente"] == "osm" else "DENUE (INEGI)"
    return f"{NOMBRE_TIPO[c['tipo']]} en {curado['destino']}, {cerca}. Datos de {fuente}."


def fila(c: dict, fecha_denue: str, hoy: str) -> dict:
    curado, d = c["_curado"], c["_dist"]
    if c["fuente"] == "osm":
        fuente = f"coordenada: © colaboradores de OpenStreetMap (ODbL); generado {hoy}"
    else:
        fuente = f"coordenada: DENUE {fecha_denue} (INEGI); generado {hoy}"
    return {
        "id": c["id"], "nombre": c["nombre"], "destino": curado["destino"],
        # shortcut: OSM no trae municipio; se toma el del curado más cercano (≤ 1.5 km). En los bordes entre
        # Puebla y las Cholulas puede quedar el vecino; corregir a mano si importa.
        "municipio": c["municipio"] or curado["municipio"],
        "tipo": c["tipo"], "categorias": CATEGORIAS[c["tipo"]], "interior": INTERIOR[c["tipo"]],
        "lat": round(c["lat"], 7), "lon": round(c["lon"], 7), "horario": c["horario"] or "", "costo_mxn": "",
        "duracion_sugerida": DURACION[c["tipo"]], "inah": 0, "ficha": ficha_propia(c, curado, d),
        "fuente": fuente, "verificado": 0, "clee_denue": c["clee_denue"], "osm_id": c["osm_id"],
        "google_place_id": "", "oculto": 0,
    }


def juntar(previas: Iterable[dict], nuevas: list[dict]) -> list[dict]:
    """Conserva lo que se puso a mano o con la API en una corrida anterior: ``google_place_id`` y ``oculto``."""
    antes = {p["id"]: p for p in previas}
    for f in nuevas:
        if (p := antes.get(f["id"])) is not None:
            f["google_place_id"] = p.get("google_place_id", "")
            f["oculto"] = p.get("oculto", 0) or 0
    return nuevas
