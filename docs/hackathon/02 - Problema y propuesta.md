---
title: "02 - Problema y propuesta"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-14
---

# 🧭 Problema y propuesta

**Nombre del proyecto:** [por definir] — ideas: "Puebla Ahora", "¿Y si mejor…?", "Ruta Viva".
**Propuesta v2:** "¿A dónde voy ahora?", el turista en tiempo real.

## 💰 Primero: qué es la derrama (y qué queremos con ella)

> [!warning] La derrama económica no es una pérdida
> La **derrama económica** es **el dinero que gastan los turistas** en un destino: hotel, comida, compras, entradas y transporte. Para el estado es **ingreso**. No queremos que **baje**. Queremos **dos cosas**:
> 1. **Que suba**: que el turista se quede más tiempo y gaste más.
> 2. **Que se reparta**: hoy Cd. Puebla se queda con el **68.5%** de la derrama del estado (2025, cálculo propio con datos del Observatorio).
>
> En el pitch se dice "**aumentar y redistribuir la derrama**". Decir "bajar la derrama" haría pensar al jurado que queremos que el turismo deje menos dinero.

## 🎯 Lo que el evaluador quiere comprar

| Lo que le importa al gobierno | Cómo lo da la v2 |
|---|---|
| **Más derrama** | Un turista que no pierde una hora en fila o en tráfico usa ese tiempo en otro atractivo, comiendo o comprando. Si el día rinde, es más probable que se quede una noche más |
| **Derrama mejor repartida** | La app manda turistas de los puntos saturados a alternativas cercanas con capacidad libre |
| **Menos saturación** | Redirige en el momento, no solo con campañas de temporada |
| **Datos que hoy no tiene** | Cada búsqueda, redirección y reporte es un dato nuevo: qué quiere ver el turista, a dónde se fue en lugar de su primera opción y qué tan lleno estuvo cada lugar, hora por hora |
| **Un sistema que crezca** | Empieza en una zona piloto; para sumar destinos basta agregar puntos al catálogo |

## ❗ Problema
- El turismo en Puebla **se concentra** en pocos destinos y atractivos: la capital y Cholula se llevan la mayor parte de los turistas, la ocupación y la derrama, mientras otros destinos con oferta quedan subutilizados.
- El turista decide **a ciegas en el momento**: no sabe que un lugar está lleno, que va a llover o que el acceso está atascado. Pierde tiempo, y ese tiempo perdido es gasto que no ocurre.
- El gobierno solo tiene datos **mensuales y agregados**. No sabe qué pasa hora por hora ni a dónde se mueve el turista cuando cambia de plan.

## 📈 Evidencia (verificada)

### Lo que dice el propio gobierno
> [!quote] Boletín de turismo, 1T 2026 (Gobierno de Puebla)
> "La alta concentración de visitantes en pocos atractivos, particularmente en la Zona Arqueológica de Cholula, así como el comportamiento desigual entre recintos culturales [...] evidencian la necesidad de diversificar la oferta, fortalecer la promoción de otros destinos y consolidar una estrategia que distribuya de manera más equilibrada los beneficios de la actividad turística en la entidad."

El mismo boletín reporta: ocupación estatal promedio **superior a 47%** en el 1T 2026; San Pedro Cholula y Puebla **por encima de 55%**; Tepeaca y Acatzingo **por debajo de 30%**.

### Cifras de cálculo propio (Observatorio Turístico + INAH)

| Hallazgo | Cifra | Fuente |
|---|---|---|
| Ocupación hotelera promedio 2025 — los más altos | Cd. Puebla **60.0%**, San Pedro Cholula **59.6%**, San Andrés Cholula **55.6%** | Observatorio Turístico, cálculo propio (promedio de los 12 meses) |
| Ocupación hotelera promedio 2025 — los más bajos | Acatzingo **28.5%**, Tepeaca **29.7%**, Pahuatlán **32.0%**, Tetela de Ocampo **32.7%** | Ídem |
| Llegadas de turistas 2025 que fueron a Cd. Puebla | **46.3%** de las ~6.89 millones del estado | Ídem (suma anual) |
| Derrama económica 2025 que quedó en Cd. Puebla | **68.5%** de ~$20,259 millones de pesos del estado | Ídem (suma anual; unidad "pesos" según el glosario) |
| Visitas a recintos INAH que fueron a la Z.A. de Cholula | **32.7%** (2023) → **34.4%** (2024) → **39.7%** (2025) → **36.2%** (ene–sep 2026) | INAH, reportes detallados Puebla, cálculo propio |
| Visitantes **extranjeros** de recintos INAH que fueron a la Z.A. de Cholula | **72–82%** según el año (2023–2026) | Ídem |
| Recintos INAH con menos del 1% de las visitas | **5 o 6 de 19**, cada año | Ídem |

