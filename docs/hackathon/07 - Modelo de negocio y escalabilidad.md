---
title: "07 - Modelo de negocio y escalabilidad"
tags: [hackathon, puebla, turismo, negocio]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-15
---

# 💼 Modelo de negocio y escalabilidad

> [!info] Qué cambió (2026-10-15)
> Reescrita a la v2 ("¿A dónde voy ahora?") con lo que Rafa validó el 2026-10-14: **dos caras** (app gratis para el turista, panel con licencia para el gobierno), **dinero nuevo** como argumento central y **licencias comerciales** de cada pieza a la vista. Responsable: Angel. Pesa directo en "Viabilidad, implementación y escalabilidad" (10%) e "Impacto" (15%) ([[01 - Convocatoria y reglas]]).

## 1. La frase que vendemos

**"Hacemos que el turista que ya viene a Puebla vea y gaste más en el estado: una parada más, una noche más. Es dinero nuevo para destinos con hoteles medio vacíos, y el gobierno lo ve medido en su panel."**

## 2. Propuesta de valor por actor

| Actor | Qué gana | Paga |
|---|---|---|
| **Turista** | Sabe a dónde ir *ahora*, sin filas, lluvia ni tráfico, con una alternativa parecida y la razón | No: gratis |
| **Gobierno** (Secretaría y municipios) | Datos que hoy no tiene (afluencia por hora, a dónde se va el turista cuando cambia de plan), **dinero nuevo medido** y una herramienta para dirigir flujos en el momento | **Sí: licencia** |
| **Prestadores locales** | Aparecer recomendados ante turistas que de otra forma no llegarían | No en el MVP; cupones en fase 2 |
| **Inversionista** | Producto que se replica en cualquier estado: los datos base (DENUE, DATATUR, INAH) son nacionales y la app genera los suyos | — |

## 3. El dinero: nuevo, no movido

> [!warning] Por qué "nuevo" y no "redistribuido"
> Con cifras de [[02 - Problema y propuesta]] (2025): quien llega a Cd. Puebla deja **~$4,350**; quien llega al resto del estado, **~$1,725**. Si la app solo **mueve** turistas de la capital a otro destino, la derrama total del estado **puede bajar**. Por eso el argumento es que el turista **sume**, no que cambie.

Tres fuentes de dinero nuevo, en orden de fuerza:
1. **Sumar:** el tiempo que no se pierde en filas o tráfico se usa en otra parada, en comer o en comprar. Y si el día rinde, una noche más.
2. **Retener:** en temporada alta, el turista que encuentra todo lleno se va del estado; la alternativa "mejor ve a…" lo mantiene aquí.
3. **Repartir:** lo que llega a destinos con ocupación de ~30% pesa más en esas comunidades. Es un beneficio social, aunque no sea dinero "nuevo".

**Escenarios** (cálculo propio con el Observatorio, 2025): si una fracción de quienes llegan a Cd. Puebla (~3.19 millones) **suma una visita** a un destino secundario, gastando lo mismo que el visitante promedio de esos destinos ($20,259 M × 31.5% ÷ 3.70 M ≈ **$1,725**):

| Escenario | Turistas que suman una visita | Dinero nuevo al año |
|---|---|---|
| Conservador (1 de cada 50) | ~64 mil | **~$110 millones** |
| Medio (1 de cada 20) | ~160 mil | **~$275 millones** |
| Optimista (1 de cada 10) | ~319 mil | **~$550 millones** |

> [!note] Supuestos (se dicen en voz alta)
> 1. El gasto de la visita extra es el promedio por llegada de los destinos secundarios. Lo correcto es **gasto por turista-noche** de cada destino (el Observatorio trae turistas noche y derrama): se recalcula con los datos crudos.
> 2. La adopción es un escenario, no un pronóstico. El piloto la mide.
> 3. Las cifras base son cálculo propio; el script va en el repo.

### Cómo se mide en el panel

El panel separa lo que la v2 ya registra (búsquedas, redirecciones aceptadas, reportes) en dos números:

| Métrica | Cómo se calcula | Qué demuestra |
|---|---|---|
| **Derrama redistribuida** | Redirecciones aceptadas × gasto por visitante del destino | El dinero llegó a otro lugar |
| **Derrama nueva estimada** | Paradas **agregadas** al plan original (aceptó una alternativa *y además* visitó el punto original después, o agregó una parada del plan del día) × gasto por visitante del destino | El turista gastó **más** en el estado |

