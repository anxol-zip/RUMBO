---
title: "13 - Referencias y benchmarking"
tags: [hackathon, puebla, turismo, benchmarking, mcp]
status: investigacion
created: 2026-10-15
updated: 2026-10-15
---

# 🔎 Referencias y benchmarking

Apps, APIs y servidores MCP que ya hacen algo parecido a nuestra propuesta, revisados el 2026-10-15. Cada fila dice **cómo se verificó**: ✅ probado con `curl` o leyendo su código, 📄 solo por documentación o prensa.

## 1. Apps de "semáforo en vivo" + redirección

| Caso | Qué hace | Fuente del dato en vivo | Verificación |
|---|---|---|---|
| **Check Barcelona** (Turisme de Barcelona + Eurecat, 2021) | Afluencia en vivo de ~280 recursos, playas y estacionamientos; recomienda alternativas | Venta de boletos, cámaras en playas, TMB/BSM | ✅ Revisado (ver §2); su API hoy responde vacía |
| **Druktebeeld** (Ámsterdam) | Mapa "niet druk / druk / te druk" cada 15 min | Sensores CMSA, GPS de panel (Resono), estacionamientos, metro | 📄 Registro oficial de algoritmos (marcado "fuera de uso" en mar-2026). ✅ API CMSA de sensores responde |
| **Visit East Lothian** (Escocia) | Semáforo verde/ámbar/rojo de 11 estacionamientos costeros y "busca un lugar más tranquilo" | Sensores IoT, refresco cada 5 min, **el personal puede corregir a mano** | 📄 Guía de usuario v24.1 |
| **YouFlanders** (Bélgica) | Qué tan lleno está un atractivo + propone alternativa | Empezó con reportes de usuarios; **por falta de usuarios cambió a datos de antenas de Orange** | 📄 Prensa |
| **Kyoto Congestion Forecast** | Pronóstico de 5 niveles por zona, hasta ~2 meses antes | Datos de Wi-Fi/celular + clima | 📄 (el sitio no respondió desde aquí) |
| **Seoul Real-time City Data** | 4 niveles (여유/보통/약간 붐빔/붐빔) en ~121 puntos + pronóstico 12 h | Antenas KT/SKT, retraso ~15 min | 📄 + repo MCP verificado |
| **Moovit crowding** | Reportes de usuarios en 4 niveles, visibles 10 min, otros usuarios los confirman | Crowdsourcing | 📄 Comunicado de prensa |

**Lección para nosotros:** todos usan **pocos niveles** (3–5), **umbrales por lugar** y un **tiempo de vida** del dato. YouFlanders confirma el riesgo que ya anotamos en [[08 - Preguntas abiertas y riesgos]]: los reportes solos no alcanzan al inicio; hace falta la estimación base (Observatorio + INAH + clima) y los reportes la corrigen.

## 2. Lo que aprendimos de Check Barcelona

> [!info] Cómo se obtuvo
> El 2026-10-15 se descargó el JavaScript público de `checkbarcelona.com` (Angular, `main-es2015.d16a47dacd7f0eb29bc2.js`, 1.9 MB) y se leyó su lógica; se probaron 3 consultas GET a su API (`touristcms.com/api/`, cabecera `appDomain: checkbarcelona.com`), siguiendo [[08 - Preguntas abiertas y riesgos]].
>
> Lo que muestra el código: endpoints `elements/influx`, `beaches/influx`, `resources/influx`, `parkings/influx` y `elements/ticketing`, cada uno con `id`, `influx_current_level` e `influx_date_change`; escala 0–4 a color; caché en el navegador de 10 s para afluencia, 600 s para playas y 1 h para fichas; y la función `affluenceCardsByThematic`, que arma las alternativas.

Ideas que adoptamos o descartamos:

| Idea | Qué hacemos |
|---|---|
| Pocos niveles: sin dato · verde · amarillo · rojo | ✅ Igual: `sin_dato` · `verde` · `amarillo` · `rojo` |
| En playas, el color sale de un porcentaje de capacidad con cortes fijos (33 % y 66 %) | ❌ No conocemos la capacidad de cada lugar → umbrales por lugar (§3) |
| Las alternativas son lugares de **la misma temática que están en verde** | ✅ Encaja con RN_02; nosotros sumamos distancia (< 1 h) y **la razón** (RN_03), que ellos no muestran |
| Un solo backend para varias regiones, separado por dominio | ✅ Argumento de escalabilidad a otros estados ([[07 - Modelo de negocio y escalabilidad]]) |
| Datos de prueba locales cuando corre en la laptop | ✅ Ya es nuestro **modo escenario** (RN_11) |
| La API hoy responde vacía | Señal de que el proyecto quedó casi sin mantenimiento después de 2021 |

## 3. Algoritmo de referencia: Druktebeeld (Ámsterdam)

Publicado en el registro oficial de algoritmos del gobierno neerlandés:

- Cada lugar tiene **dos umbrales, bajo y alto**. Cada 15 min se compara la medición: debajo del bajo = verde, entre ambos = naranja, arriba del alto = rojo.
- Los umbrales se recalculan cada semanas/meses y dependen del lugar (ancho de calle, superficie, tipo).
- **Ninguna decisión es automática**: el equipo humano revisa reportes y ajusta.

→ **Se implementa** en `backend/turismo_core/semaforo.py`: umbrales `bajo`/`alto` por punto con los percentiles 60 y 85 de su historia relativa (INAH u Observatorio), acotados, y los cortes generales 0.9/1.3 cuando hay menos de 12 meses. Detalle en [[05 - Arquitectura y MCP]] y RN_01 de [[10 - Análisis FIS]].

## 4. Fusión con reportes de turistas (estilo Waze/Moovit)

