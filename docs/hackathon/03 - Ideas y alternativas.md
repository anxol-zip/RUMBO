---
title: "03 - Ideas y alternativas"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-14
---

# 💡 Ideas y alternativas

> [!info] Qué cambió (2026-10-13)
> La v1 era un **semáforo de saturación para funcionarios**, con datos mensuales. Al platicarlo con Angel, vimos que lo que más convence es un producto que **use el turista** y que trabaje con lo que pasa **ahora**. Así nació la v2. Casi todo lo de la v1 se reutiliza, pero cambia de papel.

## 🧩 Componentes de la v2

| Componente | Qué hace | Datos | Dónde está la IA | Esfuerzo | Estado |
|---|---|---|---|---|---|
| **1. Afluencia estimada** (*nowcast*) | Calcula qué tan lleno está cada punto **ahora** | INAH, Observatorio, calendario, eventos, clima | Base oficial × factores de día, hora, evento y clima | Medio | ✅ **MVP** (corazón) |
| **2. Reportes de turistas** | "¿Cómo está?": vacío / normal / lleno, con filtros antispam | Los genera la app | Fusión ponderada con caducidad (los reportes recientes pesan más) | Medio | ✅ **MVP** |
| **3. Índice de conveniencia + semáforo** | Color de cada punto según afluencia, clima, traslado, eventos y horario | 1 + 2 + clima + tráfico | Puntaje ponderado | Bajo | ✅ **MVP** |
| **4. Recomendador "mejor ve a…"** | Alternativa parecida y mejor *ahora*, con la razón | Catálogo (DENUE, INAH, SIC) + 3 | Similitud de embeddings en **ChromaDB** + conveniencia + cercanía (era A2 en la v1) | Medio | ✅ **MVP** |
| **5. Clima en vivo** | Lluvia y temperatura por hora en cada punto | Open-Meteo | — (dato) | Bajo | ✅ **MVP** |
| **6. Modo escenario** | Simular "sábado de puente con lluvia" para la demo | Los anteriores | — | Bajo | ✅ **MVP** (imprescindible para la demo) |
| **7. Traslados** | Tiempo entre puntos | Matriz OpenRouteService (precalculada) | — | Bajo–medio | ✅ **MVP** |
| **8. Panel de gobierno** | Mapa de calor, redirecciones, derrama redistribuida medida | BD propia + Observatorio | Derrama = redirecciones × gasto por visitante (era D en la v1) | Medio | ✅ **MVP** |
| **9. Asistente con RAG (web y MCP)** | "Tengo 4 h y llueve, ¿qué hago?" | Base de conocimiento en ChromaDB + estado en vivo | **RAG**: recupera de ChromaDB, calcula el estado en vivo y Qwen3 local redacta solo con eso, citando fuentes (era E en la v1) ([[05b - ChromaDB y RAG]]) | Medio | ✅ **MVP** |
| **9b. Base de conocimiento (ChromaDB)** | Fichas de puntos, eventos, boletines, glosario y bitácora diaria de reportes | Fuentes oficiales + reportes resumidos | Embeddings multilingües (`bge-m3`) | Medio | ✅ **MVP** (recomendación del asesor) |
| **10. Pronóstico estructural** | Afluencia "normal" del mes por destino | Observatorio 2017–2026 | Holt-Winters (era A en la v1) | Medio | ✅ **MVP** (base de 1 y del panel estatal) |
| **11. Tráfico real** | Factor de tráfico en accesos clave | TomTom (gratis) | — | Medio | 🟡 Si da tiempo (si no, factor fijo por hora) |
| **12. Plan del día** | Recorrido de 2 a 4 paradas | 3 + 7 | Heurística *greedy*: la mejor siguiente parada | Medio | 🟡 Si da tiempo |
| **13. Eventos externos** | Conciertos y eventos privados | Ticketmaster (gratis, cobertura dudosa) | — | Medio | ⏭️ Fase 2 |
| **14. Datos de boletaje INAH / contadores** | Afluencia real en vivo | Requiere convenio con el gobierno | Reemplaza la estimación | — | ⏭️ Fase 2 (argumento del pitch) |

## 🌍 Ideas tomadas de la competencia (análisis con REA, 2026-10-14)

Funcionalidades observadas con REA en las páginas públicas de CrowdPinch, CrowdAvoid y Crowd Alerts ([[02 - Problema y propuesta]]), adaptadas a nuestra propuesta. No se copió código: solo ideas de funcionalidad.

