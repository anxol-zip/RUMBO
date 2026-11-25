"""Catálogo ampliado (feature 004): duplicados, horario de OSM, cupos y que sea repetible. Sin red."""

import json

from turismo_core import ampliar as a

CATEDRAL = {"id": "catedral", "nombre": "Catedral de Puebla", "destino": "Cd. Puebla", "municipio": "Puebla",
            "lat": "19.04248", "lon": "-98.1985", "clee_denue": "21114813210006652002000000U8", "osm_id": ""}


def cand(nombre, lat=19.0430, lon=-98.1990, fuente="denue", tipo="restaurante", **extra):
    base = {"id": f"{fuente}_{nombre}", "fuente": fuente, "nombre": nombre, "tipo": tipo, "lat": lat, "lon": lon,
            "municipio": "Puebla", "clee_denue": "", "osm_id": "", "horario": None, "grande": False}
    return base | extra


def test_normalizar_quita_acentos_y_palabras_vacias():
    assert a.normalizar("Restaurante El Mural de los Poblanos") == a.normalizar("mural de los poblanos")
    assert a.normalizar("Café Tribu") == "tribu"
    assert a.normalizar("MUSEO AMPARO, A.C.") == "amparo"


def test_nombre_bonito_solo_cambia_mayusculas():
    assert a.nombre_bonito("LA CASA DEL MOLE") == "La Casa del Mole"
    assert a.nombre_bonito("Casa de la Cultura") == "Casa de la Cultura"


def test_mismo_lugar_por_distancia_y_nombre():
    uno = cand("El Mural de los Poblanos")
    assert a.mismo_lugar(uno, cand("Restaurante Mural de los Poblanos", lat=19.04315))     # ~17 m
    assert not a.mismo_lugar(uno, cand("Tacos Don Juan", lat=19.04315))                     # cerca, otro nombre
    assert a.mismo_lugar(uno, cand("El Mural de los Poblanos", lat=19.0440))                # mismo nombre, ~110 m
    assert not a.mismo_lugar(uno, cand("El Mural de los Poblanos", lat=19.0460))            # mismo nombre, ~330 m
    assert a.mismo_lugar(cand("X", clee_denue="123"), cand("Y", lat=19.1, clee_denue="123"))


def test_deduplicar_gana_osm_y_conserva_clave_denue():
    osm = cand("Mural de los Poblanos", fuente="osm", osm_id="node/1", horario='{"lun": "09:00-18:00"}')
    denue = cand("RESTAURANTE EL MURAL DE LOS POBLANOS", lat=19.04305, clee_denue="999", grande=True)
    otro = cand("Tacos Don Juan", lat=19.04305)
    unicos, descartados = a.deduplicar([denue, osm, otro], [CATEDRAL])
    assert descartados == 1 and len(unicos) == 2
    mural = next(u for u in unicos if u["fuente"] == "osm")
    assert mural["clee_denue"] == "999" and mural["grande"]


def test_deduplicar_descarta_los_curados():
    por_clave = cand("Catedral Basílica", lat=19.5, clee_denue=CATEDRAL["clee_denue"])
    por_nombre = cand("Catedral de Puebla", lat=19.04250, lon=-98.19852, fuente="osm", osm_id="way/9")
    unicos, descartados = a.deduplicar([por_clave, por_nombre], [CATEDRAL])
    assert unicos == [] and descartados == 2


def test_horario_osm_formato_simple():
    h = json.loads(a.horario_osm("Mo-Fr 09:00-18:00; Sa 10:00-14:00"))
    assert h == {"lun": "09:00-18:00", "mar": "09:00-18:00", "mie": "09:00-18:00", "jue": "09:00-18:00",
                 "vie": "09:00-18:00", "sab": "10:00-14:00"}
    assert json.loads(a.horario_osm("Tu-Su 10:00-14:00,16:00-19:00"))["dom"] == "10:00-14:00,16:00-19:00"
    assert json.loads(a.horario_osm("Sa-Mo 12:00-20:00")).keys() == {"sab", "dom", "lun"}
    assert len(json.loads(a.horario_osm("24/7"))) == 7


def test_horario_osm_raro_es_none():
    for texto in (None, "", "Mo-Su 09:00-18:00; PH off", "Mo-Fr 18:00-02:00", "sunrise-sunset",
                  "Jan-Mar Mo 10:00-12:00", "Mo-Fr 09:00-18:00 open"):
        assert a.horario_osm(texto) is None, texto