La segunda es una estimación (no vemos el ticket del turista) y se presenta como tal.

## 4. Cómo ganamos dinero

| Fuente | Qué es | Estado |
|---|---|---|
| **Licencia anual a gobierno** (principal) | Estado o municipios pagan por el panel y por operar la app del turista con su marca | MVP |
| **Comisión por afiliación** | Enlaces a hospedaje, restaurantes y tours cerca de la alternativa recomendada (idea C9 de [[03 - Ideas y alternativas]]). Marcados como tal y **sin alterar el orden** de las recomendaciones | Fase 2 |
| **Réplica en otros estados** | Otro catálogo de puntos, mismo sistema | Fase 2 |

**Descartado:** cobro por descarga (nadie paga por una app de turismo ocasional) y anuncios intrusivos (contaminan la recomendación y pueden chocar con licencias de datos).

**Precio:** por definir con costos reales. Regla para defenderlo: **la licencia es una fracción mínima del dinero nuevo que demostramos**. Aun cobrando $1 millón al año, el escenario conservador le devuelve al estado más de 100 veces eso.

## 5. Costos y licencias para uso comercial

> [!danger] El prototipo cuesta $0; el producto vendido no
> Varias piezas son gratis **solo para uso no comercial** o con límites. Si se vende la licencia al gobierno, esas piezas pasan a plan de pago o se cambian. Decirlo antes de que lo pregunte el jurado da credibilidad. Todo lo marcado **(verificar)** se confirma en la página oficial antes del pitch.

### Servicios y datos externos

| Pieza | Prototipo | Para uso comercial | Costo en producción |
|---|---|---|---|
| **Open-Meteo** (clima) | Gratis, sin clave; datos **CC BY 4.0** (dar crédito) | La API gratuita es **solo no comercial**; uso comercial requiere suscripción a su API comercial | Plan mensual (verificar precio) |
| **TomTom** (tráfico) | Freemium sin tarjeta, 2,500 consultas/día | Revisar si el plan Freemium permite uso comercial y qué pasa al superar el límite (verificar) | Pago por consulta o plan |
| **OpenRouteService** (traslados) | Clave gratuita con límites diarios | Revisar términos de uso comercial (verificar); alternativa: correr **OSRM** propio con datos de OpenStreetMap | $0 con servidor propio |
| **OpenStreetMap** (mapa y puntos) | Datos **ODbL**: atribución obligatoria; si se publica una base derivada, se comparte con la misma licencia | Permitido con atribución | $0 en datos; los **mosaicos** de `tile.openstreetmap.org` no son para tráfico comercial alto → proveedor de mosaicos o servidor propio |
| **Esri Light Gray Canvas** (mapa base del prototipo, 2026-10-16) | Mosaicos públicos sin clave; atribución "Esri, HERE, Garmin, © OpenStreetMap y la comunidad GIS" | Términos de uso sin cuenta de ArcGIS por confirmar (verificar en goto.arcgisonline.com/maps/World_Light_Gray_Base). CARTO ya exige clave de API | Cuenta de ArcGIS Location Platform, o volver a OpenStreetMap (una línea en `frontend/src/components/capaBase.js`) |
| **Wikimedia Commons** (fotos de los 23 lugares) | CC BY-SA y CC0; autor y licencia en la app | Permitido con atribución; las CC BY-SA recortadas conservan su licencia | $0 |
| **DENUE / INEGI** | Términos de Libre Uso del INEGI | Permite uso comercial **citando la fuente** (verificar texto vigente) | $0 |
| **SIC, Secretaría de Cultura** | Datos abiertos con crédito | Términos de Libre Uso MX (verificar) | $0 |
| **Observatorio Turístico (Puebla)** | PDF público | **No declara licencia** (verificar): pedir autorización por escrito a la Secretaría, que además es el cliente | $0 |
| **INAH (estadísticas)** | Reporte público | **No declara licencia** (verificar): pedir autorización | $0 |

### Software (todo de código abierto)

| Pieza | Licencia | Uso comercial |
|---|---|---|
| Qwen3 (modelo) | Apache 2.0 | ✅ |
| `bge-m3` (embeddings) | MIT | ✅ |
| Ollama | MIT | ✅ |
| ChromaDB | Apache 2.0 | ✅ |
| FastAPI | MIT | ✅ |
| React, Vite | MIT | ✅ |
| Leaflet | BSD-2 | ✅ |
| SQLite | Dominio público | ✅ |

