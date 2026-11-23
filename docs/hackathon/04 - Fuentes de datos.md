---
title: "04 - Fuentes de datos"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-14
---

# 🗃️ Fuentes de datos

> [!info] Criterio con mayor peso
> "Identificación, pertinencia, calidad y aprovechamiento de los datos" vale **20%** de la rúbrica ([[01 - Convocatoria y reglas]]). Cada fuente lleva su ficha: [[04b - Plantilla ficha de fuente de datos]].
> Las fuentes en vivo y de eventos se buscaron en la red el **2026-10-13**. Lo marcado **(verificar)** se confirma el miércoles.

> [!tip] La idea de fondo
> No se trata solo de juntar los datos que nos dan. Construimos **una base de datos propia** con cuatro tipos de dato:
> 1. **Oficiales**, depurados: la base histórica.
> 2. **En vivo**, guardados como serie de tiempo, no consultados y tirados.
> 3. **Generados por la app**: reportes y redirecciones, que **nadie más tiene**.
> 4. **Derivados**: afluencia estimada y semáforo, recalculados con todo lo anterior.
>
> Con el tiempo, el tipo 3 es el más valioso para el gobierno. El esquema de la base está en [[05 - Arquitectura y MCP]].

## 1. 🏛️ Fuentes oficiales (capa estructural)

### 1.1 Observatorio Turístico de Puebla — `DatosOT a junio 2026 glosario.pdf` ✅

| Campo | Detalle |
|---|---|
| Institución | Secretaría de Desarrollo Turístico del Estado de Puebla (Observatorio Turístico). Los indicadores hoteleros vienen de DATATUR |
| Dónde | https://sectur.puebla.gob.mx/observatorioturistico/ (sección de estadísticas) |
| Formato | PDF de 29 páginas: una tabla de ~2,000 filas + glosario al final |
| Cobertura | **20 centros turísticos** + "Estado" + "Resto del Estado"; **mensual de enero 2017 a junio 2026** |
| Indicadores (9) | Cuartos disponibles, cuartos ocupados, llegadas de turistas, turistas noche, porcentaje de ocupación, estadía promedio, densidad de ocupación, afluencia de visitantes, derrama económica (pesos) |
| Extracción | Verificada con `pdfplumber`: ~20,950 valores en formato largo |
| Uso en la v2 | Afluencia "normal" de cada destino por mes (base de la estimación); **gasto por visitante** (derrama ÷ llegadas) para medir la derrama redistribuida; pronóstico estructural; evidencia del problema |

Centros: Acatzingo, Atlixco, Cd. Puebla, Chignahuapan, Cholula, Cuetzalan, Huauchinango, Huejotzingo, Izúcar de Matamoros, Pahuatlán, San Andrés Cholula, San Martín Texmelucan, San Pedro Cholula, Tehuacán, Tepeaca, Tetela de Ocampo, Teziutlán, Tlatlauquitepec, Xicotepec, Zacatlán.

### 1.2 INAH — `reporte_detallado_202321.xls` a `reporte_detallado_202621.xls` ✅

| Campo | Detalle |
|---|---|
| Institución | Instituto Nacional de Antropología e Historia |
| Dónde | https://www.estadisticas.inah.gob.mx/ (reporte detallado, entidad Puebla) |
| Formato | Aunque la extensión es `.xls`, el archivo es una **tabla HTML**; se lee con `pandas.read_html`, tabla 3 |
| Cobertura | **19 recintos** de Puebla; mensual; 2023–2025 completos y 2026 de enero a septiembre |
| Variables | Recinto, año, mes, tipo de visitante, número de visitas, nacionalidad (nacional / extranjeros) |
| Uso en la v2 | Afluencia base **por punto** para las zonas arqueológicas y museos INAH de la zona piloto; evidencia de concentración |

### 1.3 DENUE (INEGI) — `denue_21_csv.zip` ✅