> [!note] Cómo leer las cifras
> - Son cálculos del equipo sobre archivos oficiales; el script que las genera irá en el repo ([[04 - Fuentes de datos]]).
> - En el Observatorio, "Cholula" **es la suma** de San Pedro + San Andrés Cholula (confirmado por el equipo, 2026-10-14). No se suma dos veces.
> - "Zacatlán con 60.86%" (2024) está verificado en el Cuadro 2 del boletín 2024-3.

## 👥 Usuarios y beneficiarios

| Usuario | Necesidad | Qué le damos |
|---|---|---|
| **Turista** (usuario de la app) | Saber a dónde ir **ahora** sin perder tiempo | Mapa con semáforo, redirección explicada, plan del día y asistente |
| **Secretaría de Turismo y municipios** (cliente) | Repartir flujos y derrama con datos, no solo con boletines mensuales | Panel con afluencia en vivo, redirecciones, demanda no atendida y derrama redistribuida |
| **Prestadores locales** de destinos secundarios | Más visitantes y más gasto | Aparecer como alternativa recomendada |

## 💡 Hipótesis
Si el turista sabe **en el momento** que un lugar está saturado, que va a llover o que el acceso está atascado, y recibe **una alternativa parecida y cercana con una razón clara**, una parte va a cambiar de plan. Eso reparte flujos y derrama, y cada cambio queda registrado como dato para el gobierno.

## 🛠️ Propuesta: qué ve el turista

**Pantalla principal: "¿A dónde voy ahora?"**

1. El turista dice **dónde está** (o lo detecta el GPS), **qué le gusta** (historia, gastronomía, naturaleza, compras, pueblos mágicos) y **cuánto tiempo tiene** (2 h, medio día, todo el día).
2. Ve un **mapa de la zona piloto en semáforo**:
   - 🟢 Buen momento para ir.
   - 🟡 Hay algo en contra: se llena, llueve o hay tráfico pesado.
   - 🔴 Mejor otro día u otra hora.
3. Si elige un punto 🔴, la app lo **redirige** y le explica por qué:

> **Z.A. de Cholula: 🔴 ahora no conviene**
> - Afluencia estimada **muy alta** (sábado de puente, 12:00).
> - **70%** de probabilidad de lluvia a las 15:00.
> - Traslado: **45 min** con el tráfico actual (normalmente 25).
>
> **Mejor ve a: Atlixco 🟢**
> - Mismo tipo de experiencia (pueblo mágico, historia, gastronomía).
> - Soleado hasta las 18:00 · 40 min · afluencia baja.
> - *Tip: regresa a Cholula el lunes a las 10:00, cuando la afluencia estimada baja.*
>
> *(Ejemplo ilustrativo; los números saldrán del modelo.)*

4. **Plan del día:** con el tiempo disponible, arma un recorrido de 2 a 4 paradas. Pone los lugares techados en las horas de lluvia y evita los que van a estar llenos.
5. **Asistente:** "Estoy en el zócalo, tengo 4 horas y está lloviendo, ¿qué hago?". Responde **solo con nuestros datos**.
6. **Botón "¿Cómo está?":** al llegar, el turista reporta vacío, normal o lleno. Eso corrige la estimación para los que vienen detrás. **Es la pieza central**: convierte a cada turista en un sensor ([[05 - Arquitectura y MCP]]).

## 🏛️ Propuesta: qué ve el gobierno (el panel)