### Normas que aplican en México

| Norma | Qué regula | Qué nos exige |
|---|---|---|
| **Decreto de Datos Abiertos** (DOF, 20/02/2015) y **Términos de Libre Uso MX** | Datos abiertos del gobierno federal | Se pueden usar, incluso comercialmente, **citando la fuente** |
| **Ley Federal del Derecho de Autor** | Bases de datos (como compilaciones) y software | Respetar la licencia de cada base. Las **ideas, métodos y sistemas no se protegen** (art. 14, verificar): tomar la *lógica* de reportes de otras apps es válido; copiar su código o contenido, no |
| **Ley Federal de Protección de Datos Personales en Posesión de los Particulares** (nueva, DOF 20/03/2025) | Datos personales que trate la app | **Aviso de privacidad**. El diseño minimiza: sin cuenta, sesión anónima y la ubicación **no se guarda** ([[10 - Análisis FIS]], RN_07) |
| **Convocatoria §14** + reglamento de PI de la Ibero | Propiedad intelectual del proyecto | La PI es del equipo; el organizador solo tiene uso no comercial para difusión. Revisar el reglamento de la Ibero antes de vender (verificar) |
| **Términos de servicio** de cada API y sitio | Uso de servicios de terceros | Leerlos antes de usar cada servicio; aplica también a la inspección de sitios con REA ([[08 - Preguntas abiertas y riesgos]]) |

### Otros costos de operación
- Un servidor para la app, el panel, la base y el modelo local (sin pago por uso a proveedores de IA).
- Actualización mensual de datos cuando el Observatorio publica.
- Soporte y mantenimiento.

**Lo que el producto no resuelve:** infraestructura, seguridad o señalización de los destinos. Eso sigue siendo tarea del gobierno.

## 6. Cómo empieza: piloto

1. **Piloto de 3–6 meses** con la Secretaría de Turismo en la zona Puebla–Cholula–Atlixco (la de la v2), con el resto del estado en la capa mensual.
2. **Métricas de éxito:** redirecciones aceptadas, paradas agregadas (dinero nuevo estimado), reportes por día y ocupación de los destinos recomendados contra el mismo mes del año anterior.
3. **Fase 2 del piloto:** conectar el boletaje del INAH o contadores (datos que el gobierno ya tiene) para reemplazar la estimación.
4. Con resultados: licencia anual y propuesta a otros estados.

## 7. Escalabilidad

- **Otros destinos y estados:** se agregan puntos al catálogo; DENUE, DATATUR e INAH son nacionales.
- **Más datos con el uso:** cada búsqueda y reporte mejora la estimación; el sistema aprende de la zona donde se usa.
- **Más interfaces:** como todo pasa por `turismo_core` y MCP, un chatbot oficial del estado puede usar las mismas herramientas.
- **Modelo intercambiable:** Qwen3 hoy; un modelo más grande si el cliente lo paga, cambiando una línea de configuración.

## 8. Objeciones probables del jurado

| Pregunta | Respuesta |
|---|---|
| "¿No le quitan turistas a la capital?" | No: buscamos que sumen una parada o una noche. En temporada alta, retenemos al que se iría del estado |
| "¿Por qué pagaría el gobierno?" | Su propio boletín 1T 2026 pide "distribuir de manera más equilibrada los beneficios". Esto lo hace medible y le da datos que hoy no tiene |
| "¿De dónde salen sus números?" | Datos oficiales del Observatorio, con el cálculo y los supuestos a la vista |
| "¿Pueden usar esos datos para vender?" | Cada fuente tiene su licencia documentada; las que no la declaran se piden por escrito, y las APIs con restricción comercial pasan a plan de pago (sección 5) |
| "¿Y si nadie reporta?" | La app funciona con la estimación oficial; los reportes la mejoran. El panel sirve al gobierno desde el día uno |

## 🔗 Relacionado
- [[02 - Problema y propuesta]]
- [[03 - Ideas y alternativas]]
- [[08 - Preguntas abiertas y riesgos]]
- [[09 - Guion de pitch]]
- [[10 - Análisis FIS]]

---
#hackathon