| Campo | Detalle |
|---|---|
| Dónde | Descarga directa: https://www.inegi.org.mx/contenidos/masiva/denue/denue_21_csv.zip (sin token) |
| Formato | ZIP con CSV, ~37 MB; mayo 2026 |
| Cobertura | Todos los establecimientos del estado con coordenadas, actividad (SCIAN) y tamaño |
| Uso en la v2 | **Catálogo de puntos** (museos, sitios) y oferta alrededor de cada punto (dónde comer o dormir en la alternativa) |
| Opcional | **API del DENUE** (https://www.inegi.org.mx/servicios/api_denue.html): búsqueda por coordenada + radio en metros, con **token gratuito**. Para "¿qué hay cerca de mí?" sin cargar el CSV completo |

### 1.4 Fuentes para completar el catálogo y los horarios

| Fuente | Qué da | Acceso | Uso | Estado |
|---|---|---|---|---|
| **SIC, Secretaría de Cultura** (https://sic.cultura.gob.mx/datos.php) | Directorio de museos y espacios culturales | CSV abierto; se reutiliza **dando crédito** al SIC y a la Secretaría de Cultura | Completar museos de la zona piloto (nombre, dirección, ubicación) | ⏳ Descargar |
| **Museos del Estado de Puebla** (portal `datos.puebla.gob.mx`, espejo en datamx.io) | Costos y horarios de los museos que opera el gobierno estatal | CSV | Horarios y precios de museos estatales | ⏳ Verificar fecha |
| **INAH, ficha de cada lugar** (https://lugares.inah.gob.mx) | Horario y costo oficiales | Web; se capturan a mano (son pocos) | Horarios de los recintos INAH de la zona | ⏳ Capturar. En otras páginas los horarios de Cholula **no coinciden**, por eso solo se toma el oficial |
| **OpenStreetMap** vía Overpass API | Puntos `tourism=museum`, `tourism=attraction`, horarios `opening_hours` | Servidor público, uso justo: cachear y no saturar | Completar catálogo y horarios. **Una descarga**, no se consulta en vivo | ⏳ |
| **Atractivos turísticos de Puebla** (datos.puebla.gob.mx, CSV) | Lista de atractivos | Última actualización **2018** | Solo para cruzar y validar el catálogo | ⚠️ Viejo |
| **Boletines SEI Puebla** (https://sei.puebla.gob.mx/docs/boletines/) | Ocupación y cifras trimestrales con texto oficial | PDF | Validar nuestras cifras y citas del pitch | ✅ Consultado |
| **DATATUR, monitoreo hotelero** | Solo Cd. Puebla | Excel | Validar la serie de la capital | ⚠️ Apoyo |

## 2. 📡 Fuentes en vivo (capa en vivo)

| Fuente | Qué da | Acceso y límites (verificado 2026-10-13) | Cómo la usamos |
|---|---|---|---|
| **Open-Meteo** (`https://api.open-meteo.com/v1/forecast`) | Pronóstico por hora: `temperature_2m`, `precipitation_probability`, `precipitation`, `weather_code`; hasta 16 días | **Sin clave**, gratis para uso no comercial. Piden contactarlos si se pasa de 10,000 consultas al día. Datos con licencia **CC BY 4.0** (hay que dar crédito) | **Una sola consulta** con todas las coordenadas separadas por coma, cada 60 min, con `timezone=America/Mexico_City` |
| **TomTom Traffic Flow** (Flow Segment Data) | Velocidad actual contra velocidad sin tráfico en un tramo | Plan **Freemium sin tarjeta**: 2,500 consultas no-tile al día. Al pasarse, **bloquea** (no cobra). Verificar en la página oficial al sacar la clave | ~10 tramos de acceso clave (p. ej. Puebla–Cholula, Puebla–Atlixco) cada 15–30 min, de 8:00 a 20:00 ≈ 240–480 consultas/día. Factor = vel. libre ÷ vel. actual |
| **OpenRouteService** (Matrix API) | Tiempo y distancia entre todos los puntos | **Clave gratuita**. Plan estándar: 500 matrices y 2,000 rutas al día; hasta 3,500 pares por matriz | **Una sola vez**: matriz de 25 × 25 = 625 pares en una consulta. Se guarda en la BD; en vivo solo se multiplica por el factor de tráfico |
| **OSRM** (OpenStreetMap) | Rutas sin clave | Servidor público de demostración, uso justo | Respaldo de OpenRouteService |

## 3. 🎉 Eventos y calendario (se cargan a mano, siempre con fuente)

| Qué | Fuente | Ejemplo (verificar en fuente oficial) |
|---|---|---|
| Días festivos y puentes | Ley Federal del Trabajo, art. 74 (confirmar en DOF / STPS) | Puente del 14 al 16 de noviembre de 2026 (lunes 16, Revolución) |
| Festivales y temporadas | Sectur Puebla (`sectur.puebla.gob.mx`), `visitpuebla.mx`, ayuntamientos | **Valle de Catrinas**, Atlixco: del 2 de octubre al 9 de noviembre de 2026 (según prensa) · **Catrinia**, Atlixco: del 2 de octubre al 1 de noviembre, de 14:00 a 23:00 (Ayuntamiento, citado en prensa) |
| Cartelera de Día de Muertos | Sectur Puebla, cuando la publique (en 2025 fueron más de 45 eventos) | Pendiente de 2026 |
| Eventos privados | Ticketmaster Discovery API (clave gratuita) | Cobertura en Puebla **por verificar**; fase 2 |

> [!warning] Lo que NO vamos a usar
> - **Google Maps "horas pico"**: no tiene API pública para eso y hacer scraping viola sus términos.
> - **APIs de pago o que piden tarjeta** (Google Routes, etc.): va contra la regla de costo cero.
> - **Páginas turísticas no oficiales** como fuente principal: solo sirven de pista; el dato se confirma en la fuente oficial.

> [!important] La afluencia en vivo no existe como fuente pública
> Ninguna fuente pública dice cuánta gente hay ahorita en un museo. Por eso:
> 1. La **estimamos** con datos oficiales y el contexto del momento.
> 2. La **corregimos** con los reportes de los turistas.
> 3. Proponemos como fase 2 conectar el **boletaje del INAH** o contadores en las entradas, datos que el gobierno ya tiene.
>
> Cómo se calcula y cómo se fusiona: [[05 - Arquitectura y MCP]].

## 4. 🏷️ Filtros SCIAN para DENUE

| Código | Actividad | Uso | Estado |
|---|---|---|---|
| 7121 | Museos, sitios históricos y similares | Puntos del catálogo | Verificar contra el catálogo SCIAN |
| 722 | Alimentos y bebidas | Oferta cerca de cada punto | Verificar |
| 721 | Hospedaje | Oferta cerca de cada punto | Verificar |
| 5615 | Agencias de viajes y reservaciones | Opcional | Verificar |

## 5. 🧹 Depuración por fuente

| Fuente | Problema conocido | Cómo se limpia | Cómo se valida |
|---|---|---|---|
| Observatorio (PDF) | Acentos corruptos (`Zacatl?n`), nombres truncados, nombres de indicador encimados; "Cholula" posiblemente = San Pedro + San Andrés | Tabla de reemplazo de caracteres; `difflib` para emparejar indicadores con el glosario; regla explícita para "Cholula" | Suma de destinos contra la fila "Estado" y contra los boletines SEI; ocupación entre 0 y 100% |
| Observatorio | La pandemia (2020–2021) distorsiona el promedio | Marca `es_pandemia`; se excluye de la base de afluencia | Comparar contra un pronóstico ingenuo ("igual que el año pasado") |
| INAH (`.xls`) | Es HTML; los nombres de recinto no coinciden con el catálogo | `read_html` tabla 3; tabla de equivalencias recinto INAH → punto, hecha a mano | Total anual = suma de meses; ningún mes negativo |
| DENUE | 37 MB, todo el estado, muchos giros | Filtrar municipios de la zona piloto y SCIAN de la sección 4 | Revisar a mano los 15–25 puntos del catálogo (`verificado = 1`) |
| SIC / OSM / DENUE | El mismo museo aparece en tres fuentes con nombre y coordenada distintos | **Deduplicar**: mismo punto si están a < 150 m y el nombre se parece (`difflib` > 0.8). Se queda la coordenada del DENUE y el horario oficial | Que no haya dos puntos a < 50 m con el mismo tipo |
| APIs en vivo | Caídas, valores vacíos, respuestas atrasadas | Si falla, se usa la última fila guardada y se avisa "dato de hace X min" | Rango válido (lluvia 0–100%, velocidad > 0) |
| Eventos | Fechas distintas según la página | Solo entra con URL oficial; si es prensa, `verificado = 0` y no se usa en la demo | Revisión a mano |
| Reportes de turistas | Spam, bromas, reportes desde lejos | Filtros antispam ([[05 - Arquitectura y MCP]]) | Peso y estado de cada reporte |

## 5b. 🧠 Qué entra a ChromaDB (base de conocimiento del RAG)

Por recomendación del asesor (2026-10-14), además de SQLite hay una base de **textos** en ChromaDB ([[05b - ChromaDB y RAG]]). Solo entra lo **depurado y verificado**:

| Colección | Sale de | Depuración extra |
|---|---|---|
| `puntos` | Catálogo de la zona piloto + **ficha de texto escrita por el equipo** (qué es, para quién, techado o no, qué hay cerca, horario oficial, costo) | Solo puntos con `verificado = 1`; horario solo de fuente oficial |
| `eventos` | Calendario curado (sección 3) | Solo con URL oficial; fechas como enteros `YYYYMMDD` |
| `conocimiento` | Boletines SEI (PDF), glosario del Observatorio, fichas de fuentes ([[04b - Plantilla ficha de fuente de datos]]) y de modelos | Fragmentos de ~800 caracteres cortados por párrafo, con página y fecha; nada del CSV de 2018 |
| `bitacora` | **Resumen diario de los reportes** (generado desde SQLite, sin LLM) | Solo reportes con estado `valido`; nunca reportes individuales |

## 6. 🧭 Cruce entre fuentes

- **Destino ↔ municipio:** cada centro del Observatorio se asigna a su municipio con la clave del propio DENUE, no escrita de memoria.
- **Punto ↔ destino:** cada atractivo de la zona piloto pertenece a un destino del Observatorio.
- **Punto ↔ INAH / DENUE / OSM / SIC:** tabla de equivalencias hecha a mano (`id_inah`, `clee_denue`, `osm_id`).
- **Punto ↔ clima:** por coordenada del punto.

## 7. 🔄 Pipeline (un script por paso, en orden)

| Paso | Script | Entrada | Salida |
|---|---|---|---|
| 1 | `copiar_datos.py` | Archivos en Downloads | `data/raw/` (con fecha y huella de cada archivo) |
| 2 | `extraer_observatorio.py` | PDF | Tabla limpia (destino, periodo, indicador, valor) |
| 3 | `limpiar_inah.py` | 4 reportes HTML | Tabla limpia (recinto, periodo, tipo, nacionalidad, visitas) |
| 4 | `filtrar_denue.py` | ZIP | Establecimientos de la zona piloto con SCIAN turístico |
| 5 | `armar_catalogo.py` | DENUE + SIC + OSM + INAH | Catálogo de 15–25 puntos, deduplicado y revisado a mano |
| 6 | `calcular_traslados.py` | Catálogo | Matriz de traslados (1 consulta a OpenRouteService) |
| 7 | `cargar_bd.py` | Todo lo anterior + eventos + calendario | `puebla.db` |
| 8 | `validar_bd.py` | `puebla.db` | Todas las revisiones de la sección 5; si una falla, se detiene |
| 9 | `indexar_chroma.py` | `puebla.db` + boletines + fichas | Colecciones de ChromaDB (sección 5b), con `upsert` e IDs fijos |
| 10 | `resumir_bitacora.py` | Reportes del día | Colección `bitacora` (corre cada noche) |

## 8. ✅ Criterios de calidad

| Criterio | Oficiales | En vivo | Reportes |
|---|---|---|---|
| Actualidad | Observatorio a jun 2026, INAH a sep 2026, DENUE mayo 2026 | Minutos | Segundos |
| Cobertura | Estado (20 destinos) | Zona piloto | Donde haya usuarios |
| Licencia | Datos públicos de gobierno (verificar condiciones) | Open-Meteo CC BY 4.0; TomTom y ORS según sus términos gratuitos | Propios, anónimos |
| Trazabilidad | Script reproducible + `fuente_id` en cada fila | Cada consulta se guarda con su hora | Cada reporte con peso, estado y motivo |

## 📎 Fuentes consultadas (2026-10-13)

- Open-Meteo: <https://open-meteo.com/en/docs> · <https://open-meteo.com/>
- TomTom, precios: <https://developer.tomtom.com/pricing> · <https://docs.tomtom.com/pricing>
- OpenRouteService: <https://openrouteservice.org/plans/> · <https://openrouteservice.org/restrictions/>
- Overpass API: <https://wiki.openstreetmap.org/wiki/Overpass_API>
- API del DENUE: <https://www.inegi.org.mx/servicios/api_denue.html>
- SIC, datos abiertos: <https://sic.cultura.gob.mx/datos.php>
- Atractivos turísticos de Puebla (CSV 2018): <https://datamx.io/dataset/atractivos-turisticos/resource/1f299a6b-74c3-4bf1-b0ca-3517ee0bbb64>
- Valle de Catrinas 2026: <https://www.cronica.com.mx/estados/2026/10/05/valle-de-catrinas-en-atlixco-2026-precios-fechas-y-donde-visitar-la-exposicion-de-dia-de-muertos/>
- Días festivos 2026: <https://expansion.mx/tendencias/2026/01/01/dias-festivos-2026>

## 🔗 Relacionado
- [[00 - Índice]]
- [[04b - Plantilla ficha de fuente de datos]]
- [[05 - Arquitectura y MCP]]

---
#hackathon
