"""Ollama local: modelo de lenguaje (Qwen3) y embeddings (bge-m3), sin dependencias extra.

Se configura con variables (entorno o ``backend/.env``):

    OLLAMA_URL=http://localhost:11434
    OLLAMA_MODELO=qwen3:4b-instruct   # PC y laptop del stand (GPU de 4 GB)
    EMBED_MODEL=bge-m3           # si se cambia, hay que reindexar ChromaDB

Se usa la variante *instruct* de Qwen3: ``qwen3:4b`` ignora ``think: false`` en Ollama 0.40 y escribe su
razonamiento (3,481 tokens en 122 s, medido el 2026-11-23); ``qwen3:4b-instruct`` respondió en 5 s.
Temperatura baja (docs/05b §10).
Con ``keep_alive`` los modelos se quedan en memoria: la primera carga en frío tarda ~84 s en la PC.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request

from turismo_core.config import clave

# 127.0.0.1 y no "localhost": en Windows, localhost prueba primero IPv6 y pierde ~2 s por llamada
# (Ollama solo escucha en IPv4). Medido el 2026-10-15: 2.09 s contra 0.03 s por embedding.
URL = clave("OLLAMA_URL") or "http://127.0.0.1:11434"
MODELO = clave("OLLAMA_MODELO") or "qwen3:4b-instruct"
EMBED = clave("EMBED_MODEL") or "bge-m3"
KEEP_ALIVE = clave("OLLAMA_KEEP_ALIVE") or "3h"
TEMPERATURA = 0.2
# Ventana de contexto fija y la misma en la precarga y en cada pregunta (si cambia, Ollama recarga el modelo).
# Los prompts del asistente miden 2,400–3,300 tokens (2026-10-16); con el valor por defecto de Ollama (4,096)
# quedaba poco margen, y al pasarse Ollama recorta el principio del prompt (las reglas) sin avisar.
CONTEXTO = int(clave("OLLAMA_CTX") or 6144)
# Tope de la respuesta: acota el peor caso (un modelo que razona en voz alta se corta en vez de tardar 2 min).
MAX_TOKENS = int(clave("OLLAMA_MAX_TOKENS") or 320)
OPCIONES = {"temperature": TEMPERATURA, "num_ctx": CONTEXTO, "num_predict": MAX_TOKENS}
# Lo que ve /api/salud si el modelo configurado no sirve (devuelve su razonamiento o se corta).
AVISO: str | None = None


class SinOllama(RuntimeError):
    """Ollama no responde o el modelo no está descargado."""


def _post(ruta: str, cuerpo: dict, timeout: float) -> dict:
    req = urllib.request.Request(URL + ruta, json.dumps(cuerpo).encode("utf-8"),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 404:      # Ollama responde 404 cuando no tiene el modelo pedido
            raise SinOllama(f"Ollama no tiene el modelo '{cuerpo.get('model')}': revisa OLLAMA_MODELO "
                            f"o descárgalo con `ollama pull {cuerpo.get('model')}`") from e
        raise SinOllama(f"Ollama respondió {e.code}: {e.read().decode('utf-8', 'replace')[:200]}") from e
    except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
        raise SinOllama(f"Ollama no responde en {URL}: {e}") from e


def embeber(textos: list[str], timeout: float = 120) -> list[list[float]]:
    """Embeddings de ``EMBED`` (el mismo modelo para indexar y para preguntar)."""
    if not textos:
        return []
    return _post("/api/embed", {"model": EMBED, "input": textos, "keep_alive": KEEP_ALIVE}, timeout)["embeddings"]


PIENSA = re.compile(r"<think>.*?(</think>|$)", re.S)
RAZONAMIENTO = re.compile(r"^\W*(okay|ok,|alright|the user|let me|let's|wait|first,|hmm|so,? the|i need to)", re.I)


def _limpiar(r: dict) -> str:
    """Quita el razonamiento del modelo; si no se puede (viene sin etiquetas o se cortó), el modelo no sirve."""
    global AVISO
    texto = PIENSA.sub("", r["message"]["content"]).strip()
    cortado = r.get("done_reason") == "length" and not texto.rstrip("» )]").endswith((".", "!", "?"))
    if not texto or RAZONAMIENTO.search(texto) or cortado:
        AVISO = (f"El modelo {MODELO} devolvió su razonamiento o una respuesta cortada; "
                 "usa qwen3:4b-instruct (OLLAMA_MODELO).")
        raise SinOllama(AVISO)
    AVISO = None
    return texto


def chatear(sistema: str, usuario: str, timeout: float = 40) -> dict:
    """Una respuesta de ``MODELO``. Devuelve el texto y cuánto tardó la generación."""
    r = _post("/api/chat", {
        "model": MODELO, "stream": False, "think": False, "keep_alive": KEEP_ALIVE, "options": OPCIONES,
        "messages": [{"role": "system", "content": sistema}, {"role": "user", "content": usuario}],
    }, timeout)
    tokens_prompt = r.get("prompt_eval_count") or 0
    return {"texto": _limpiar(r), "modelo": MODELO,
            "tokens": r.get("eval_count"), "tokens_prompt": tokens_prompt,
            "contexto_cerca_del_limite": tokens_prompt > 0.9 * CONTEXTO,
            "segundos_modelo": round(r.get("total_duration", 0) / 1e9, 1)}


def precargar(timeout: float = 300) -> dict:
    """Carga los dos modelos en memoria (al arrancar la API y cada hora, para que no se descarguen)."""
    salida = {}
    for nombre, fn in (("embeddings", lambda: embeber(["precarga"], timeout)),
                       ("llm", lambda: _post("/api/generate", {"model": MODELO, "prompt": "", "keep_alive": KEEP_ALIVE,
                                                               "options": OPCIONES}, timeout))):
        try:
            fn()
            salida[nombre] = "cargado"
        except SinOllama as e:
            salida[nombre] = str(e)
    return salida
