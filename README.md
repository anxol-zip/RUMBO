# RUMBO

**RUMBO** (Redistribución Unificada con Mapas, Búsquedas y Opiniones) es el repositorio del proyecto final de dos materias de la Universidad Iberoamericana Puebla. Cada materia tiene su propio equipo, entregables y documentación:

| Materia | Docente | Equipo | Documentación |
| --- | --- | --- | --- |
| **Interacción Persona Máquina** (13009A-O26). Tema del curso: *Interfaces Inteligentes para el Bienestar Social* | Dra. Gabriela A. Rodríguez Ruiz | Angel Rugerio Jiménez (201720), Axel García Arellano (201251), Diego Navarro Sánchez (202497) y Yohualli Ollin Luna Reyes (189670) | [`docs/HCI/`](docs/HCI/) |
| **Diseño de Software** | Mtro. Rafael Pérez Aguirre | El mismo equipo y Cristian Alexei Romero Martínez (203739) | [`docs/DdS/`](docs/DdS/) |

Cristian participa solo en Diseño de Software. La propuesta de Interacción Persona Máquina la presenta como *Puebla Ahora*, su nombre anterior; hoy todo el proyecto se llama **RUMBO**.

## De qué va

**RUMBO** responde *"¿a dónde voy ahora?"*: un semáforo en vivo de 23 lugares turísticos de Puebla, Cholula y Atlixco (buen momento / con precaución / mejor después). Si el lugar que buscas está lleno, te recomienda otro parecido y más tranquilo. También tiene un asistente con IA local que responde solo con los datos de la app, y un panel para la Secretaría de Turismo.

La app nació en un hackathon. En este proyecto **rediseñamos su interfaz con los principios de la materia** para que la pueda usar cualquier turista, sin importar su edad, cómo ve los colores o cuánto sabe de tecnología:

- **Tamaño de letra ajustable**, que también respeta la configuración del dispositivo.
- **Semáforo que no depende del color:** formas por estado, modo para daltonismo y alto contraste.
- **Barra lateral de un tercio de la pantalla** y vista "Ver todos los lugares" a media pantalla, con fotos, agrupada por estado y con filtros.
- **Para distintas edades y capacidades:** botones grandes, uso con teclado y lector de pantalla, y lectura en voz alta.
- **Pruebas de usabilidad** con personas ajenas al equipo, antes y después.

La [propuesta inicial](docs/HCI/Proyecto%20Final%20-%20Propuesta%20inicial.pdf) y los avances ([1](docs/HCI/Avance_1.pdf) y [2](docs/HCI/Avance_2.pdf)) están en `docs/HCI/`. La propuesta mencionaba PySide6 y Qt Designer: la profesora autorizó después seguir en React.

En **Diseño de Software** el proyecto se presenta en la **Expo Ibero** (4 de diciembre de 2026). La materia pide login con dos roles (turista y administrador), datos con dueño, una regla que la base hace cumplir, lógica en capas con pruebas, una URL desplegada y pruebas con usuarios reales. Por eso la base de datos migra a Firebase y el frontend adopta las capas vistas en clase. La [ficha del proyecto](docs/00-proyecto.md), las instrucciones, el estado frente a cada requisito y el calendario de la Expo están en [`docs/DdS/`](docs/DdS/README.md).

## Origen del código

El código parte del repositorio del hackathon **"Puebla Turística 360°"** (Tech Capital Puebla 2026, SECIHTI Puebla), donde Axel y Angel construyeron la primera versión:

- **Repositorio:** [`Arellano008/hackathon-puebla-turistica-360`](https://github.com/Arellano008/hackathon-puebla-turistica-360)
- **Commit copiado:** `db1c2fa` de `develop`, el 29 de octubre de 2026
- **Autoría:** `backend/` (FastAPI, `turismo_core`, servidor MCP, pipeline de datos y asistente) es de **Axel García Arellano**. `frontend/` y `catalogo/` son de **Angel Rugerio Jiménez**.

Se copió **sin historia de git** y sin `backend/.env` (claves) ni `backend/data/raw/` (datos oficiales). De la documentación del hackathon solo se trajeron dos notas de referencia, en [`docs/hackathon/`](docs/hackathon/): el análisis de casos de uso y reglas de negocio, y la especificación del frontend.

## Estructura

| Carpeta | Qué hay |
| --- | --- |
| `frontend/` | La app en **React 19 + Vite**: aquí está el trabajo de la materia |
| `backend/` | API en **FastAPI**, `turismo_core` (semáforo, recomendador y reportes), servidor MCP y asistente con Ollama |
| `catalogo/` | Los lugares de la zona piloto |
| `docs/` | Documentación de cada materia (`HCI/`, `DdS/`) y referencias del hackathon (`hackathon/`) |
| `herramientas/` | `bd_desarrollo.py`: crea la base de desarrollo |
| `INSTALACION.md` | Cómo correrlo, en modo de desarrollo o con los datos reales, en Windows y Linux |

## Cómo correrlo

La guía completa, para Windows y Linux, está en [`INSTALACION.md`](INSTALACION.md). Hay dos modos:

- **Desarrollo:** para trabajar en la interfaz en cualquier computadora. Usa la base de desarrollo que viene en git (`backend/data/desarrollo.db`), creada con [`herramientas/bd_desarrollo.py`](herramientas/bd_desarrollo.py) a partir de los datos procesados del repositorio. No necesita `.env` ni `data/raw/`.
- **Datos reales:** para la demo, la presentación y las pruebas con usuarios. Necesita `backend/.env` y `backend/data/raw/`, que se copian a mano, y Ollama para el asistente.

Inicio rápido en modo de desarrollo (Linux; en Windows, ver la guía):

```bash
cd backend && uv sync
DATABASE_URL=sqlite:///data/desarrollo.db PUEBLA_TAREAS=0 uv run uvicorn app.main:app --reload --port 8000

cd frontend && npm ci && npm run dev                # en otra terminal → http://localhost:5173
```

Requisitos: Python ≥ 3.12 con [`uv`](https://docs.astral.sh/uv/), Node ≥ 22.12 y, para el asistente, [Ollama](https://ollama.com) con `qwen3:4b` y `bge-m3`.

## Uso de inteligencia artificial

Usamos asistentes de IA (Claude Code) para investigar, depurar y apoyar la programación, como permite la guía del proyecto. Cada integrante debe poder explicar y modificar su parte del código sin IA. El asistente del turista usa un modelo de lenguaje local que responde solo con los datos de la app y cita sus fuentes.
