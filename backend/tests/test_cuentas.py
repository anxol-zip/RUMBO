"""Reglas de las cuentas que hace cumplir la base (feature 002: RLS, CHECK, UNIQUE y triggers).

Cada prueba corre en una transacción que se deshace al final (también las filas de auth.users).
``como(con, uid)`` simula a una persona entrando con la clave pública de Supabase.
"""

import pytest
from psycopg import errors

from tests.conftest import como, hacer_admin, usuario


@pytest.fixture
def con(esquema_prueba):
    with esquema_prueba() as c, c.transaction(force_rollback=True):
        c.execute("INSERT INTO destino (id, nombre) VALUES (1, 'Cd. Puebla')")
        for pid in range(1, 13):
            c.execute("INSERT INTO punto (id, clave, nombre, destino_id, tipo, categorias, interior, lat, lon, verificado) "
                      "VALUES (%s, %s, %s, 1, 'museo', 'historia', 1, 19.04, -98.2, 1)", (pid, f"p{pid}", f"Punto {pid}"))
        yield c


def falla(con, error, consulta, params=()):
    """La consulta debe fallar con ese error; el savepoint deja la transacción usable."""
    with pytest.raises(error), con.transaction():
        con.execute(consulta, params)


def filas(con, consulta, params=()):
    return con.execute(consulta, params).fetchall()


def resena(con, uid, punto=1, estrellas=4, accesible=True, texto="Bonito"):
    with como(con, uid):
        con.execute("INSERT INTO resena (punto_id, estrellas, accesible, texto) VALUES (%s, %s, %s, %s)",
                    (punto, estrellas, accesible, texto))
    return con.execute("SELECT id FROM resena WHERE usuario_id = %s AND punto_id = %s", (uid, punto)).fetchone()["id"]


# ── Perfil y roles (US1, US2) ──

def test_crear_usuario_crea_perfil_turista(con):
    uid = usuario(con, "Ana López")
    assert filas(con, "SELECT nombre, rol, gustos FROM perfil WHERE id = %s", (uid,)) == [
        {"nombre": "Ana López", "rol": "turista", "gustos": []}]


def test_nombre_por_defecto(con):
    uid = usuario(con, None)
    assert con.execute("SELECT nombre FROM perfil WHERE id = %s", (uid,)).fetchone()["nombre"] == "Turista"


