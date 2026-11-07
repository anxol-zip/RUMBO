---
title: "08 - Preguntas abiertas y riesgos"
tags: [hackathon, puebla, turismo, riesgos]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-15
---

# ❓ Preguntas abiertas y riesgos

## ✅ Ya resuelto

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿El prototipo llega hecho? | **Sí.** Evaluación el viernes 16, 12:00–15:00, en stand | Organizadores ([[01 - Convocatoria y reglas]]) |
| ¿Duración del pitch? | **~5 min**, una o más veces. La mentoría habló de 20 min, pero se confirmó 5 | Equipo, 2026-10-14 |
| ¿Reglas sobre herramientas y servicios externos? | **No hay**: uso libre | Equipo, 2026-10-14 |
| ¿Tercer integrante y tutor? | **Diego Navarro Sánchez** y el **Mtro. Rafael Pérez Aguirre** | Equipo |
| ¿Turista, gobierno o ambos? | **Ambos**: app para el turista (principal) y panel para el gobierno (quien paga). "Desarrollar las dos será lo mejor" | Rafa, 2026-10-14 |
| ¿Todo el estado o una región? | Capa en vivo en la **zona piloto** Puebla–Cholula–Atlixco; capa mensual para los 20 destinos | Rafa + [[02 - Problema y propuesta]] |
| ¿El argumento de "sumar un día" es válido? | **Sí**, y el modelo de licencia a gobierno con app gratis es convincente | Rafa ([[07 - Modelo de negocio y escalabilidad]]) |
| ¿Qué entregar como prototipo? | Un **MVP** que funcione en vivo | Rafa |
| ¿"Cholula" en el Observatorio es San Pedro + San Andrés? | **Sí, es la suma.** No se suma dos veces | Equipo |
| ¿Stack? | FastAPI + React/Vite, SQLite + ChromaDB (RAG), Qwen3 en Ollama, FastMCP | Rafa, 2026-10-14 ([[05 - Arquitectura y MCP]]) |

## 📨 Preguntas pendientes

> [!question] ¿Qué es la "BD de museos" que mencionaron en la mentoría?
> Candidatos: el directorio del **SIC** (Secretaría de Cultura) y el CSV de **Museos del Estado de Puebla** ([[04 - Fuentes de datos]]). Se usan los dos para el catálogo.

> [!question] ¿Bajo qué licencia publican sus datos el Observatorio Turístico y el INAH?
> No la declaran. Pedir autorización por escrito; la Secretaría además es el cliente ([[07 - Modelo de negocio y escalabilidad]]).

> [!question] ¿Qué sistemas usa hoy el gobierno para estos datos?
> Para presentarnos como complemento del Observatorio y no como reemplazo.

## 🔍 REA: cómo lo usamos

Usamos **REA** (con Ghidra) para analizar apps y páginas de afluencia que ya existen y llevar su lógica a nuestro proyecto. Se permite, **como prueba**:

- Analizar sus **páginas públicas** y **descargar sus scripts** (JavaScript, bundles, mapas de fuente) para leer su lógica.
- **Llamar a sus APIs públicas** para ver la forma de sus datos y validar lo que se lee en el código.
- Registrar en [[13 - Referencias y benchmarking]] qué se vio, cuándo y con qué comandos, para que cada idea adoptada tenga su evidencia.

Lo que se aprende se **reimplementa** en nuestro código ([[05 - Arquitectura y MCP]]); no se copia su código tal cual a nuestro repo.

**Qué buscar en cada sitio:** qué estados reporta el usuario, cómo confirman o desmienten otros usuarios un reporte (en Waze: "sigue ahí / ya no está"), cuánto dura un reporte, cómo evitan el spam y qué se muestra cuando no hay reportes. El resultado se traduce a reglas en [[10 - Análisis FIS]] (RN_04 a RN_09) y a la fusión de reportes de [[05 - Arquitectura y MCP]].

**En el pitch se dice:** "analizamos cómo funcionan las apps de afluencia que ya existen en el mundo y llevamos esa lógica a Puebla con datos oficiales". No se menciona la herramienta.

## ⚠️ Riesgos

> [!danger] Tiempo: al 15 de octubre no hay código
> El plan ponía la base de datos y el pipeline el miércoles en la noche. Mitigación: **aplicar ya el orden de corte** de [[06 - Plan de trabajo y roles]]. Imprescindibles: catálogo y base cargada, semáforo, clima, "mejor ve a…", modo escenario y botón "¿Cómo está?" con el panel. El resto se cuenta como fase 2. Regla: lo que no funcione el jueves en la noche, no se presenta.

> [!warning] Demo sin reportes reales
> Al inicio nadie ha reportado. Mitigación: **modo escenario** rotulado como simulación (RN_11), y los evaluadores reportan desde su celular en el stand.

> [!warning] Los factores de día y hora son supuestos
> Las fuentes oficiales son mensuales. Mitigación: decirlo tal cual y mostrar que los reportes los corrigen ([[05 - Arquitectura y MCP]]).

> [!warning] Licencias para uso comercial
> Open-Meteo es gratis solo para uso no comercial, y TomTom y OpenRouteService tienen términos que hay que revisar; el Observatorio y el INAH no declaran licencia. Mitigación: tabla de licencias y costos en [[07 - Modelo de negocio y escalabilidad]], atribución en la app (RN_13) y autorización por escrito para los datos sin licencia.

> [!warning] Datos personales
> Los reportes y sesiones podrían considerarse datos personales. Mitigación: sin cuenta, sesión anónima, ubicación no guardada y solo agregados al gobierno (RN_07, RN_12); aviso de privacidad corto conforme a la ley vigente (DOF 20/03/2025).

> [!warning] Hardware del stand
> `qwen3:4b` y `bge-m3` juntos pueden no caber en los 4 GB de VRAM de la laptop. Mitigación: probarlo antes; si no caben, embeddings en CPU, y la app funciona completa sin asistente.

> [!warning] APIs externas caídas o sin clave
> Mitigación: caché con el último dato guardado y aviso de su antigüedad (RNF_02 de [[10 - Análisis FIS]]); TomTom es opcional (factor fijo por hora).

> [!warning] Hotspot y celulares de los evaluadores
> El firewall de Windows o el aislamiento de clientes pueden bloquear la app. Mitigación: probar con un celular el jueves en la noche; video de respaldo.

> [!warning] Que la IA parezca superficial o invente datos
> Mitigación: modelos propios documentados (estimación, fusión de reportes, conveniencia, recomendador); el asistente cita fuentes y dice "No tengo ese dato" (RN_10); 15 preguntas de prueba antes de la demo.

> [!warning] El argumento del dinero
> Si se presenta como "redistribuir", parece que se le quita a la capital. Mitigación: hablar de **dinero nuevo** (sumar una parada o una noche, retener al que se iría) con escenarios y supuestos visibles ([[07 - Modelo de negocio y escalabilidad]]).

> [!warning] Alcance excesivo
> Mitigación: plan del día, tráfico real, eventos externos y gamificación quedan como fase 2 si no da tiempo ([[03 - Ideas y alternativas]]).

## 🔗 Relacionado
- [[00 - Índice]]
- [[06 - Plan de trabajo y roles]]
- [[07 - Modelo de negocio y escalabilidad]]
- [[10 - Análisis FIS]]

---
#hackathon
