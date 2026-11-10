# Herramientas

## Qué es

Scripts de apoyo para el equipo. No forman parte de la app en ejecución: el backend y el frontend nunca los importan.

## Para qué sirve

Hoy tiene una sola herramienta, que carga la **base de desarrollo**: el proyecto `rumbo-dev` de Supabase, que comparte todo el equipo. Con ella, cualquier integrante puede correr y modificar la interfaz sin `backend/data/raw/`, sin claves de ORS o TomTom y sin Ollama. Solo necesita `backend/.env` con la URL de `rumbo-dev` ([INSTALACION.md](../INSTALACION.md#31-tu-backendenv)).

La demo, la presentación y las pruebas con usuarios se hacen con `rumbo-demo`, cargada con el [pipeline del backend](../backend/README.md#scripts-pipeline-de-datos).

## Qué contiene

```text
herramientas/
├── README.md          # este archivo
└── bd_desarrollo.py   # carga o recarga rumbo-dev
```

## Cómo está construido

`bd_desarrollo.py` reutiliza el pipeline del backend, sin duplicar su lógica:

| Paso | Qué hace                                                      | Con qué                                  |
| ---- | ------------------------------------------------------------- | ---------------------------------------- |
| 1    | Carga catálogo, eventos, calendario y datos procesados        | `backend/scripts/cargar_bd.py`           |
| 2    | Calcula traslados aproximados entre todos los pares de lugares | `traslados_aproximados()`, en este script |
| 3    | Calcula umbrales y afluencia estimada de los próximos días    | `backend/scripts/calcular_afluencia.py`  |

### Qué datos resultan

| Dato                                              | Resultado                                                    |
| ------------------------------------------------- | ------------------------------------------------------------ |
| Lugares, horarios, eventos y datos oficiales      | Reales, tomados de lo que ya está en git                     |
| Afluencia estimada                                | Calculada con el mismo modelo, sin efecto de clima           |
| Traslados                                         | **Aproximados**, no oficiales                                |
| Clima y tráfico                                   | Vacíos: se comportan como "sin lluvia" y "sin tráfico"       |
| Asistente                                         | Responde 503 si no hay Ollama                                |

Los traslados se calculan con la distancia en línea recta y estas constantes:

| Constante            | Valor   | Significado                                  |
| -------------------- | ------- | -------------------------------------------- |
| `FACTOR_CALLE`       | `1.35`  | La ruta en coche es más larga que la línea recta |
| `FACTOR_PIE`         | `1.25`  | Lo mismo, caminando                          |
| `KMH_COCHE`          | `24`    | Velocidad promedio en ciudad, sin tráfico    |
| `KMH_PIE`            | `4.5`   | Velocidad caminando                          |
| `MINUTOS_ESTACIONAR` | `4`     | Tiempo fijo que se suma a cada viaje en coche |

## Cómo se usa

Se corre desde `backend/`, porque usa su entorno de Python:

```bash
cd backend
uv run python ../herramientas/bd_desarrollo.py            # 14 días de afluencia
uv run python ../herramientas/bd_desarrollo.py --dias 7   # otro número de días
```

Escribe en la base de `DATABASE_URL` de `backend/.env`. Después, se levanta el backend como siempre:

```bash
PUEBLA_TAREAS=0 uv run uvicorn app.main:app --reload --port 8000
```

### Cuándo regenerarla

- Cuando `/api/salud` diga `"afluencia_cubre_esta_hora": false`, porque la afluencia se venció.
- Cuando cambie el catálogo, los eventos o los datos procesados.

### A tomar en cuenta

- **Protege la base de la demo:** si `backend/.env` dice `RUMBO_AMBIENTE=demo`, el script se detiene.
- **Conserva lo generado por la app:** al recargar, las sesiones y los reportes existentes se quedan en la base.
- **Todo o nada:** la carga va en una sola transacción; si falla a la mitad, la base queda como estaba.
- **Base compartida:** recargarla afecta a todo el equipo; no borra sesiones ni reportes.