- **Mapa de calor en vivo** de la zona piloto (afluencia estimada + reportes).
- **Redirecciones:** cuántos turistas de Cholula se fueron a otro lado, a dónde y por qué (afluencia, lluvia, tráfico).
- **Derrama redistribuida medida:** redirecciones aceptadas × gasto promedio por visitante del destino (Observatorio).
- **Demanda no atendida:** qué buscan los turistas que la zona no ofrece.
- **Semáforo estatal mensual** de los 20 centros, con pronóstico (capa estructural).

## 📍 Zona piloto: dos capas

| Capa | Alcance | Frecuencia | Para qué |
|---|---|---|---|
| **Estructural** | Los 20 centros del Observatorio | Mensual | La afluencia "normal" de cada lugar por mes y temporada; panel estatal |
| **En vivo** | **Puebla capital, Cholula, Atlixco** y alternativas a menos de 1 h (~15–25 puntos) | Cada 15–60 min | La decisión del turista "ahora" |

> [!tip] Por qué esa zona
> Ahí está el problema más fuerte que muestran los datos: Cd. Puebla y la Z.A. de Cholula están saturadas. Además hay alternativas reales a menos de una hora: Atlixco, otros museos de la capital y recintos INAH con menos del 1% de las visitas. En el pitch se dice: "piloto en la zona metropolitana; el modelo funciona igual para Zacatlán o Cuetzalan".

## 🎬 Cómo se ve en el stand

> [!tip] Modo escenario: lo más importante de la demo
> El viernes a las 12:00 puede estar soleado y sin tráfico, y la demo se vería sosa. La app tiene un **selector de escenario**: "ahora" (datos en vivo) o "sábado de puente, 12:00, con lluvia". El escenario muestra la redirección con claridad, y "ahora" demuestra que los datos son reales.

- **QR en la mampara:** el evaluador se conecta al hotspot del equipo y abre la app en su celular. La sirve la propia laptop, sin nube ni costo ([[05c - Backend FastAPI y frontend React]]).
- La laptop muestra el **panel de gobierno** y el asistente (Qwen3 + RAG, [[05b - ChromaDB y RAG]]).
- El evaluador presiona "¿Cómo está?" y ve cambiar el panel. Ahí se entiende el tiempo real.

## 🌍 Competidores: qué existe y qué nos distingue

