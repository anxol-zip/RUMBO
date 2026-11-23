"""API de RUMBO (docs/05c). Solo traduce HTTP ↔ ``turismo_core``.

    cd backend
    uv run uvicorn app.main:app --reload --port 8000                  # desarrollo · Swagger en /docs
    PUEBLA_DEMO=1 uv run uvicorn app.main:app --host 0.0.0.0 --port 8000   # stand (hotspot)

Variables: ``PUEBLA_DEMO=1`` marca las sesiones como demo (RN_11); ``PUEBLA_TAREAS=0`` apaga la
actualización cada hora (y la precarga de los modelos); ``CORS_ORIGINS`` (separadas por coma) para el
Vite de desarrollo; ``OLLAMA_MODELO`` (``qwen3:8b`` en la PC, ``qwen3:4b`` en la laptop).
"""

from __future__ import annotations

import logging
import os
import sys
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from psycopg_pool import PoolTimeout

from app.routers import chat, panel, puntos, sistema, turista
from app.tareas import Programador
from turismo_core.bd import REPO, crear_esquema, crear_pool
from turismo_core.llm import SinOllama
from turismo_core.servicio import NoEncontrado

FRONTEND = REPO / "frontend" / "dist"
log = logging.getLogger("uvicorn.error")      # el logger que uvicorn ya imprime en la terminal


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.pool = crear_pool()
    except RuntimeError as e:                      # falta DATABASE_URL o todavía es de SQLite
        sys.exit(str(e))
    try:
        with app.state.pool.connection() as con:
            crear_esquema(con)                     # no toca los datos; agrega tablas o columnas que falten
    except (psycopg.OperationalError, PoolTimeout) as e:
        # Arranca igual: las rutas responden 503 hasta que la base vuelva (contracts/configuracion.md).
        log.warning("La base de datos no responde; no se revisó el esquema: %s", e)
    app.state.programador = None
    if os.environ.get("PUEBLA_TAREAS", "1") != "0":
        app.state.programador = Programador()
        app.state.programador.iniciar()
    yield
    if app.state.programador:
        app.state.programador.detener()
    app.state.pool.close()


app = FastAPI(title="RUMBO API", version="0.1.0", lifespan=lifespan,
              description="Semáforo en vivo, 'mejor ve a…', reportes de turistas y panel de gobierno "
                          "de la zona piloto Puebla–Cholula–Atlixco. Hackathon Puebla Turística 360°.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["*"], allow_headers=["*"],
)


@app.exception_handler(NoEncontrado)
def no_encontrado(_: Request, e: NoEncontrado):
    return JSONResponse(status_code=404, content={"detail": str(e)})


@app.exception_handler(SinOllama)
def sin_ollama(_: Request, e: SinOllama):
    # La causa va también a la terminal: el log de uvicorn solo muestra "503" (2026-10-16).
    log.warning("Asistente no disponible (503): %s", e)
    return JSONResponse(status_code=503, content={"detail": f"El asistente no está disponible: {e}"})


@app.exception_handler(psycopg.OperationalError)
@app.exception_handler(PoolTimeout)
def sin_base(_: Request, e: Exception):
    log.warning("Base de datos no disponible (503): %s", e)
    return JSONResponse(status_code=503,
                        content={"detail": "La base de datos no está disponible. Intenta de nuevo en unos minutos."})


for r in (sistema, puntos, turista, chat, panel):
    app.include_router(r.router, prefix="/api")

# En la demo FastAPI también sirve el frontend compilado (un solo puerto, docs/05c §4).
if FRONTEND.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="web")
else:
    @app.get("/", include_in_schema=False)
    def inicio():
        return RedirectResponse("/docs")
