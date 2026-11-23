# Catálogo de la zona piloto

## Qué es

La lista curada de los **23 lugares turísticos** que RUMBO conoce, en Puebla capital, Cholula, Atlixco y otros destinos cercanos. Angel empezó el borrador y Axel lo verificó y lo mantiene.

## Para qué sirve

Es la fuente de verdad de los lugares. De aquí salen:

- La tabla `punto` de SQLite, cargada por [`backend/scripts/cargar_bd.py`](../backend/scripts/cargar_bd.py).
- Las fichas que indexa ChromaDB para el asistente.
- Los datos que muestran el mapa, la lista y la ficha de cada lugar.
- El horario, que decide si un lugar sale como cerrado, y el campo `interior`, que indica si conviene cuando llueve.

Los eventos de temporada, como Valle de Catrinas, **no son lugares**: van en [`backend/data/eventos.csv`](../backend/data/eventos.csv) y de ahí pasan a la tabla `evento`.

## Qué contiene

```text
catalogo/
├── README.md               # este archivo
└── puntos_zona_piloto.csv  # un renglón por lugar (UTF-8, separado por comas)
```

### Estado de los datos

Revisado sobre el CSV el 8 de noviembre de 2026.

| Dato         | Estado                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------- |
| Lugares      | 23, todos con `verificado=1`                                                              |
| Destinos     | Cd. Puebla (15), San Andrés Cholula (4), Atlixco (2), San Pedro Cholula (1), Huejotzingo (1) |
| Coordenadas  | 15 del DENUE, 7 de OpenStreetMap y 1 de Google Maps (Barrio de Xanenetla)                 |
| Horario      | Los 23 lo tienen                                                                          |
| Costo        | 14 con valor; 9 vacíos                                                                    |
| Recintos INAH | 3                                                                                        |
| Techados     | 13                                                                                        |

### Columnas

| Columna             | Qué es                                                                    | Ejemplo                                      |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `id`                | Identificador corto y único. Se guarda como `punto.clave` y nombra las fotos del frontend | `zona_arq_cholula`           |
| `nombre`            | Nombre del lugar                                                          | Zona Arqueológica de Cholula (Gran Pirámide) |
| `destino`           | Centro turístico del Observatorio al que pertenece                        | San Andrés Cholula                           |
| `municipio`         | Municipio, para cruzar con DENUE e INEGI                                  | San Andrés Cholula                           |
| `tipo`              | `museo`, `templo`, `zona_arqueologica`, `mercado`, `calle`, `barrio`, `mirador`, `parque`, `pueblo_magico` o `plaza` | `zona_arqueologica` |
| `categorias`        | Intereses separados por coma; los usa el recomendador                     | `historia,cultura`                           |
| `interior`          | `1` = techado; `0` = al aire libre                                        | `0`                                          |
| `lat`, `lon`        | Coordenadas WGS84                                                         | `19.0576`, `-98.3017`                        |
| `horario`           | JSON por día. Un día ausente está cerrado; puede tener varios tramos separados por coma, y `00:00-24:00` significa abierto todo el día | `{"mar": "09:00-13:30,15:30-18:00"}` |
| `costo_mxn`         | Entrada en pesos. `0` = gratis; vacío = sin dato o sin cobro de entrada, como calles y plazas | `80`                 |
| `duracion_sugerida` | Tiempo sugerido de visita                                                 | `1-2 h`                                      |
| `inah`              | `1` = recinto operado por el INAH, que se cruza con sus estadísticas      | `1`                                          |
| `ficha`             | Descripción de 2 o 3 líneas para ChromaDB y para la ficha de la app       |                                              |
| `fuente`            | De dónde salen la coordenada, el horario y el costo                       |                                              |
| `verificado`        | `1` = revisado a mano por el equipo                                       | `1`                                          |
| `clee_denue`        | Clave del establecimiento en el DENUE, si la coordenada salió de ahí      | `21119813210000951000000000U9`               |
| `osm_id`            | Objeto de OpenStreetMap, si la coordenada salió de ahí                    | `way/157402817`                              |

## Cómo se usa

### Agregar o corregir un lugar

1. **Coordenadas:** copia la latitud y longitud de la entrada del lugar, no del centro del municipio. Se prefiere el DENUE; [`verificar_catalogo.py`](../backend/scripts/verificar_catalogo.py) ayuda a buscar candidatos en DENUE y OpenStreetMap.
2. **Horario y costo:** en recintos del INAH usa `https://lugares.inah.gob.mx`; en el resto, la página oficial. Si dos fuentes no coinciden, toma la oficial.
3. **Ficha:** revisa que lo que dice sea cierto y evita superlativos sin fuente.
4. Anota la fuente en `fuente` y cambia `verificado` a `1`.
5. Recarga la base. Desde `backend/`:

   ```bash
   # Base real
   uv run python -m scripts.pipeline data/raw

   # Base de desarrollo
   uv run python ../herramientas/bd_desarrollo.py
   ```

### Qué más cambiar

| Si cambias…              | También actualiza…                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| Un lugar nuevo           | Sus fotos en `frontend/public/fotos/`, su crédito en `frontend/src/data/fotos.js` y su ficha en inglés |
| La `ficha` de un lugar   | `frontend/src/i18n/fichas.en.js`, y vuelve a indexar ChromaDB                                         |
| El orden de los renglones | No lo cambies: `cargar_bd.py` asigna el id de cada lugar por su posición, y los reportes guardados dependen de él |
| Un recinto del INAH      | `backend/data/equivalencias_inah.csv`                                                                 |

## Atribución

Las coordenadas de OpenStreetMap son datos **© colaboradores de OpenStreetMap, licencia ODbL**, y se atribuyen en la pantalla "Acerca de", según la regla RN_13 de [`docs/hackathon/10 - Análisis FIS.md`](../docs/hackathon/10%20-%20An%C3%A1lisis%20FIS.md).
