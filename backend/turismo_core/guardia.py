"""Guardia del asistente contra prompt injection y consultas (OWASP LLM01:2025, specs/003).

Revisa la pregunta **antes** de buscar documentos o llamar al modelo y revisa la respuesta del modelo
antes de mostrarla. Son reglas, no un segundo modelo: en la GPU de 4 GB de la laptop no cabe otro, y un
segundo modelo duplicaría el tiempo de respuesta.

Las reglas son estructurales (verbo + objeto, por ejemplo ``select … from``) y no palabras sueltas, para
no rechazar preguntas normales como "selecciona un lugar tranquilo" o "muéstrame museos".

El modelo no tiene herramientas ni acceso a la base: esta guardia es una capa más, no la única. Los
rechazos se registran solo con su tipo y la regla, nunca con el texto del turista.
"""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass

logger = logging.getLogger(__name__)

MENSAJES = {
    "consulta": "Eso no lo puedo hacer: parece una consulta o un comando, no una pregunta. Pregúntame sobre "
                "tu visita, por ejemplo: «¿Qué lugar está tranquilo ahora?»",
    "inyeccion": "Eso no lo puedo hacer: solo te ayudo a planear tu visita por Puebla, Cholula y Atlixco. "
                 "Prueba con algo como: «Tengo 3 horas, ¿qué me recomiendas?»",
    "privado": "No puedo compartir información de otras personas ni de cómo funciona la app por dentro. "
               "Si quieres, te digo qué lugares están tranquilos ahora.",
}


@dataclass(frozen=True)
class Revision:
    tipo: str      # valida, consulta, inyeccion o privado
    motivo: str    # nombre de la regla que coincidió (para pruebas y log)


# Letras de otros alfabetos que se ven iguales a las latinas ("SELЕCT" con E cirílica).
CONFUNDIBLES = str.maketrans("аеорсхуіѕјкмнтвοαερτνκιυ", "aeopcxyisjkmhtboaeptvkiu")
INVISIBLES = re.compile("[­​-‏⁠﻿]")


def normalizar(texto: str) -> str:
    """Minúsculas, sin acentos, sin caracteres invisibles, sin letras disfrazadas y con espacios simples."""
    t = INVISIBLES.sub("", unicodedata.normalize("NFKC", texto)).lower().translate(CONFUNDIBLES)
    t = "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", t).strip()


def _reglas(*pares: tuple[str, str]) -> list[tuple[str, re.Pattern]]:
    return [(motivo, re.compile(patron)) for motivo, patron in pares]


REGLAS_CONSULTA = _reglas(
    ("sql-select", r"\bselect\b.{0,80}\bfrom\b"),
    ("sql-insert", r"\binsert\s+into\b"),
    ("sql-delete", r"\bdelete\s+from\b"),
    ("sql-update", r"\bupdate\s+[\w.]+\s+set\b"),
    ("sql-ddl", r"\b(drop|truncate|alter|create)\s+(table|database|schema|user|role)\b"),
    ("sql-union", r"\bunion\s+(all\s+)?select\b"),
    ("sql-tautologia", r"'\s*(or|and)\s+'?\w+'?\s*=\s*'?\w+"),
    ("sql-encadenada", r";\s*(drop|delete|insert|update|select|truncate|alter)\b"),
    ("sql-comentario", r"(['\";]\s*--|/\*.*\*/)"),
    ("shell", r"\brm\s+-\w*[rf]|\bsudo\s+\w|\$\(|`[^`]+`|\|\s*(sh|bash)\b|\b(curl|wget)\s+https?://"),
    ("html-script", r"<\s*/?\s*script\b|\bjavascript:"),
    ("plantilla", r"\{\{.*\}\}|\{%.*%\}"),
    ("codigo", r"\bimport\s+(os|sys|subprocess)\b|\bos\.(system|popen)\b|\beval\s*\(|\bexec\s*\(|\bdef\s+\w+\s*\(|"
               r"\bfunction\s*\w*\s*\(|=>\s*\{"),
)

