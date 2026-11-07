---
title: "09 - Guion de pitch"
tags: [hackathon, puebla, turismo, pitch]
status: final-stand
created: 2026-10-11
updated: 2026-10-16
---

# 🎤 Guion de pitch: Puebla Ahora (5 min + módulos)

> [!info] Qué cambió (2026-10-16)
> Reescrito como **pitch de venta** con el producto terminado. Cambios:
> - Se quitó el "modo escenario": la demo es **en vivo**.
> - El momento fuerte ahora es **"las dos caras"**: el gobierno fija un color en el panel, el celular del evaluador cambia y su reporte llega al panel.
> - La tecnología se vende como **promesas**, no como siglas.
>
> Cifras de [[02 - Problema y propuesta]], [[07 - Modelo de negocio y escalabilidad]] y `docs/16 - Slides de implementación.md`.

> [!abstract] Formato
> - **Duración:** de 5 a 10 minutos en el stand, viernes 2026-10-16 de 12:00 a 15:00. Se repite igual cada vez.
> - **Núcleo de 5:00:** se sostiene solo. Si sobra tiempo, se agregan los **módulos A, B y C** (de 1 a 2 min cada uno).
> - **Voces:**
>   - **Angel** abre, vende la experiencia y el dinero, y cierra.
>   - **Axel** opera la laptop (panel) y da el bloque "Por qué creernos". Responde las preguntas técnicas.
> - **Público:** estudiantes, maestros **y empresarios**. El dinero y la pedida tienen que quedar claros.

