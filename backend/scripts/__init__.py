"""Pipeline de datos (docs/04 §7). Se corre desde ``backend/``: ``uv run python -m scripts.pipeline``."""

from turismo_core.bd import DATA, REPO

RAW = DATA / "raw"
PROCESSED = DATA / "processed"
CATALOGO = REPO / "catalogo" / "puntos_zona_piloto.csv"
CATALOGO_AMPLIADO = REPO / "catalogo" / "puntos_ampliados.csv"   # generado por scripts.ampliar_catalogo
EQUIVALENCIAS_INAH = DATA / "equivalencias_inah.csv"
EVENTOS = DATA / "eventos.csv"   # calendario curado a mano, siempre con fuente (docs/04 §3)
MANIFIESTO = DATA / "manifiesto_raw.csv"
OSM_AMPLIADO = RAW / "osm_ampliado.json"   # respuesta de Overpass, reutilizada entre corridas

ARCHIVO_OBSERVATORIO = "DatosOT a junio 2026 glosario.md"   # tabla del PDF convertida a Markdown
PDF_OBSERVATORIO = "DatosOT a junio 2026 glosario.pdf"      # original; rellena filas que la conversión perdió
ARCHIVOS_INAH = [f"reporte_detallado_{anio}21.xls" for anio in (2023, 2024, 2025, 2026)]
ARCHIVO_DENUE = "denue_21_csv.zip"
CSV_DENUE = "conjunto_de_datos/denue_inegi_21_.csv"