| # | Idea | Viene de | Cómo la adaptamos | Esfuerzo | Estado |
|---|---|---|---|---|---|
| C1 | **Botón "Estoy aquí"** → "Reporta en 1 clic" (🟢 / 🟡 / 🔴) | CrowdPinch | El reporte se abre solo después de confirmar que el turista está en el punto. Encaja con la geocerca de [[05 - Arquitectura y MCP]] | Bajo | ✅ **MVP** (cambio de interfaz) |
| C2 | **"Normalmente tranquilo a esta hora"** cuando no hay reportes | CrowdPinch | Etiqueta en la tarjeta cuando la confianza es "estimado": se ve **de dónde sale el color** | Bajo | ✅ **MVP** |
| C3 | **Mensaje visible del límite de reportes** ("Ya reportaste; podrás reportar otro lugar en unos minutos") | CrowdPinch | Mostrar en pantalla la regla de "1 reporte cada 30 min" del antispam | Bajo | ✅ **MVP** |
| C4 | **Tiempo sugerido de visita** ("Planea 1–3 h aquí") | CrowdPinch | Campo `duracion_sugerida` en el catálogo; lo usa el plan del día | Bajo | ✅ **MVP** (dato del catálogo) |
| C5 | **Flecha de tendencia** (sube ↑ / baja ↓) + mejor y peor hora de hoy | CrowdAvoid | Comparar la afluencia de la hora actual con la siguiente (`afluencia_estimada`) | Bajo | 🟡 Si da tiempo |
| C6 | **"Avísame cuando baje"** | CrowdAvoid | En la web, sin notificaciones push: el turista marca un punto y la app muestra un aviso cuando pasa a 🟢 (sondeo cada 30 s) | Bajo–medio | 🟡 Si da tiempo |
| C7 | **Planificador por fecha** con orden de visita | CrowdPinch | Extiende el plan del día (12): elegir fecha → afluencia esperada por hora → orden sugerido | Medio | 🟡 Si da tiempo |
| C8 | **Gamificación**: sellos o "joyas escondidas" | CrowdAvoid | Sello por visitar en hora 🟢 o un recinto poco visitado (los INAH con menos del 1% de las visitas). Lo puede patrocinar la Secretaría | Medio | ⏭️ Fase 2 (se menciona en el pitch) |
| C9 | **Enlaces de los prestadores** (hotel, comida, "salta la fila") | CrowdPinch | En la alternativa recomendada: restaurantes y hoteles del DENUE cercanos, y en fase 2 cupones de prestadores locales. **Modelo de ingreso** ([[07 - Modelo de negocio y escalabilidad]]) | Bajo (lista) / medio (cupones) | 🟡 Lista del DENUE si da tiempo; cupones en fase 2 |
| C10 | **Llegadas masivas** (cruceros en Dubrovnik) | Dubrovnik (prensa) | Excursiones en autobús y eventos grandes como `evento` con impacto alto | Bajo | ✅ Ya cubierto por la tabla `evento` |
| C11 | **Incentivos en horas tranquilas** | Dubrovnik (prensa) | Descuento o cupón del prestador si el turista acepta la alternativa: mide si la redirección funcionó | Medio | ⏭️ Fase 2 (pitch y modelo de negocio) |

> [!tip] Qué cambia en el MVP
> C1 a C4 son casi gratis y hacen que la app se sienta como un producto real: entran al MVP. C5, C6, C7 y la lista del DENUE de C9 entran si sobra tiempo el jueves. C8 y C11 se cuentan en el pitch como fase 2.

## ♻️ Qué pasa con las ideas de la v1

| Idea v1 | En la v2 |
|---|---|
| A. Semáforo de saturación (Holt-Winters) | Se queda como **pronóstico estructural** (10) y como semáforo estatal del panel |
| A2. Recomendador por similitud | Se queda como **recomendador "mejor ve a…"** (4), ahora filtrado por condiciones del momento |
| B. Brecha oferta-demanda (K-means) | ❌ Sale del producto. Si sobra tiempo, vuelve como vista del panel |
| C. Rutas multi-día | Se reduce a **plan del día** (12) |
| D. Derrama redistribuida | Se queda en el **panel** (8), pero **medida** con redirecciones reales, no solo teórica |
| E. Asistente MCP | Se queda (9), ahora con **RAG** y también para el turista |
| F. Concentración HHI | Sale del producto; queda solo como **cifra del pitch** |
| G. Clima y eventos | **Entra al MVP** (5 y calendario), ya no es fase 2 |

## ⚖️ v1 contra v2

| | v1: semáforo para funcionarios | v2: turista en tiempo real |
|---|---|---|
| Usuario principal | Secretaría de Turismo | Turista (la Secretaría recibe el panel) |
| Datos | Solo oficiales, mensuales | Oficiales + clima + traslados + reportes |
| Demo | Gráficas y pronósticos | El evaluador la usa en su celular |
| Riesgo | Bajo | Medio: más piezas y APIs externas |
| "Wow" en el stand | Medio | Alto |
| Argumento de derrama | Estimación teórica | Redirecciones medibles convertidas en pesos |
| Valor a largo plazo | Ordena datos que ya existen | **Genera datos que no existen** |

## ✅ Recomendación
**v2 con los componentes 1 a 10 (incluido 9b) como MVP.** El 11 y el 12 entran si da tiempo; el 13 y el 14 son fase 2.

Por qué:
- **Experiencia del visitante:** responde la pregunta real del turista ("¿a dónde voy ahora?").
- **Flujos turísticos:** redirige en el momento, con una razón concreta.
- **Distribución económica:** cada redirección aceptada se convierte en pesos para otro destino.
- **IA defendible:** hay modelos propios (estimación, fusión de reportes, conveniencia, similitud, pronóstico), con variables y límites documentados. El asistente no inventa ([[01 - Convocatoria y reglas]]).
- **Honestidad:** no fingimos tener afluencia en vivo. La estimamos y la corregimos con reportes, y lo decimos tal cual.
- **Alcance realista:** zona piloto de 15–25 puntos y traslados precalculados.

## 🔗 Relacionado
- [[00 - Índice]]
- [[02 - Problema y propuesta]]
- [[05 - Arquitectura y MCP]]

---
#hackathon
