---
title: "06 - Plan de trabajo y roles"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-14
---

# 🗓️ Plan de trabajo y roles

> [!warning] Fecha límite real
> El prototipo **llega hecho** a la evaluación del **viernes 16 de octubre, de 12:00 a 15:00** ([[01 - Convocatoria y reglas]]). Se programa desde el **miércoles en la noche** hasta el jueves. Regla: **lo que no funcione el jueves en la noche, no se presenta.**

## 📅 Plan

| Día | Bloque | Tareas | Resultado |
|---|---|---|---|
| **Mar 13** (noche) | Propuesta | Propuesta v2 escrita en el vault | ✅ Notas 00–06 |
| **Mié 14** (día) | Validación | ✅ Asesor (Rafael Pérez Aguirre): v2 aprobada con RAG + ChromaDB, otro modelo (Qwen3) y FastAPI + React. Hacer la lista de verificación de abajo; definir nombre y roles | ✅ Luz verde |
| **Mié 14** (noche) | Base | Repo con `backend/` (uv) y `frontend/` (Vite); esquema SQLite; pipeline del Observatorio, INAH y DENUE; **catálogo de la zona piloto** (15–25 puntos, revisados a mano, con su **ficha de texto**); matriz de traslados; eventos y calendario; `ollama pull qwen3:4b qwen3:8b bge-m3` | `puebla.db` cargada y validada |
| **Jue 15** (madrugada / mañana) | Modelos + RAG | Indexar ChromaDB (`puntos`, `eventos`, `conocimiento`); afluencia estimada + conveniencia + semáforo; clima en vivo; recomendador semántico; fusión con reportes; flujo RAG + 15 preguntas de prueba | Funciones en `turismo_core` probadas con `pytest` |
| **Jue 15** (tarde) | Interfaces | FastAPI con los endpoints de [[05c - Backend FastAPI y frontend React]]; React: mapa, semáforo, "mejor ve a…", botón "¿Cómo está?", **modo escenario**, chat y panel; servidor MCP; prueba con `qwen3:4b` en la laptop | Demo completa |
| **Jue 15** (noche) | Presentación | `npm run build` servido por FastAPI; prueba por hotspot con un celular; cartel con QR, video de respaldo, ensayo del pitch de 5 min con preguntas; `develop` → `main` | Todo listo |
| **Vie 16** (mañana) | Montaje | Revisar laptop, cargadores y hotspot; levantar ChromaDB, FastAPI y Ollama; hacer una pregunta de calentamiento al modelo; llegar con anticipación | Stand montado antes de las 12:00 |

## ✅ Qué verificar el miércoles (antes de programar)

- [ ] Sacar la clave gratuita de **TomTom** y confirmar que no pide tarjeta.
- [ ] Sacar la clave gratuita de **OpenRouteService** y probar una matriz.
- [ ] Probar **Open-Meteo** con 2 coordenadas de la zona piloto.
- [ ] Descargar el CSV del **SIC** y el de **Museos del Estado de Puebla**; ver de qué fecha son.
- [ ] Capturar los horarios oficiales del **INAH** de los recintos de la zona piloto.
- [ ] Confirmar los **códigos SCIAN** de turismo en el catálogo del INEGI.
- [ ] Confirmar las fechas de **Valle de Catrinas** y **Catrinia** en la página del Ayuntamiento de Atlixco o de Sectur.
- [ ] Probar **`qwen3:4b`** en la laptop: velocidad, español, y cómo apagar el modo *thinking* por el endpoint compatible con OpenAI.
- [ ] Probar **`bge-m3`** + `qwen3:4b` juntos en la laptop (¿caben en 4 GB de VRAM o uno se va a CPU?).
- [ ] Instalar `chromadb` y probar `chroma run --path data/chroma --port 8001` + `HttpClient`.
- [ ] Confirmar el nombre y los parámetros de `OllamaEmbeddingFunction` en la versión instalada de ChromaDB.
- [ ] Ver qué versión de `react-leaflet` corresponde a la versión de React que instala Vite.
- [ ] Probar el **hotspot**: que un celular abra `http://<IP-laptop>:8000` (firewall de Windows y aislamiento de clientes).
- [ ] Preguntarle al tutor: ¿le convence la afluencia estimada + reportes como respuesta a "no hay datos en vivo"?

## ✂️ Orden de corte si falta tiempo

| Prioridad | Qué | Nota |
|---|---|---|
| 1 | Catálogo de la zona piloto + BD cargada | Sin esto no hay nada |
| 2 | Afluencia estimada + semáforo en el mapa | El corazón |
| 3 | Clima en vivo | Una llamada, sin clave |
| 4 | Recomendador "mejor ve a…" con la razón | |
| 5 | **Modo escenario** | Imprescindible para la demo |
| 6 | Traslados (matriz precalculada) | |
| 7 | Botón "¿Cómo está?" + fusión de reportes + panel de gobierno | Es lo que más gustó: **no se corta**, se simplifica si hace falta |
| 8 | Asistente con RAG (ChromaDB + Qwen3) y servidor MCP | Lo pidió el asesor: va antes que lo opcional |
| 9 | Tráfico real con TomTom | Si no sale, se usa un factor fijo por hora |
| 10 | Plan del día | Fase 2 si no da tiempo |

