import pytest

from turismo_core import traslados
from turismo_core.config import leer_env


def test_cuerpo_manda_lon_lat():
    c = traslados.cuerpo([(19.04, -98.19), (19.05, -98.30)])
    assert c["locations"] == [[-98.19, 19.04], [-98.30, 19.05]]
    assert c["metrics"] == ["duration", "distance"] and c["units"] == "km"


def test_leer_matriz_convierte_a_minutos():
    datos = {"durations": [[0.0, 1274.0], [1175.55, None]], "distances": [[0.0, 12.50007], [12.28619, None]]}
    t = {(x.origen_id, x.destino_id): x for x in traslados.leer_matriz(datos, [5, 8])}
    assert (t[(5, 8)].minutos, t[(5, 8)].km) == (21.2, 12.5)
    assert t[(8, 5)].minutos == 19.6
    assert t[(8, 8)].minutos is None              # ORS sin ruta
    with pytest.raises(ValueError):
        traslados.leer_matriz(datos, [5])


def test_leer_env(tmp_path):
    env = tmp_path / ".env"
    env.write_text("# comentario\nORS_API_KEY=abc=\nTOMTOM_API_KEY = xyz  # nota\n\nVACIA\n", encoding="utf-8")
    assert leer_env(env) == {"ORS_API_KEY": "abc=", "TOMTOM_API_KEY": "xyz"}
    assert leer_env(tmp_path / "no_existe") == {}


def test_matriz_por_bloques_une_en_orden():
    """7 puntos en bloques de 3: 9 consultas, cada una de ≤ 3 × 3 pares, unidas como una sola matriz."""
    coords = [(19.0 + i / 100, -98.2) for i in range(7)]
    llamadas = []

    def falso(coordenadas, origenes, destinos, modo, api_key):
        llamadas.append((origenes, destinos))
        assert len(origenes) <= 3 and len(destinos) <= 3
        return {"durations": [[i * 10 + j for j in destinos] for i in origenes],
                "distances": [[float(i + j) for j in destinos] for i in origenes]}

    m = traslados.consultar_por_bloques(coords, "pie", "k", bloque=3, consultar_bloque=falso)
    assert len(llamadas) == 9
    assert m["durations"][6][2] == 62 and m["distances"][1][5] == 6.0
    assert all(len(fila) == 7 for fila in m["durations"])