def test_ver_solo_mi_perfil(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    with como(con, beto):
        assert [str(f["id"]) for f in filas(con, "SELECT id FROM perfil")] == [beto]
    assert filas(con, "SELECT 1 FROM perfil WHERE id = %s", (ana,)) != []


def test_anon_no_ve_perfiles(con):
    usuario(con)
    with como(con, None):
        falla(con, errors.InsufficientPrivilege, "SELECT * FROM perfil")


def test_turista_no_cambia_su_rol(con):
    uid = usuario(con)
    with como(con, uid):
        falla(con, errors.InsufficientPrivilege, "UPDATE perfil SET rol = 'administrador' WHERE id = %s", (uid,))
    assert con.execute("SELECT rol FROM perfil WHERE id = %s", (uid,)).fetchone()["rol"] == "turista"


def test_es_admin(con):
    uid = usuario(con)
    with como(con, uid):
        assert con.execute("SELECT es_admin() AS a").fetchone()["a"] is False
    hacer_admin(con, uid)
    with como(con, uid):
        assert con.execute("SELECT es_admin() AS a").fetchone()["a"] is True


# ── Gustos (US4) ──

def test_guardar_mis_gustos(con):
    uid = usuario(con)
    with como(con, uid):
        cur = con.execute("UPDATE perfil SET gustos = '{historia,arte}' WHERE id = %s", (uid,))
        assert cur.rowcount == 1
    assert con.execute("SELECT gustos FROM perfil WHERE id = %s", (uid,)).fetchone()["gustos"] == ["historia", "arte"]


def test_no_cambio_gustos_ajenos(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    with como(con, beto):
        assert con.execute("UPDATE perfil SET gustos = '{arte}' WHERE id = %s", (ana,)).rowcount == 0


# ── Favoritos (US5) ──

def test_favorito_propio(con):
    uid = usuario(con)
    with como(con, uid):
        con.execute("INSERT INTO favorito (punto_id) VALUES (1)")
        assert [f["punto_id"] for f in filas(con, "SELECT punto_id FROM favorito")] == [1]


def test_favorito_no_se_repite(con):
    uid = usuario(con)
    with como(con, uid):
        con.execute("INSERT INTO favorito (punto_id) VALUES (1)")
        falla(con, errors.UniqueViolation, "INSERT INTO favorito (punto_id) VALUES (1)")


def test_no_veo_favoritos_ajenos(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    with como(con, ana):
        con.execute("INSERT INTO favorito (punto_id) VALUES (1)")
    with como(con, beto):
        assert filas(con, "SELECT * FROM favorito") == []


def test_no_inserto_favorito_ajeno(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    with como(con, beto):
        # usuario_id no se puede escribir (solo punto_id) y RLS lo frenaría igual
        falla(con, errors.InsufficientPrivilege, "INSERT INTO favorito (usuario_id, punto_id) VALUES (%s, 1)", (ana,))


def test_anon_no_ve_favoritos(con):
    with como(con, None):
        falla(con, errors.InsufficientPrivilege, "SELECT * FROM favorito")


# ── Reseñas (US6) ──

def test_resena_pone_autor(con):
    ana, solo = usuario(con, "Ana López"), usuario(con, "Cher")
    resena(con, ana)
    resena(con, solo)
    autores = {r["autor"] for r in filas(con, "SELECT autor FROM resena")}
    assert autores == {"Ana L.", "Cher"}


def test_una_resena_por_lugar(con):
    uid = usuario(con)
    resena(con, uid)
    with como(con, uid):
        falla(con, errors.UniqueViolation, "INSERT INTO resena (punto_id, estrellas) VALUES (1, 3)")


@pytest.mark.parametrize("estrellas", [0, 6])
def test_estrellas_fuera_de_rango(con, estrellas):
    uid = usuario(con)
    with como(con, uid):
        falla(con, errors.CheckViolation, "INSERT INTO resena (punto_id, estrellas) VALUES (1, %s)", (estrellas,))


def test_texto_maximo_1000(con):
    uid = usuario(con)
    with como(con, uid):
        falla(con, errors.CheckViolation, "INSERT INTO resena (punto_id, estrellas, texto) VALUES (1, 3, %s)", ("a" * 1001,))
        con.execute("INSERT INTO resena (punto_id, estrellas, texto) VALUES (1, 3, %s)", ("a" * 1000,))


def test_limite_10_por_hora(con):
    uid = usuario(con)
    for punto in range(1, 11):
        resena(con, uid, punto)
    with como(con, uid):
        with pytest.raises(errors.RaiseException, match="RN_R1"), con.transaction():
            con.execute("INSERT INTO resena (punto_id, estrellas) VALUES (11, 3)")


def test_editar_marca_editada(con):
    uid = usuario(con)
    rid = resena(con, uid)
    with como(con, uid):
        con.execute("UPDATE resena SET estrellas = 5 WHERE id = %s", (rid,))
    assert con.execute("SELECT editada_en FROM resena WHERE id = %s", (rid,)).fetchone()["editada_en"] is not None


def test_no_edito_resena_ajena(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid = resena(con, ana)
    with como(con, beto):
        assert con.execute("UPDATE resena SET estrellas = 1 WHERE id = %s", (rid,)).rowcount == 0
        assert con.execute("DELETE FROM resena WHERE id = %s", (rid,)).rowcount == 0


def test_turista_no_cambia_estado(con):
    uid = usuario(con)
    rid = resena(con, uid)
    with como(con, uid):
        with pytest.raises(errors.RaiseException, match="RN_R2"), con.transaction():
            con.execute("UPDATE resena SET estado = 'oculta' WHERE id = %s", (rid,))


def test_admin_no_edita_texto_ajeno(con):
    ana, admin = usuario(con), usuario(con, "Admin Uno")
    hacer_admin(con, admin)
    rid = resena(con, ana)
    with como(con, admin):
        with pytest.raises(errors.RaiseException, match="RN_R2"), con.transaction():
            con.execute("UPDATE resena SET texto = 'cambiado' WHERE id = %s", (rid,))


def test_no_creo_resena_oculta(con):
    uid = usuario(con)
    with como(con, uid):
        # estado no se puede escribir al crear (solo punto_id, estrellas, accesible y texto)
        falla(con, errors.InsufficientPrivilege, "INSERT INTO resena (punto_id, estrellas, estado) VALUES (1, 3, 'oculta')")


def test_resumen(con):
    a, b, c, d = (usuario(con, f"P{i} X") for i in range(4))
    resena(con, a, estrellas=5, accesible=True)
    resena(con, b, estrellas=4, accesible=False)
    resena(con, c, estrellas=4, accesible=None)
    oculta = resena(con, d, estrellas=1, accesible=False)
    con.execute("UPDATE resena SET estado = 'oculta' WHERE id = %s", (oculta,))
    with como(con, None):
        r = con.execute("SELECT * FROM resumen_resenas(1)").fetchone()
    assert (float(r["promedio"]), r["total"], r["e1"], r["e4"], r["e5"], float(r["pct_accesible"])) == (4.3, 3, 0, 2, 1, 50.0)


def test_resumen_sin_resenas(con):
    with como(con, None):
        r = con.execute("SELECT * FROM resumen_resenas(2)").fetchone()
    assert r["total"] == 0 and r["promedio"] is None and r["pct_accesible"] is None


def test_anon_lee_visibles(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    resena(con, ana)
    oculta = resena(con, beto, punto=2)
    con.execute("UPDATE resena SET estado = 'oculta' WHERE id = %s", (oculta,))
    with como(con, None):
        assert [r["estado"] for r in filas(con, "SELECT estado FROM resena")] == ["visible"]


def test_autor_ve_su_oculta(con):
    uid = usuario(con)
    rid = resena(con, uid)
    con.execute("UPDATE resena SET estado = 'oculta' WHERE id = %s", (rid,))
    with como(con, uid):
        assert [r["id"] for r in filas(con, "SELECT id FROM resena")] == [rid]


# ── Útil, denuncias y moderación (US7) ──

def test_voto_util_cuenta(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid = resena(con, ana)
    with como(con, beto):
        con.execute("INSERT INTO resena_util (resena_id) VALUES (%s)", (rid,))
    assert con.execute("SELECT utiles FROM resena WHERE id = %s", (rid,)).fetchone()["utiles"] == 1
    with como(con, beto):
        con.execute("DELETE FROM resena_util WHERE resena_id = %s", (rid,))
    assert con.execute("SELECT utiles FROM resena WHERE id = %s", (rid,)).fetchone()["utiles"] == 0


def test_un_voto_por_persona(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid = resena(con, ana)
    with como(con, beto):
        con.execute("INSERT INTO resena_util (resena_id) VALUES (%s)", (rid,))
        falla(con, errors.UniqueViolation, "INSERT INTO resena_util (resena_id) VALUES (%s)", (rid,))


def test_no_voto_mi_resena(con):
    ana = usuario(con)
    rid = resena(con, ana)
    with como(con, ana):
        falla(con, errors.InsufficientPrivilege, "INSERT INTO resena_util (resena_id) VALUES (%s)", (rid,))


def test_denuncia_una_vez(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid = resena(con, ana)
    with como(con, beto):
        con.execute("INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, 'Ofensivo')", (rid,))
        falla(con, errors.UniqueViolation, "INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, 'Otra')", (rid,))


def test_no_denuncio_mi_resena(con):
    ana = usuario(con)
    rid = resena(con, ana)
    with como(con, ana):
        falla(con, errors.InsufficientPrivilege, "INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, 'x')", (rid,))


@pytest.mark.parametrize("motivo", ["", "a" * 301])
def test_motivo_1_a_300(con, motivo):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid = resena(con, ana)
    with como(con, beto):
        falla(con, errors.CheckViolation, "INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, %s)", (rid, motivo))


def test_solo_admin_ve_denuncias(con):
    ana, beto, admin = usuario(con), usuario(con, "Beto Ruiz"), usuario(con, "Admin Uno")
    hacer_admin(con, admin)
    rid = resena(con, ana)
    with como(con, beto):
        con.execute("INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, 'Spam')", (rid,))
        assert filas(con, "SELECT * FROM resena_denuncia") == []
    with como(con, admin):
        assert [d["motivo"] for d in filas(con, "SELECT motivo FROM resena_denuncia")] == ["Spam"]


def test_admin_oculta_y_restaura(con):
    ana, admin = usuario(con), usuario(con, "Admin Uno")
    hacer_admin(con, admin)
    rid = resena(con, ana)
    with como(con, admin):
        con.execute("UPDATE resena SET estado = 'oculta' WHERE id = %s", (rid,))
    with como(con, None):
        assert filas(con, "SELECT id FROM resena") == []
    with como(con, admin):
        con.execute("UPDATE resena SET estado = 'visible' WHERE id = %s", (rid,))
    with como(con, None):
        assert [r["id"] for r in filas(con, "SELECT id FROM resena")] == [rid]


# ── Borrar la cuenta (US3) ──

def test_borrar_mi_cuenta(con):
    ana, beto = usuario(con), usuario(con, "Beto Ruiz")
    rid_beto = resena(con, beto, punto=2)
    with como(con, ana):
        con.execute("INSERT INTO favorito (punto_id) VALUES (1)")
        con.execute("UPDATE perfil SET gustos = '{arte}' WHERE id = %s", (ana,))
    resena(con, ana)
    with como(con, ana):
        con.execute("INSERT INTO resena_util (resena_id) VALUES (%s)", (rid_beto,))
        con.execute("INSERT INTO resena_denuncia (resena_id, motivo) VALUES (%s, 'x')", (rid_beto,))
        con.execute("SELECT borrar_mi_cuenta()")
    for tabla, columna in (("auth.users", "id"), ("perfil", "id"), ("favorito", "usuario_id"), ("resena", "usuario_id"),
                           ("resena_util", "usuario_id"), ("resena_denuncia", "usuario_id")):
        assert filas(con, f"SELECT 1 FROM {tabla} WHERE {columna} = %s", (ana,)) == [], tabla
    assert con.execute("SELECT utiles FROM resena WHERE id = %s", (rid_beto,)).fetchone()["utiles"] == 0
    assert filas(con, "SELECT 1 FROM perfil WHERE id = %s", (beto,)) != []


def test_perfil_toma_el_nombre_al_volver_a_entrar(con):
    """Microsoft a veces no manda el nombre la primera vez; al iniciar sesión otra vez con él, se completa."""
    uid = usuario(con, None)
    con.execute("UPDATE auth.users SET raw_user_meta_data = '{\"name\": \"Ana López\"}'::jsonb WHERE id = %s", (uid,))
    assert con.execute("SELECT nombre FROM perfil WHERE id = %s", (uid,)).fetchone()["nombre"] == "Ana López"
    con.execute("UPDATE auth.users SET raw_user_meta_data = '{\"name\": \"Otro\"}'::jsonb WHERE id = %s", (uid,))
    assert con.execute("SELECT nombre FROM perfil WHERE id = %s", (uid,)).fetchone()["nombre"] == "Ana López"
