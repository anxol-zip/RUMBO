---
title: "01 - Convocatoria y reglas"
tags: [hackathon, puebla, turismo, mcp]
status: propuesta-v2
created: 2026-10-11
updated: 2026-10-13
---

# 📜 Convocatoria y reglas

## 📅 Datos generales

| Campo | Detalle |
|---|---|
| Nombre | Hackathon "Puebla Turística 360°: Datos que transforman experiencias" |
| Fechas de la convocatoria | 15 al 17 de octubre de 2026, 11:00 a 17:00 |
| Sede | Centro Expositor, Sala de Rueda de Prensa |
| Organizan | SECIHTI Puebla y la Secretaría de Desarrollo Turístico del Estado |
| IES participantes (Intelligentia) | BUAP, UTP, UVP, UPMP, IBERO Puebla, UPAEP |
| Participantes | Abierto a estudiantes de cualquier institución |

## 🏁 Evaluación final (confirmado por los organizadores, 2026-10-13)

| Campo | Detalle |
|---|---|
| Cuándo | **Viernes 16 de octubre de 2026, 12:00 a 15:00** |
| Formato | **Stand**: mesa con mampara por equipo. Llegar con anticipación para montar. Hay lunch para los participantes |
| Cómo se evalúa | Los evaluadores asignados pasan por el stand entre 12:00 y 15:00. Hay que exponer **una o más veces** |
| Duración del pitch | **No hay tiempo designado; se recomiendan ~5 min** |
| Material | Libre: pantallas, computadoras, carteles, etc. |
| Prototipo | **Llega ya hecho.** "Solamente es llegar y presentar" |

> [!tip] Lo que significa para la v2
> Como el evaluador **pasa por el stand**, la mejor demo es que **use la app en su propio celular** (QR en la mampara) y vea cómo su reporte cambia el panel de gobierno en la laptop. Ver [[02 - Problema y propuesta]].

## 🎯 Reto central
Usar **datos abiertos, IA y ciencia de datos** para mejorar la experiencia del visitante, optimizar flujos turísticos y generar mayor impacto económico y social en Puebla.

> [!success] Cómo encaja la v2 en cada parte del reto
> - **Experiencia del visitante:** el turista no pierde tiempo en filas, tráfico o lluvia.
> - **Flujos turísticos:** se redirige en el momento, de lo saturado a lo que tiene capacidad.
> - **Impacto económico:** más derrama (un día que rinde más) y mejor repartida (redirecciones medidas en pesos).
> - **Impacto social:** visitantes y gasto para destinos y prestadores que hoy casi no reciben.

## 👥 Equipos
- 3 estudiantes + 1 profesor tutor.
- El desarrollo y la presentación los hacen **primordialmente los estudiantes**.

## 🗃️ Datos
- **No se proporciona dataset.** Encontrar, justificar, documentar y preparar los datos es parte de la solución (ver [[04 - Fuentes de datos]]).
- La v2 va más allá de recopilar: construye una **base de datos propia** que crece con los datos en vivo y los reportes ([[05 - Arquitectura y MCP]]).

## 🧑‍🏫 Mentoría y evaluación
- Mentoría **única**, no eliminatoria y sin puntuación.
- La evaluación se hace sobre el resultado final en **Tech-Capital 2026**: versión funcional o demostrable, pitch ejecutivo, demostración y preguntas del jurado.

## 📦 Entregables
1. Descripción ejecutiva.
2. Problema y usuarios.
3. Descripción de la solución.
4. Inventario y documentación de fuentes.
5. Justificación de selección de datos.
6. Proceso de obtención, limpieza, integración, transformación y análisis.
7. Arquitectura o metodología.
8. Prototipo funcional.
9. Evidencia de análisis y resultados.
10. Presentación y demo final.
11. Documentación del modelo de IA cuando corresponda (configuración o entrenamiento, variables, resultados, limitaciones).

El checklist de avance está en [[06 - Plan de trabajo y roles]].

## 📊 Rúbrica y cómo la atacamos

| Criterio | Peso | Cómo lo atacamos en la v2 |
|---|---|---|
| Identificación, pertinencia, calidad y aprovechamiento de los datos | 20% | Fuentes oficiales + en vivo, depuradas y guardadas en una base propia con trazabilidad; los reportes son un **dato nuevo** ([[04 - Fuentes de datos]]) |
| Relevancia y comprensión del problema | 15% | Concentración medida con cifras propias y respaldada por el boletín oficial ([[02 - Problema y propuesta]]) |
| Innovación y creatividad | 15% | Afluencia estimada + reportes tipo Waze + redirección explicada, para turismo |
| Solidez técnica y funcionamiento del prototipo | 15% | App y panel funcionando, base de datos, servidor MCP, modo escenario para la demo |
| Impacto turístico, económico y social | 15% | Derrama redistribuida **medida** con las redirecciones aceptadas |
| Viabilidad, implementación y escalabilidad | 10% | Costo $0; zona piloto que crece agregando puntos al catálogo ([[07 - Modelo de negocio y escalabilidad]]) |
| Experiencia de usuario y utilidad | 5% | Semáforo en el mapa, una pregunta ("¿a dónde voy ahora?"), el evaluador la usa en su celular |
| Calidad del pitch y demostración | 5% | Pitch de 5 min + escenario "sábado de puente con lluvia" + cartel + video de respaldo ([[09 - Guion de pitch]]) |

## 🏆 Categorías
- Gran Premio
- Mejor solución basada en datos
- Mejor uso de IA
- Turismo sostenible

Un proyecto puede ganar el **Gran Premio más una categoría especial**, pero **no dos especiales**. La v2 apunta a **Gran Premio + Turismo sostenible** o **+ Mejor solución basada en datos**.

## 🤖 Uso de IA
- Debe **justificarse y explicarse**.
- Consumir una API o poner un chatbot genérico **NO es suficiente** para una valoración sobresaliente.
- Hay que poder explicar qué componentes usan IA, su función y sus limitaciones (ver [[05 - Arquitectura y MCP]]).

> [!important] Nuestra respuesta
> La IA está en **cómo se calcula la afluencia** (pronóstico + fusión con reportes), en el **recomendador** y en el **índice de conveniencia**. El asistente solo es la interfaz y **responde únicamente con los resultados de esos modelos**.

## ⚖️ Propiedad intelectual
- Se queda con los **autores**.
- Los organizadores reciben una autorización **no exclusiva, gratuita y no comercial**, solo para divulgación.
- Cualquier explotación, licenciamiento o transferencia posterior requiere **acuerdos específicos** (ver [[07 - Modelo de negocio y escalabilidad]]).

## 🌱 Continuidad
Pueden identificarse proyectos para mentoría, incubación, pilotos, vinculación empresarial o transferencia tecnológica, **con o sin premio**. La zona piloto de la v2 está pensada justo para eso: un piloto real que la Secretaría pueda extender.

## 🔗 Relacionado
- [[00 - Índice]]
- [[06 - Plan de trabajo y roles]]
- [[08 - Preguntas abiertas y riesgos]]

---
#hackathon
