---
title: "04b - Plantilla ficha de fuente de datos"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-13
---

# 🧾 Plantilla — Ficha de fuente de datos

> [!tip] Cómo usarla
> Copia esta plantilla una vez por fuente usada. Responde lo que pide el criterio de datos (20%): **identificación, pertinencia, calidad y aprovechamiento** ([[01 - Convocatoria y reglas]]). Inventario general en [[04 - Fuentes de datos]].
> En la v2 hay tres tipos de fuente: **oficial** (archivo histórico), **en vivo** (API) y **generada por la app** (reportes). Llena solo las secciones que apliquen a cada tipo.

## 🆔 Identificación

| Campo | Valor |
|---|---|
| Nombre | |
| Tipo | oficial / en vivo / generada por la app |
| URL | |
| Institución o proveedor | |
| Fecha de última actualización (o de descarga) | |
| Licencia y condiciones de uso | (¿pide crédito? ¿solo uso no comercial?) |
| Formato | (PDF, CSV, HTML, JSON de API…) |
| Responsable en el equipo | |

## 📥 Cómo se obtuvo
(Descarga masiva, extracción de PDF, API o captura a mano. Fecha de descarga y pasos para reproducirla. Nombre del script que la carga.)

## 📡 Solo para fuentes en vivo (API)

| Campo | Valor |
|---|---|
| ¿Pide clave? ¿Pide tarjeta? | (la clave va en `.env`, nunca en el código) |
| Límite gratuito | (consultas por día / minuto) |
| Cada cuánto la consultamos | |
| Consultas estimadas por día | |
| Qué pasa si se cae | (se usa la última fila guardada y se avisa) |
| Tabla donde se guarda | (`obs_clima`, `obs_trafico`…) |

## 🧠 ¿Entra a ChromaDB?
(Sí o no. Si entra: colección, cómo se corta en fragmentos y qué metadatos lleva. Ver [[05b - ChromaDB y RAG]].)

## 🎯 Para qué sirve en el proyecto (pertinencia)
(Qué componente alimenta — afluencia estimada, reportes, semáforo, recomendador, clima, traslados, panel, asistente o pronóstico ([[03 - Ideas y alternativas]]) — y qué pregunta responde.)

## 📊 Variables usadas

| Variable | Descripción | Tipo | Uso |
|---|---|---|---|
| | | | |

## 🧹 Limpieza aplicada
- 

## ✅ Validación
(Qué revisión se hace en `validar_bd.py`: totales, rangos, duplicados…)

## ⚠️ Calidad y limitaciones
- Actualidad:
- Cobertura:
- Sesgos o huecos conocidos:

## 🔗 Relacionado
- [[04 - Fuentes de datos]]

---
#hackathon