Moovit muestra un reporte 10 minutos y deja que otros lo confirmen. Nuestra regla ya existía en [[05 - Arquitectura y MCP]] (caducidad exponencial de 45 min, la estimación vale ~2 reportes, "confirmado por turistas" con 3 válidos en 1 h) y se implementa en `backend/turismo_core/reportes.py`. Lo nuevo: cada nivel reportado se traduce con **los umbrales del punto** (vacío = `bajo` × 0.5, normal = punto medio, lleno = `alto` × 1.5), así "lleno" siempre empuja a rojo, sea el punto estable o estacional.

Además, como en East Lothian, el panel puede **fijar el color** de un punto con motivo y hora de fin (`AjusteManual` en `semaforo.py`, RN_16). `backend/turismo_core/estado.py` juntará todo: estimación + reportes + ajuste → color, confianza y motivo.

## 5. Servidores MCP de turismo y ciudad que ya existen

| Repo | Lenguaje | Licencia | Último push | Por qué sirve |
|---|---|---|---|---|
| [whchoi98/seoul-opendata-mcp](https://github.com/whchoi98/seoul-opendata-mcp) | TypeScript | MIT | 2026-08-17 | El más parecido: `get_population` (nivel de congestión), `get_city_snapshot` (población + clima + tráfico + eventos en una llamada), `search_place` (texto libre → punto oficial) |
| [harimkang/mcp-korea-tourism-api](https://github.com/harimkang/mcp-korea-tourism-api) | Python | MIT | 2025-08-12 | Plantilla en Python para envolver una API oficial de turismo |
| BayernCloud Tourismus MCP | Node | — | — | POI, eventos y rutas de Baviera; prueba de concepto |
| BestTime MCP (`besttime.app/mcp`) | Servicio | Comercial | vigente | Afluencia pronosticada/en vivo de lugares públicos; OAuth + HTTP. Útil para validar nuestra estimación si cubre Cholula |

→ Tomamos la forma del servidor de Seúl: se agregaron `buscar_punto`, `foto_destino` y `reportar` a las tools de [[05 - Arquitectura y MCP]], y `estado_punto` ahora devuelve también los umbrales y el ajuste manual.

## 6. Fuentes de datos en vivo verificadas

| Fuente | Estado | Uso posible |
|---|---|---|
| API CMSA Ámsterdam `api.data.amsterdam.nl/v1/cmsa/` | ✅ responde, abierta, OpenAPI 3 | Ejemplo de cómo publicar sensores como datos abiertos |
| `livepopulartimes` (PyPI 1.3, 2021) | ⚠️ sin mantenimiento, scraping de Google | **No usar**: frágil y viola términos de Google |
| BestTime API | 📄 de pago con prueba | Opcional para validar |
| DataTur / Sectur | 📄 mensual, sin API en vivo | Ya lo cubre el Observatorio |

No se encontró en México ninguna app pública con semáforo de afluencia en vivo para Pueblos Mágicos o zonas INAH; la app "Visit México" del Mundial 2026 no reporta aforo. **Eso es argumento de pitch:** el hueco existe aquí aunque el modelo ya esté probado en Barcelona, Ámsterdam, Seúl y Kioto ([[09 - Guion de pitch]]).

## 7. Fuentes

- Check Barcelona: [Turisme de Barcelona](https://professional.barcelonaturisme.com/en/blog/check-barcelona-the-app-to-improve-the-visitorflow-management), [Eurecat](https://eurecat.org/en/new-app-to-better-manage-visitor-flows-in-tourist-areas/), [destinosinteligentes.es](https://www.destinosinteligentes.es/en/bbpp/app-check-barcelona-para-la-gestion-de-aforos-en-los-recursos-turisticos-de-la-ciudad)
- Druktebeeld: [Algoritmeregister](https://algoritmes.overheid.nl/en/algoritme/16268148), [API CMSA](https://apis.developer.overheid.nl/apis/Ec3sfXeHg)
- East Lothian: [Council](https://www.eastlothian.gov.uk/news/article/13828/new_visit_east_lothian_app), [Guía de usuario](https://edina.ac.uk/docs/VEL_app_user_guide.pdf)
- YouFlanders: [Orange Business](https://business.orange.be/en/node/50246)
- Kioto: [Kyoto Travel Congestion Forecast](https://kyoto.travel/en/info/maps-apps/congestion.html)
- Seúl: [Glama, seoul-opendata-mcp](https://glama.ai/mcp/servers/bjikncnbyb), [smartcity.go.kr](https://smartcity.go.kr/en/2023/06/23/%ec%a7%80%ea%b8%88-%ec%84%9c%ec%9a%b8%ec%9d%80-%ec%84%9c%ec%9a%b8%ec%8b%9c-%ec%a3%bc%ec%9a%94-%eb%aa%85%ec%86%8c-113%ea%b3%b3%ec%9d%98-%ec%8b%a4%ec%8b%9c%ea%b0%84-%ec%a0%95%eb%b3%b4-%ed%95%9c/)
- Moovit: [comunicado](https://moovit.com/press-releases/moovit-crowding-report/)
- Venecia: [Il Post](https://www.ilpost.it/2022/06/10/venezia-smart-control-room/)
- BestTime: [besttime.app/mcp](https://besttime.app/mcp)
- MCP: [BayernTourismus en mcp.so](https://mcp.so/servers/mcp-server-bayerntourismus)
- México: [Visit México Mundial](https://playersoflife.com/nacional/copa-del-mundo-visit-mexico-asi-sera-la-app-gratuita-para-turistas-durante-el-mundial-2026/), [Excélsior](https://www.excelsior.com.mx/nacional/turismo-cultural-mexico-crece)
