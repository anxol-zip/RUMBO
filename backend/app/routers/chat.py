"""Asistente con RAG (CU_06, RN_10): responde solo con nuestros datos y cita sus fuentes."""

from __future__ import annotations

import json

from fastapi import APIRouter

from app.deps import Ahora, Con
from app.schemas import ChatIn, ChatOut
from turismo_core import guardia, rag
from turismo_core.servicio import NoEncontrado

router = APIRouter(tags=["asistente"])


def _rechazo(revision: guardia.Revision) -> dict:
    guardia.registrar(revision)
    return {"respuesta": guardia.MENSAJES[revision.tipo], "fuentes": [], "estado_usado": [], "citas_invalidas": [],
            "intereses": [], "modelo": "sin modelo (rechazo)",
            "segundos": {"recuperar": 0, "modelo": 0, "total": 0}, "rechazo": revision.tipo}


@router.post("/chat", response_model=ChatOut)
def chat(c: ChatIn, con: Con, ahora: Ahora):
    """Pregunta abierta ("tengo 4 horas y llueve, ¿qué hago?"). Qwen3 en Ollama, local; sin internet.
    Antes de todo, la guardia revisa la pregunta y el historial (specs/003): una consulta o un intento de
    inyección recibe un mensaje fijo y nunca llega al modelo. Si Ollama no está, responde 503."""
    for texto in [c.pregunta, *(x for t in c.historial for x in (t.pregunta, t.respuesta))]:
        revision = guardia.revisar(texto)
        if revision.tipo != "valida":
            return _rechazo(revision)
    origen, intereses = c.origen_id, []
    if c.sesion_id:
        s = con.execute("SELECT perfil FROM sesion WHERE id = %s", (c.sesion_id,)).fetchone()
        if s is None:
            raise NoEncontrado("Sesión no encontrada: pide una nueva con POST /api/sesiones")
        perfil = json.loads(s["perfil"] or "{}")
        origen = origen if origen is not None else perfil.get("origen_id")
        intereses = perfil.get("intereses", [])
    if origen is not None and con.execute("SELECT 1 FROM punto WHERE id = %s", (origen,)).fetchone() is None:
        raise NoEncontrado(f"No existe el punto {origen}")
    historial = [t.model_dump() for t in c.historial]
    return rag.preguntar(con, ahora, c.pregunta, origen, intereses, historial)
