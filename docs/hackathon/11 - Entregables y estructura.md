---
title: "11 - Entregables y estructura"
tags: [hackathon, puebla, turismo, entregables]
status: propuesta-v2
created: 2026-10-15
updated: 2026-10-15
---

# 📦 Entregables y estructura del repo

> [!info] Para qué es esta nota
> Dice **qué se evalúa, dónde está la evidencia en el repo, quién la hace y en qué estado va**. Se actualiza la columna "Estado" conforme avanzamos. Fuente: convocatoria §9, §11 y §12 ([[01 - Convocatoria y reglas]]). Estados: ✅ hecho · 🟡 en curso · ⏳ pendiente.

## 1. Estructura del repo

```text
hackathon-puebla-turistica-360/
├── backend/        # Axel — FastAPI, turismo_core, MCP, pipeline, SQLite y ChromaDB (05, 05b, 05c)
├── frontend/       # Angel — React + Vite; hoy: maqueta/ (maqueta visual en HTML)
├── catalogo/       # Axel — puntos de la zona piloto (CSV) que carga su pipeline
├── entregables/    # Angel — presentación, cartel con QR y video de respaldo
└── docs/           # Ambos — notas del proyecto (esta bóveda de Obsidian)
```

## 2. Entregables de la convocatoria (§9)

| # | Entregable | Dónde está | Responsable | Estado |
|---|---|---|---|---|
| 1 | Descripción ejecutiva | `README.md` | Angel | 🟡 |
| 2 | Problema y usuarios o beneficiarios | [[02 - Problema y propuesta]] | Axel | ✅ |
| 3 | Descripción de la solución | [[02 - Problema y propuesta]], [[03 - Ideas y alternativas]] | Axel | ✅ |
| 4 | Inventario y documentación de fuentes | [[04 - Fuentes de datos]] + fichas con [[04b - Plantilla ficha de fuente de datos]] | Axel (fichas y licencias) | 🟡 |
| 5 | Justificación de la selección de datos | [[04 - Fuentes de datos]] + fichas | Axel | 🟡 |
| 6 | Obtención, limpieza, integración, transformación y análisis | `backend/scripts/` + `catalogo/` | Axel | ⏳ |
| 7 | Arquitectura o metodología | [[05 - Arquitectura y MCP]], [[05b - ChromaDB y RAG]], [[05c - Backend FastAPI y frontend React]], [[10 - Análisis FIS]] | Ambos | ✅ |
| 8 | Prototipo funcional o demostrable | `backend/` + `frontend/` | Axel + Angel | ⏳ |
| 9 | Evidencia de análisis y resultados | Cifras de [[02 - Problema y propuesta]] + script en `backend/scripts/` + capturas de la app | Axel (script), Angel (capturas) | ⏳ |
| 10 | Presentación ejecutiva y demostración | [[09 - Guion de pitch]] + `entregables/` | Angel | 🟡 |
| 11 | Documentación del modelo de IA (configuración, variables, resultados, límites) | [[05 - Arquitectura y MCP]] (capa 1), [[05b - ChromaDB y RAG]] (evaluación) + recurso `datos://modelos` | Axel | 🟡 |
| + | Modelo de negocio, licencias y privacidad (recomendado) | [[07 - Modelo de negocio y escalabilidad]] | Angel | ✅ |

## 3. Rúbrica (§11): qué mostramos para cada criterio

| Criterio | Peso | Evidencia que mostramos | Dónde |
|---|---:|---|---|
| Datos: identificación, pertinencia, calidad y aprovechamiento | **20%** | 3 fuentes oficiales + 3 en vivo + reportes; fichas con licencia; pipeline reproducible; catálogo verificado a mano | [[04 - Fuentes de datos]], `catalogo/`, `backend/scripts/` |
| Relevancia y comprensión del problema | 15% | Concentración medida (46% de turistas y 68% de derrama en la capital) + cita del boletín 1T 2026 | [[02 - Problema y propuesta]] |
| Innovación y creatividad | 15% | Turistas como sensores, afluencia estimada, redirección **explicada**, semáforo con umbrales por lugar, competidores analizados | [[02 - Problema y propuesta]], [[03 - Ideas y alternativas]], [[13 - Referencias y benchmarking]] |
| Solidez técnica y prototipo | 15% | App + panel + API + RAG + MCP funcionando; casos de uso trazados a endpoints | `backend/`, `frontend/`, [[10 - Análisis FIS]] |
| Impacto turístico, económico y social | 15% | **Dinero nuevo** con escenarios ($110–550 M/año) y su medición en el panel | [[07 - Modelo de negocio y escalabilidad]] |
| Viabilidad, implementación y escalabilidad | 10% | Licencia a gobierno, costos y **licencias comerciales**, piloto, réplica en otros estados | [[07 - Modelo de negocio y escalabilidad]] |
| Experiencia de usuario y utilidad | 5% | Una pregunta, un mapa, una recomendación con su razón; criterios de HCI y WCAG | [[12 - Especificación del frontend]], `frontend/maqueta/` |
| Pitch y demostración | 5% | 5 min con demo por QR, modo escenario y video de respaldo | [[09 - Guion de pitch]], `entregables/` |

## 4. Categorías especiales (§12)

Solo se gana **una** además del Gran Premio. Las dos donde somos más fuertes:

| Categoría | Lo que la convocatoria pide | Nuestra evidencia |
|---|---|---|
| **Turismo sostenible** (prioridad) | Gestión responsable de visitantes, **desconcentración de flujos**, desarrollo económico local y regional | Redirección en el momento, derrama a destinos con hoteles medio vacíos, recintos INAH poco visitados como alternativa |
| **Mejor solución basada en datos** | Calidad y diversidad de fuentes, metodología, indicadores o predicciones, información accionable, **reproducibilidad** | Base con trazabilidad por fuente (`fuente.hash_archivo`), pipeline reproducible, datos que hoy no existen (afluencia por hora) |
| Mejor uso de IA | Pertinencia, explicabilidad, uso responsable; "un chatbot genérico no basta" | Modelos propios documentados + RAG que cita fuentes ([[05b - ChromaDB y RAG]]) |

## 🔗 Relacionado
- [[01 - Convocatoria y reglas]]
- [[06 - Plan de trabajo y roles]]
- [[12 - Especificación del frontend]]

---
#hackathon