> [!info] Cómo se analizó (2026-10-14)
> Se usó **REA** (`rea-agents` 6.5.0, MIT, [github.com/morluto/rea](https://github.com/morluto/rea)), un servidor MCP y CLI de ingeniería inversa. Para sitios web, REA se conecta a un navegador por el protocolo de depuración de Chrome (CDP) y reporta la estructura de la página, el texto visible, el tráfico de red y capturas de pantalla.
> **Alcance que usamos:** solo `inspect-web-page` sobre las **páginas públicas**, en un Edge aislado con perfil temporal. Se leyó el **texto visible de la interfaz** (árbol de accesibilidad). **No** se descargó su código fuente (`--include-script-sources` apagado), **no** se descompilaron sus apps y **no** se usaron sus APIs.
>
> ```bash
> msedge --headless=new --remote-debugging-port=9222 --user-data-dir=<perfil-temporal> https://crowd-pinch.com/
> rea list-browser-targets http://127.0.0.1:9222
> rea inspect-web-page http://127.0.0.1:9222 <targetId> --observation-ms 4000 --include-accessibility-text --format md
> ```
>
> **Dubrovnik** no se pudo inspeccionar: el artículo tiene una verificación anti-bots de Cloudflare, y no se intentó saltarla. Su información viene de una nota de prensa, sin confirmar en una fuente oficial.

| Competidor | Qué observó REA en su interfaz | Lo que ya tenemos | Lo que nos llevamos |
|---|---|---|---|
| **CrowdPinch** (crowd-pinch.com) | Lema "SEARCH · CHECK · REPORT · SHARE"; "Community-Powered Crowd Reports"; 1000 destinos. Cada tarjeta muestra: "🟢 Empty — Go now", "📊 Typically quiet at 11:12 PM" (respaldo con historia), "🌦️ 25°C · Drizzle" (clima), "Plan 1-3h here" (tiempo sugerido) y un botón **"I'm here"** que abre "Report the status in 1 click" con 🟢 Empty / 🟡 Normal / 🔴 Full. Después de reportar: **"Cool down active. You can report another place in a few minutes."** Detecta "Destinations near you — Mexico". Página **"Planifica tu visita"**: eliges fecha → afluencia esperada por hora y **"Orden de visita sugerido"**. Gana dinero con enlaces a hotel, autos, vuelos y "⚡ Salta la fila" | Semáforo de 3 niveles, reporte en 3 botones, respaldo con historia cuando no hay reportes, clima en la tarjeta, límite de reportes por tiempo (antispam), sin registro | Botón **"Estoy aquí"** antes de reportar; mostrar **"normalmente tranquilo a esta hora"** cuando no hay reportes; **tiempo sugerido de visita**; mensaje visible del límite de reportes; planificador **por fecha** con orden de visita |
| **CrowdAvoid** (crowdavoid.com) | "Multitudes en Tiempo Real"; "Predicciones: Clima, cruceros y patrones históricos"; "Itinerario: Planifica alrededor de las mejores horas"; **"Alertas: Notificación cuando baje la afluencia"**; **"Tendencias: Flechas en tiempo real"**; "Colecciona y Gana: Sellos de pasaporte y pines de explorador"; 800+ atracciones, 4 idiomas; app de iOS y Android | Pronóstico con clima, eventos e historia; plan del día | **Flecha de tendencia** (sube o baja); **"Avísame cuando baje"**; **gamificación** (sellos por visitar en horas tranquilas o lugares poco visitados) |
| **Crowd Alerts** (crowdalerts.webflow.io) | 6 pasos: mapa de lugares cercanos con su afluencia → lista → búsqueda → resultados del lugar y de otros cercanos → **"suggestions for similar venues with less crowds"** → al llegar, "send your input on crowd level to help us improve the estimate". Datos de "our API and real user input". Dice estar "still under development" | Mapa, recomendador de lugares parecidos menos llenos, reportes que corrigen la estimación | Confirma el flujo; la búsqueda por nombre del lugar |
| **Dubrovnik** (iniciativa de la ciudad, según prensa) | No inspeccionable (Cloudflare) | Redirección cuando una zona se satura | Cruzar con **llegadas masivas** (en Puebla: excursiones en autobús, eventos); **incentivos** en horas tranquilas |

> [!success] Lo que nos distingue de todos
> - Son **globales y genéricos**. Nosotros somos **locales**: zona piloto de Puebla, con **datos oficiales** del Observatorio Turístico y del INAH como base.
> - Solo atienden al **turista**. Nosotros además le damos al **gobierno** un panel con redirecciones y **derrama redistribuida medida**.
> - Ninguno explica **por qué** recomienda algo. Nosotros sí ("lleno + 70% de lluvia + 45 min de tráfico"), con **fuentes citadas** gracias al RAG ([[05b - ChromaDB y RAG]]).
> - **CrowdPinch valida el modelo**: reportes de la comunidad + respaldo con historia ya funciona en 1,000 destinos. Es un buen argumento para el pitch: "no es una idea sin probar; la estamos llevando a Puebla con datos oficiales".

## 🎯 Alineación con la rúbrica y categorías

| Criterio / categoría | Cómo lo cubre la v2 |
|---|---|
| Datos (20%) / **Mejor solución basada en datos** | Oficiales + en vivo + reportes, depurados y guardados en una base propia con trazabilidad |
| Relevancia del problema (15%) | Concentración medida con cifras propias y respaldada por el propio gobierno |
| Innovación (15%) | Turistas como sensores + afluencia estimada + redirección explicada |
| Solidez técnica (15%) | App, panel, base de datos y servidor MCP funcionando; modo escenario |
| Impacto (15%) / **Turismo sostenible** | Menos presión sobre Cholula; derrama redistribuida medida |
| Viabilidad (10%) | Costo $0; piloto que escala agregando puntos |
| UX (5%) | Una pregunta, un mapa, una recomendación con su razón |
| Pitch (5%) | El evaluador la usa en vivo |
| **Mejor uso de IA** | Pronóstico, fusión de reportes, recomendador e índice de conveniencia; asistente que solo usa esos resultados |

## 🔗 Relacionado
- [[00 - Índice]]
- [[03 - Ideas y alternativas]]
- [[04 - Fuentes de datos]]
- [[05 - Arquitectura y MCP]]

---
#hackathon