Si algo se cae, se presenta lo que funciona y lo demás va como "fase 2".

## 👥 Roles (acordados 2026-10-15)

| Rol | Responsabilidades | Persona |
|---|---|---|
| **Backend, datos, IA y MCP** (todo lo que no es frontend) | Catálogo de la zona piloto y fichas de texto; esquema SQLite y pipeline del Observatorio, INAH y DENUE; eventos y calendario; fichas de fuentes con su licencia ([[04b - Plantilla ficha de fuente de datos]]); `turismo_core` (afluencia, **semáforo con umbrales por lugar**, reportes, ajuste manual, conveniencia, recomendador); ChromaDB + RAG con Qwen3; FastAPI; servidor FastMCP | **Axel** |
| **Frontend** | React + Vite: mapa con semáforo, tarjeta del punto, "mejor ve a…", botón "¿Cómo está?", modo escenario, chat y panel (con "Fijar color" y umbrales); demo por hotspot | **Angel** |
| **Venta** | Modelo de negocio y licencias ([[07 - Modelo de negocio y escalabilidad]]), guion de 5 min ([[09 - Guion de pitch]]), cartel con QR, video de respaldo, ensayo | **Angel** (el ensayo, entre los dos) |

Diego Navarro Sánchez completa el equipo registrado; el tutor es el **Mtro. Rafael Pérez Aguirre**.

El contrato entre Axel y Angel es la **tabla de endpoints** de [[05c - Backend FastAPI y frontend React]] y los casos de uso de [[10 - Análisis FIS]]: con ellos, el frontend avanza con datos falsos mientras el backend se termina.

### 🌿 Branches

| Branch | Qué lleva | Quién |
|---|---|---|
| `develop` | La propuesta (`docs/`, README), `catalogo/`, `entregables/` y la maqueta (`frontend/maqueta/`); de aquí salen las otras dos | Ambos |
| `backend` | `backend/`: datos, `turismo_core`, RAG, FastAPI y MCP | Axel |
| `frontend` | `frontend/`: la app en React + Vite | Angel |

Cada branch se integra a `develop` cuando su parte funcione, y `develop` → `main` antes del stand. La estructura de carpetas está en [[11 - Entregables y estructura]]. Como cada quien toca solo su carpeta, no debería haber conflictos.

## 🧳 Para el stand
- [ ] Laptop con todo instalado y probado **sin internet**: frontend compilado, FastAPI, SQLite, ChromaDB indexado, MCP y Ollama con `qwen3:4b` y `bge-m3` ya descargados.
- [ ] Datos en vivo de respaldo: la última consulta de clima y tráfico guardada en la BD.
- [ ] Hotspot del celular: red para los evaluadores (QR), datos en vivo y respaldo Gemini/Groq.
- [ ] Pantalla o monitor extra (por confirmar si alguien tiene): uno para el panel y otro para la app.
- [ ] Cartel para la mampara: problema, 3 cifras clave, cómo funciona, **QR a la app** (y nombre de la red del hotspot).
- [ ] Video de respaldo de la demo (~2 min).
- [ ] Cargadores y extensión.

## ✅ Checklist de entregables (sección 9 de la convocatoria)

- [ ] Descripción ejecutiva — README del repo
- [ ] Problema y usuarios — [[02 - Problema y propuesta]]
- [ ] Descripción de la solución — [[03 - Ideas y alternativas]]
- [ ] Inventario y documentación de fuentes — [[04 - Fuentes de datos]]
- [ ] Justificación de selección de datos — fichas con [[04b - Plantilla ficha de fuente de datos]]
- [ ] Proceso de obtención, limpieza, integración, transformación y análisis — pipeline en `scripts/` + `validar_bd.py`
- [ ] Arquitectura o metodología — [[05 - Arquitectura y MCP]], [[05b - ChromaDB y RAG]], [[05c - Backend FastAPI y frontend React]]
- [ ] Prototipo funcional — app del turista + panel (React) + API (FastAPI) + RAG + MCP
- [ ] Evidencia de análisis y resultados — cifras del problema, ejemplos de semáforo y redirección
- [ ] Presentación y demo final — [[09 - Guion de pitch]] + cartel + video
- [ ] Documentación del modelo de IA — fichas de modelos (`datos://modelos`) con supuestos y límites, más la evaluación del RAG (hit@5, fidelidad, "no sé")

## 🔗 Relacionado
- [[00 - Índice]]
- [[01 - Convocatoria y reglas]]

---
#hackathon