> [!tip] Diapositivas (2026-10-16)
> [Puebla Ahora — Pitch](https://claude.ai/artifact/FqCamprZt4RFkVoY6fL487), en claude.ai. Es privada hasta que Angel la comparta, y se descarga como .pptx o PDF.
> - **Núcleo:** 9 diapositivas, una por bloque de este guion.
> - **Apéndice:** A1, A2, B y C, para los módulos.
> - Las notas del orador llevan el texto de cada bloque, quién habla y el minuto.
> - **Para Axel:** reemplazar los recuadros punteados de las diapositivas 4 (capturas de la app y del panel), 5 y 9 (QR a `http://IP:8000`).

## 🧭 Idea rectora

El pitch responde tres preguntas, en este orden:
1. **¿Qué vive el turista?** Sabe a dónde ir *ahora* y por qué.
2. **¿Qué gana el gobierno?** Datos hora por hora que hoy no tiene, y dinero nuevo medido.
3. **¿Por qué creernos?** Nada inventado, una IA que no alucina y todo funcionando frente a ellos.

La tecnología entra solo en la tercera, y cada sigla se dice como lo que **promete**. Un empresario no compra "RAG"; compra "no inventa".

| Criterio de la rúbrica ([[01 - Convocatoria y reglas]]) | Peso | Dónde se gana en el pitch |
|---|---|---|
| Datos | 20% | Bloques 2 y 5: "nada inventado", fuentes oficiales y el reporte como dato nuevo |
| Problema | 15% | Bloques 1 y 2: la historia y las cifras, con la cita del propio gobierno |
| Innovación | 15% | Bloque 4: turistas como sensores y redirección que explica el porqué |
| Solidez técnica | 15% | Bloques 4 y 5, y módulo A: todo en vivo, evaluación del asistente y pruebas |
| Impacto | 15% | Bloque 6: dinero **nuevo** en destinos con hoteles medio vacíos |
| Viabilidad | 10% | Bloque 6 y módulo B: piloto, licencia y costos reales |
| Experiencia de usuario | 5% | Bloque 4: el evaluador la usa en su celular, en español o inglés |
| Pitch | 5% | Todo: 5:00 cronometrados y una sola pedida |

## ⏱️ Núcleo: 5:00

| # | Bloque | Quién | Tiempo | Acumulado |
|---|---|---|---|---|
| 1 | Gancho | Angel | 0:30 | 0:30 |
| 2 | Problema | Angel | 0:40 | 1:10 |
| 3 | Solución: dos caras | Angel | 0:20 | 1:30 |
| 4 | Demo en vivo | Angel narra, Axel opera, el evaluador usa su celular | 1:30 | 3:00 |
| 5 | Por qué creernos | Axel | 1:00 | 4:00 |
| 6 | Dinero y pedida | Angel | 0:45 | 4:45 |
| 7 | Cierre | Angel | 0:15 | 5:00 |

### 1. Gancho (Angel, 0:30)
> "Sábado, doce del día. Llegas a la Pirámide de Cholula: una hora de fila, y empieza a llover. Te regresas al hotel. Esa tarde no gastaste un peso más en Puebla. Y nadie te dijo que había otro lugar parecido, cerca, sin fila y bajo techo."

*Nota:* es una historia ilustrativa, no un dato; por eso no lleva cifras. Contarla mirando al evaluador, no a la pantalla.

### 2. Problema (Angel, 0:40)
> "Esto no es un caso aislado. En 2025, **46 %** de los turistas que llegaron al estado fueron a la capital, y ahí se quedó el **68 %** del dinero que gastaron. La Zona Arqueológica de Cholula se lleva **4 de cada 10** visitas a los recintos del INAH en Puebla. Mientras, Tepeaca y Acatzingo tienen sus hoteles a **menos del 30 %**.
> Lo dice el propio gobierno en su boletín del primer trimestre: hay que *'distribuir de manera más equilibrada los beneficios de la actividad turística'*.
> El problema es que **el turista decide a ciegas**, y el gobierno ve datos **de hace un mes**."

*Fuente:* cálculo propio con el Observatorio Turístico y el INAH, y el Boletín 1T 2026 ([[02 - Problema y propuesta]]). Si preguntan: 46.3 %, 68.5 % y 39.7 %; Tepeaca 29.7 % y Acatzingo 28.5 % (promedio 2025).

### 3. Solución: dos caras (Angel, 0:20)
> "**Puebla Ahora** tiene dos caras. Al turista le dice **a dónde ir ahora**, y por qué. Al gobierno le da, por primera vez, **lo que pasa hora por hora**, y el dinero que llega a donde hace falta. Se los muestro: saquen su celular."

### 4. Demo en vivo (1:30)

| Paso | Qué pasa | Qué se dice |
|---|---|---|
| 1 | El evaluador escanea el QR, elige dónde está y qué le gusta y ve el semáforo de los **23 lugares** | "Esto no es una simulación: es la afluencia estimada de esta hora, con el clima y el tráfico de hace minutos." |
| 2 | **Cara del gobierno.** Axel, en el panel de la laptop, **fija en rojo** un lugar abierto (Zócalo o Cholula) con un motivo, por ejemplo "evento" | "Esta es la herramienta del gobierno: si hay un evento o una obra, lo marca. Los demás colores son en vivo." |
| 3 | **Cara del turista.** El evaluador toca ese lugar en su celular: sale en rojo con **"Mejor ve a…"**, la alternativa parecida, la razón (afluencia, clima y traslado), "Qué vas a encontrar" y el lugar sugerido en rosa en el mapa | "No solo le decimos que no vaya: le damos otra opción parecida y le explicamos **por qué**." |
| 4 | El evaluador presiona **"¿Cómo está?"** y reporta. En la laptop, **el panel lo registra** | "Cada turista es un sensor, como en Waze. Su reporte corrige la estimación para el que viene detrás, y el gobierno lo ve al momento." |
| 5 | *(Si sobra tiempo)* Cambiar a **EN** en la cabecera, o hacer una pregunta al asistente | "El turista extranjero la ve en su idioma." |

> [!warning] Plan B
> - **Ya hay un lugar en rojo en vivo:** se usa ese y se omite el paso 2. Es todavía mejor.
> - **Sin red o la app no carga:** se pone el **video de respaldo** (~2 min) y se sigue con el bloque 5.
> - **El color fijado no aparece al instante:** el semáforo del turista se recarga cada minuto. Pedirle al evaluador que **toque el lugar después** de que Axel lo fije. Medirlo en el ensayo.
> - Solo se puede fijar un lugar **abierto** a esa hora: un lugar cerrado se queda en "cerrado".

### 5. Por qué creernos (Axel, 1:00)
Una frase por promesa: primero la promesa y después el nombre de la tecnología.

> "Detrás hay cinco promesas.
> **Uno, nada inventado:** cada dato tiene su fuente oficial: Observatorio, INAH, INEGI, clima y tráfico en vivo, todo en nuestra propia base de datos.
> **Dos, el asistente no alucina:** responde solo con nuestros datos y cita la fuente; si no sabe, dice 'no tengo ese dato'. Eso es RAG, y lo medimos: 28 de 28 preguntas sin un solo número inventado.
> **Tres, la IA es del gobierno:** el modelo corre en su servidor, sin pagar por uso y sin que los datos salgan. Hoy es Qwen3; mañana, el que ustedes elijan, cambiando una línea.
> **Cuatro, se conecta a todo:** con MCP, el chatbot oficial del estado o cualquier agente de IA usa estas mismas 15 herramientas sin reprogramar nada.
> **Cinco, crece:** agregar un destino es agregar lugares al catálogo, porque los datos base son nacionales.
> Y todo lo que vieron corre en esta laptop, con **costo de operación de cero pesos**."

### 6. Dinero y pedida (Angel, 0:45)
> "No buscamos quitarle turistas a la capital. Buscamos que el turista que ya viene **sume una parada o una noche**.
> Si solo **1 de cada 50** lo hace, son unos **110 millones de pesos nuevos al año** en destinos con hoteles medio vacíos.
> El turista usa la app gratis. El gobierno paga una **licencia** por el panel, y aun cobrando un millón al año, le regresamos más de **100 veces** lo que paga.
> Lo que les pedimos: **un piloto de 3 a 6 meses con la Secretaría de Turismo en Puebla, Cholula y Atlixco**, y la autorización para usar los datos del Observatorio y del INAH."

*Supuestos, en una frase si preguntan:* el gasto de la visita extra es el promedio por llegada de los destinos secundarios (~$1,725), y la adopción es un escenario que el piloto mide ([[07 - Modelo de negocio y escalabilidad]] §3).

### 7. Cierre (Angel, 0:15)
> "Puebla ya tiene a los turistas. Lo que le falta es decirles **a dónde ir ahora**. Somos Puebla Ahora: gracias."

Se señala el QR y se pasa a las preguntas.

## 🔤 Las siglas, traducidas a promesas

Es la base del bloque 5 y de las diapositivas. La columna "Prueba" es lo que se muestra si piden evidencia.

| Tecnología | Promesa | Prueba |
|---|---|---|
| **Base de datos con trazabilidad** (SQLite + pipeline) | "Nada inventado: cada dato tiene su fuente oficial" | Observatorio, INAH, DENUE (19,974 establecimientos), Open-Meteo y TomTom. Cada archivo original con su huella SHA-256, y 20 revisiones automáticas en cada carga |
| **RAG** (ChromaDB + `bge-m3`) | "El asistente no alucina: cita la fuente y dice cuando no sabe" | 28/28 sin números inventados, 28/28 citas válidas y 5/5 "No tengo ese dato" (`backend/data/processed/evaluacion_rag.md`) |
| **LLM local a elegir** (Ollama + Qwen3) | "La IA es del gobierno: corre en su servidor, sin pago por uso, y el modelo se cambia en una línea" | Variable `OLLAMA_MODELO`; Qwen3 con licencia Apache 2.0 |
| **MCP** (servidor `puebla_ahora_mcp`) | "Se conecta a cualquier agente de IA sin reprogramar" | 15 tools; se pueden mostrar en MCP Inspector |
| **Flexibilidad** | "Crece agregando lugares; funciona igual para Zacatlán o Cuetzalan; español e inglés" | `catalogo/`, datos nacionales (DENUE, DATATUR, INAH) y el selector ES/EN |

## 🧩 Módulos opcionales (si dan más de 5 min)

Se insertan **entre el bloque 5 y el 6**, en el orden que pida la conversación.

### A. Tecnología a fondo (Axel, ~2:00), para un evaluador técnico
- **Arquitectura:** datos oficiales y en vivo → pipeline → SQLite. Una sola fuente de verdad (`situacion`) alimenta la API, el recomendador, el asistente y el MCP: "todos dicen lo mismo".
- **Semáforo "cada lugar contra sí mismo":** rojo es más lleno que el 85 % de **sus propias** horas. La Catedral no compite con el Zócalo.
- **Reportes con caducidad:** la estimación vale como unos 2 reportes recientes, y un reporte deja de contar a las 3 h. Con 3 reportes válidos en la última hora aparece "confirmado por turistas".
- **"Mejor ve a…":** el puntaje es 30 % parecido y 70 % conveniencia (afluencia, clima y traslado). También propone **otra hora**.
- **Calidad:** 111 pruebas automáticas y una evaluación del asistente repetible.

### B. Negocio con honestidad (Angel, ~1:30), para un empresario o funcionario
- "El prototipo cuesta $0; el producto vendido no." Las piezas gratuitas solo para uso no comercial pasan a plan de pago (clima y tráfico), y lo tenemos identificado pieza por pieza ([[07 - Modelo de negocio y escalabilidad]] §5).
- El panel separa la derrama **redistribuida** (redirecciones aceptadas) de la **nueva estimada** (paradas agregadas), y la segunda se presenta como estimación.
- **Métricas del piloto:** redirecciones aceptadas, paradas agregadas, reportes por día y ocupación de los destinos recomendados contra el mismo mes del año anterior.
- **Fase 2:** enlaces de afiliación sin alterar el orden de las recomendaciones, réplica en otros estados y boletaje del INAH en lugar de la estimación.

### C. Competencia y validación (Angel, ~1:00)
- "No es una idea sin probar." Check Barcelona, Ámsterdam, Seúl y CrowdPinch ya muestran qué tan lleno está un lugar ([[13 - Referencias y benchmarking]]).
- Ellos usan sensores, antenas o boletaje. Nosotros arrancamos con **datos oficiales y reportes**, sin instalar nada.
- "Analizamos a la competencia con **ingeniería inversa ética** (REA): solo sus páginas públicas, sin su código ni sus APIs. Tomamos lo que ya funciona." REA es **el método** del análisis, no una pieza de la app.
- **Lo que nos distingue:** somos locales, con datos oficiales de Puebla; **explicamos por qué** recomendamos algo; y el gobierno tiene un panel con control manual del color.

## 🙋 Preguntas probables del jurado

> [!question]- ¿El rojo que fijaron es real?
> Ese no: lo fijamos en el panel para mostrar la herramienta del gobierno, y lo dijimos así. Los demás colores son la estimación de esta hora, corregida por los reportes. En operación, el gobierno lo usa para eventos, obras o cierres.

> [!question]- ¿De verdad saben cuánta gente hay ahora?
> No contamos personas, y lo decimos claro: no existe una fuente pública en vivo. Estimamos con datos oficiales mensuales y factores de día, hora, clima y eventos, y los reportes de los turistas lo corrigen. En la fase 2 se conecta el boletaje del INAH o contadores, datos que el gobierno ya tiene. Los factores de día y hora son supuestos del equipo, documentados.

> [!question]- ¿Por qué un modelo local y no ChatGPT?
> Por tres razones: no hay pago por cada pregunta, los datos del turista no salen del servidor y el modelo se puede cambiar. Además, el modelo no decide nada: el backend calcula las cifras y el modelo solo las redacta, citando la fuente.

> [!question]- ¿Qué es MCP y para qué le sirve al gobierno?
> Es un estándar para que un agente de IA use herramientas externas. Publicamos 15: "qué hago ahora", estado de un lugar, alternativa, derrama, etc. Si mañana el estado tiene su propio chatbot o usa otro asistente, se conecta a estos mismos datos sin reprogramar nada.

> [!question]- ¿No le quitan turistas y dinero a la capital?
> No. El objetivo es **sumar** una parada o una noche. En temporada alta, además, retenemos al turista que encuentra todo lleno y se iría del estado. El panel separa la derrama **nueva** de la **redistribuida**.

> [!question]- ¿Por qué no usan Google Maps?
> Las "horas pico" de Google no están en su API pública, y extraerlas viola sus términos. Usamos fuentes con licencia que respetamos: OpenStreetMap, Open-Meteo, TomTom y OpenRouteService.

> [!question]- ¿Tienen permiso de usar esos datos para vender?
> Cada fuente tiene su licencia documentada. Los datos abiertos federales (INEGI, Secretaría de Cultura) permiten uso comercial citando la fuente. Las APIs gratuitas que son solo no comerciales pasan a plan de pago en producción. El Observatorio y el INAH se piden por escrito, y la Secretaría es el propio cliente ([[07 - Modelo de negocio y escalabilidad]] §5).

> [!question]- ¿Y la privacidad?
> Sin cuenta, sin nombre y sin correo. La sesión es anónima. La ubicación nunca sale del celular: solo viaja la distancia al lugar. Al gobierno solo le llegan agregados por lugar y hora.

> [!question]- ¿Y si nadie reporta?
> La app funciona con la estimación oficial desde el primer día. Los reportes la mejoran; no la sostienen. Es lo que le pasó a YouFlanders: empezó solo con reportes y, por falta de usuarios, tuvo que cambiar a datos de antenas ([[13 - Referencias y benchmarking]]).

> [!question]- ¿Cuánto cuesta operarlo y quién lo paga?
> El prototipo cuesta $0. En producción: un servidor, los planes comerciales de clima y tráfico, y la actualización mensual de datos. Lo paga la Secretaría o los municipios con una licencia anual que es una fracción mínima del dinero nuevo que demuestra.

## ✅ Reglas del stand
- Cifras **redondas** y con su fuente. Los supuestos, en una frase ("si 1 de cada 50…").
- El color fijado **siempre** se presenta como herramienta del gobierno, nunca como dato en vivo.
- Nunca prometer conteo real de personas: "estimamos y los turistas corrigen".
- **Una sola pedida:** el piloto de 3 a 6 meses y la autorización de los datos.
- Antes del primer evaluador, hacer una pregunta al asistente para que el modelo ya esté cargado.

## 🔁 Ensayo
1. Cronometrar el núcleo **3 veces** con Axel, con un objetivo de 4:45 a 5:00. Si se pasa, recortar del bloque 5, nunca del 6.
2. En la laptop del stand, medir cuánto tarda el color fijado en verse en un celular (paso 2 de la demo).
3. Grabar el **video de respaldo** (~2 min) del flujo de la demo.
4. Ensayar una vez cada módulo (A, B y C) y las preguntas de arriba.

## 🔗 Relacionado
- [[02 - Problema y propuesta]]
- [[07 - Modelo de negocio y escalabilidad]]
- [[08 - Preguntas abiertas y riesgos]]
- [[10 - Análisis FIS]]
- [[13 - Referencias y benchmarking]]

---
#hackathon