REGLAS_INYECCION = _reglas(
    ("ignorar-reglas", r"\b(ignora|ignoren|ignorar|olvida|olviden|olvidar|omite|omitir|salta|saltate|descarta|"
                       r"ignore|forget|disregard|bypass)\b.{0,40}\b(instruccion\w*|regla\w*|indicacion\w*|"
                       r"restriccion\w*|instruction\w*|rule\w*|prompt|guidelines?|directivas?)\b"),
    # Con "tu/tus" o la palabra prompt: "dime las reglas del museo" es una pregunta normal.
    ("revelar-prompt", r"\b(muestra\w*|muestrame|dime|di|revela\w*|ensena\w*|imprime|escribe|repite|copia|dame|"
                       r"show|reveal|print|tell me|repeat|output|give me)\b.{0,40}"
                       r"(\b(tu|tus|your)\s+(\w+\s+)?(prompt|instrucciones|reglas|configuracion|instructions|rules)\b|"
                       r"\b(system ?prompt|prompt|instrucciones (del|de tu) sistema|initial instructions)\b)"),
    ("preguntar-reglas", r"\b(cuales|que|como) son tus (instrucciones|reglas|indicaciones|directivas)\b|"
                         r"\bwhat (are|is) your (instructions|rules|system prompt|prompt)\b"),
    ("cambiar-rol", r"\b(actua|actuar|actue|actuen) como\b|\bfinge\w*\b|\bhaz de cuenta\b|\bpretend\b|\bact as\b|"
                    r"\byou are now\b|\b(a partir de ahora|desde ahora|ahora) (eres|seras|vas a ser)\b|"
                    r"\bdeveloper mode\b|\bmodo (desarrollador|dios|sin restricciones|admin\w*)\b|\bjailbreak\b|"
                    # "dan" suelto es el verbo dar ("¿qué museos dan descuento?"); solo cuenta como rol.
                    r"\b(eres|seras|modo) dan\b|\bdo anything now\b"),
    ("rol-falso", r"^\s*(system|assistant|sistema|asistente|developer)\s*:|\[/?inst\]|<\|im_(start|end)\|>|"
                  r"</?(system|instructions?)>|###\s*(system|instruction)"),
    ("secretos", r"\b(passwords?|api ?keys?|claves? (secreta|de api|privada)s?|service.?role|"
                 r"variables? de entorno|environment variables?|\.env\b|supabase|jwt)\b|"
                 # Ambiguas en turismo (credencial de estudiante, wifi, tokens del teleférico): solo con contexto.
                 r"\b(tu|tus|your)\b.{0,15}\b(contrasenas?|tokens?|credenciales|credentials)\b|"
                 r"\b(contrasenas?|tokens?|credenciales|credentials)\b.{0,20}"
                 r"\b(de la app|de rumbo|del sistema|del admin\w*|de admin\w*|de la base|de la bd|del servidor|internas?)\b"),
    ("estructura-interna", r"\b(tablas?|esquema|base de datos|bd|database|schema|columnas?|servidor|backend)\b.{0,30}"
                           r"\b(tu|tus|de la app|de rumbo|del sistema|internas?|your)\b|"
                           r"\b(tu|tus|your)\b.{0,15}\b(tablas?|base de datos|database|esquema|schema|servidor|backend)\b"),
)

REGLAS_PRIVADO = _reglas(
    ("autor-resena", r"\b(quien|quienes|who)\b.{0,30}\b(resen\w*|escribi\w*|opin\w*|calific\w*|comento|wrote|reviewed)\b"),
    ("datos-usuarios", r"\b(cuantos|cuantas|lista\w*|dame|muestra\w*|muestrame|ensena\w*|how many|list|give me|show)\b"
                       r".{0,30}\b(usuarios|turistas registrados|cuentas|perfiles|correos|emails?|sesiones|users|accounts)\b"),
    ("datos-persona", r"\b(correo|email|telefono|direccion|perfil|favoritos|resenas)\b.{0,20}\bde (otr[oa]s?|alguien|"
                      r"los usuarios|las personas|otros turistas)\b"),
)


def revisar(texto: str) -> Revision:
    """Clasifica un texto del turista. Orden: consulta > inyección > privado > válida."""
    t = normalizar(texto)
    for tipo, reglas in (("consulta", REGLAS_CONSULTA), ("inyeccion", REGLAS_INYECCION), ("privado", REGLAS_PRIVADO)):
        for motivo, patron in reglas:
            if patron.search(t):
                return Revision(tipo, motivo)
    return Revision("valida", "")


# Sin "contexto:": el modelo dice "los restaurantes del contexto:" con naturalidad (evaluación 2026-11-23).
MARCAS_INTERNAS = ("reglas:", "reglas de los datos", "instruccion para esta pregunta", "<<<", ">>>",
                   "ubicacion del turista:", "fecha y hora:")
FUGAS = re.compile(r"\S+@\S+\.\w{2,}|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|"
                   r"eyj[\w-]{10,}|\bsk-\w{8,}|service_role|"
                   r"\b(from|into|table|tabla)\s+(auth\.)?(users|perfil|resena|sesion|favorito|reporte)\b")
VENTANA = 8


def revisar_salida(texto: str, sistema: str) -> bool:
    """¿La respuesta del modelo se puede mostrar? Falso si filtra el prompt, sus marcas o datos internos."""
    t = normalizar(texto)
    if any(m in t for m in MARCAS_INTERNAS) or FUGAS.search(t):
        return False
    palabras = re.findall(r"\w+", normalizar(sistema))
    frases = {" ".join(palabras[i:i + VENTANA]) for i in range(len(palabras) - VENTANA + 1)}
    dichas = re.findall(r"\w+", t)
    return not any(" ".join(dichas[i:i + VENTANA]) in frases for i in range(len(dichas) - VENTANA + 1))


def registrar(revision: Revision) -> None:
    logger.warning("chat rechazado tipo=%s regla=%s", revision.tipo, revision.motivo)
