"""Matriz de traslados entre los puntos con OpenRouteService (docs/04 §2, docs/05).

Se consulta **una sola vez** (una matriz en coche y otra a pie, por bloques) y se guarda en ``matriz_traslado``.
En vivo, el tiempo en coche solo se multiplica por el factor de tráfico (paso 10); a pie no cambia.

Datos de ruteo © colaboradores de OpenStreetMap (ODbL), calculados por openrouteservice.org.
"""

from __future__ import annotations

import json
import urllib.request
from collections.abc import Sequence
from dataclasses import dataclass

URL = "https://api.heigit.org/openrouteservice/v2/matrix/{perfil}"   # api.openrouteservice.org responde 410 (2026-11)
PERFILES = {"coche": "driving-car", "pie": "foot-walking"}


@dataclass(frozen=True)
class Traslado:
    origen_id: int
    destino_id: int
    minutos: float | None     # None: ORS no encontró ruta
    km: float | None


def cuerpo(coordenadas: Sequence[tuple[float, float]]) -> dict:
    """ORS pide [lon, lat]; nosotros guardamos (lat, lon)."""
    return {"locations": [[lon, lat] for lat, lon in coordenadas], "metrics": ["duration", "distance"], "units": "km"}


# ORS público: máximo 3,500 pares por consulta (openrouteservice.org/restrictions, revisado 2026-11-25).
BLOQUE = 50   # 50 × 50 = 2,500 pares


def consultar_por_bloques(coordenadas: Sequence[tuple[float, float]], modo: str, api_key: str,
                          bloque: int = BLOQUE, consultar_bloque=None) -> dict:
    """La matriz completa en consultas de ``bloque`` × ``bloque`` (``sources``/``destinations``), unida en el
    mismo formato que una sola consulta. ``consultar_bloque`` se puede cambiar en las pruebas."""
    consultar_bloque = consultar_bloque or _consultar_bloque
    n = len(coordenadas)
    dur = [[None] * n for _ in range(n)]
    dist = [[None] * n for _ in range(n)]
    tramos = [range(i, min(i + bloque, n)) for i in range(0, n, bloque)]
    for origenes in tramos:
        for destinos in tramos:
            datos = consultar_bloque(coordenadas, list(origenes), list(destinos), modo, api_key)
            for a, i in enumerate(origenes):
                for b, j in enumerate(destinos):
                    dur[i][j] = datos["durations"][a][b]
                    dist[i][j] = datos["distances"][a][b]
    return {"durations": dur, "distances": dist}


def _consultar_bloque(coordenadas, origenes: list[int], destinos: list[int], modo: str, api_key: str,
                      timeout: float = 60) -> dict:
    usados = sorted({*origenes, *destinos})
    pos = {k: i for i, k in enumerate(usados)}
    c = cuerpo([coordenadas[k] for k in usados]) | {
        "sources": [pos[k] for k in origenes], "destinations": [pos[k] for k in destinos]}
    req = urllib.request.Request(
        URL.format(perfil=PERFILES[modo]), data=json.dumps(c).encode(),
        headers={"Authorization": api_key, "Content-Type": "application/json",
                 "Accept": "application/json", "User-Agent": "PueblaAhora-hackathon-puebla-turistica-360/0.1"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def leer_matriz(datos: dict, punto_ids: Sequence[int]) -> list[Traslado]:
    """``durations`` en segundos y ``distances`` en km, en el orden de ``punto_ids``."""
    dur, dist = datos["durations"], datos["distances"]
    if len(dur) != len(punto_ids) or any(len(fila) != len(punto_ids) for fila in dur):
        raise ValueError(f"Matriz de {len(dur)} filas para {len(punto_ids)} puntos")
    salida = []
    for i, o in enumerate(punto_ids):
        for j, d in enumerate(punto_ids):
            s, km = dur[i][j], dist[i][j]
            salida.append(Traslado(o, d, None if s is None else round(s / 60, 1), None if km is None else round(km, 2)))
    return salida