def test_desde_denue_filtra_giros_y_cadenas():
    base = {"clee": "1", "nombre": "LA CASA DEL MOLE", "codigo_act": "722511", "per_ocu": "11 a 30 personas",
            "municipio": "Puebla", "lat": "19.04", "lon": "-98.2"}
    c = a.desde_denue(base)
    assert (c["tipo"], c["nombre"], c["grande"]) == ("restaurante", "La Casa del Mole", True)
    assert a.desde_denue(base | {"codigo_act": "722412"}) is None          # bar
    assert a.desde_denue(base | {"codigo_act": "722517"}) is None          # para llevar
    assert a.desde_denue(base | {"nombre": "STARBUCKS COFFEE"}) is None
    assert a.desde_denue(base | {"codigo_act": "722515"})["tipo"] == "cafe"


def test_desde_osm_usa_centro_de_las_vias():
    e = {"type": "way", "id": 5, "center": {"lat": 19.04, "lon": -98.2},
         "tags": {"tourism": "museum", "name": "Museo Casa del Alfeñique", "opening_hours": "Tu-Su 10:00-17:00"}}
    c = a.desde_osm(e)
    assert (c["tipo"], c["osm_id"], c["lat"]) == ("museo", "way/5", 19.04)
    assert json.loads(c["horario"])["mar"] == "10:00-17:00"
    assert a.desde_osm({"type": "node", "id": 1, "lat": 1, "lon": 1, "tags": {"amenity": "cafe"}}) is None


def test_elegir_respeta_cupos_radio_y_rellena(monkeypatch):
    comida = [cand(f"Comida {i}", lat=19.0430 + i * 1e-4) for i in range(5)]
    museos = [cand(f"Museo {i}", tipo="museo", lat=19.0430 + i * 1e-4) for i in range(2)]
    monkeypatch.setattr(a, "POR_CURADO", 99)
    lejos = [cand("Lejos", lat=19.2)]
    elegidos = a.elegir(comida + museos + lejos, [CATEDRAL], cupo={"comida": 3, "atractivos": 3})
    assert "denue_Lejos" not in {c["id"] for c in elegidos}
    assert sum(c["tipo"] == "museo" for c in elegidos) == 2
    assert sum(c["tipo"] == "restaurante" for c in elegidos) == 4      # 3 + 1 que sobró del otro grupo


def test_elegir_reparte_entre_curados():
    zocalo = CATEDRAL | {"id": "zocalo", "nombre": "Zócalo", "lat": "19.0600"}
    cerca_catedral = [cand(f"C{i}", lat=19.0430 + i * 1e-4) for i in range(8)]
    cerca_zocalo = [cand(f"Z{i}", lat=19.0590 + i * 1e-4) for i in range(8)]
    elegidos = a.elegir(cerca_catedral + cerca_zocalo, [CATEDRAL, zocalo], cupo={"comida": 8, "atractivos": 0})
    assert sum(c["nombre"].startswith("Z") for c in elegidos) >= 3


def test_elegir_prefiere_osm_con_horario_y_luego_grandes():
    chico = cand("Chico", lat=19.04250)
    grande = cand("Grande", lat=19.0440, grande=True)
    osm = cand("Con horario", lat=19.0460, fuente="osm", horario='{"lun": "09:00-18:00"}')
    elegidos = a.elegir([chico, grande, osm], [CATEDRAL], cupo={"comida": 2, "atractivos": 0})
    assert {c["nombre"] for c in elegidos} == {"Con horario", "Grande"}


def test_fila_y_juntar_son_repetibles():
    c = a.elegir([cand("Casa del Mole")], [CATEDRAL])[0]
    f1 = a.fila(c, "05/2026", "2026-11-25")
    assert f1["verificado"] == 0 and f1["destino"] == "Cd. Puebla" and f1["categorias"] == "gastronomia"
    assert "DENUE" in f1["fuente"] and "Catedral de Puebla" in f1["ficha"]
    assert set(f1) == set(a.COLUMNAS)
    previa = f1 | {"google_place_id": "ChIJabc", "oculto": 1}
    f2 = a.juntar([previa], [a.fila(c, "05/2026", "2026-11-25")])[0]
    assert (f2["google_place_id"], f2["oculto"]) == ("ChIJabc", 1)
    assert {k: v for k, v in f2.items() if k not in ("google_place_id", "oculto")} == \
           {k: v for k, v in f1.items() if k not in ("google_place_id", "oculto")}
