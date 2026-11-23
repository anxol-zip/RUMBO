# Ficha del proyecto final — Diseño de Software

> Transcripción de la ficha entregada y validada el 4 de noviembre de 2026 ([PDF](00b%20-%20Proyecto_PDF.pdf)). Las instrucciones de la sesión 22 piden la ficha en `docs/00-proyecto.md` como evidencia; como el repo lo comparten dos materias, todo lo de Diseño de Software vive en `docs/DdS/`. El texto de las secciones 1 a 9 es el de la ficha entregada. Los cambios decididos después se anotan en [Cambios después de la validación](#cambios-después-de-la-validación), sin reescribir lo entregado.

## 1. Tema y título tentativo

- Aplicación web para la solución de problemáticas de turismo en el estado de Puebla mediante la recomendación de puntos turísticos en las zonas de Centro, Cholula y Atlixco.
- **Título:** RUMBO (Redistribución Unificada con Mapas, Búsquedas y Opiniones).

## 2. Problema y usuario real que lo va a probar

- Los turistas se concentran demasiado en puntos muy específicos de turismo en el estado de Puebla, lo cual lleva a que se saturen y empeoren la experiencia general que se tiene, mientras que puntos más retirados o menos conocidos tienen muy poca afluencia de gente.
- **Usuario real:** turistas que visitan la zona Puebla–Cholula–Atlixco. El sistema se probará con al menos dos personas ajenas al equipo, buscando incluir a un adulto mayor y, de ser posible, a una persona con daltonismo.

## 3. Roles y flujo de la demo

- **Turista:** entra a la página principal, selecciona gustos, tiempo disponible y zona en la que está; basado en esto, y el resto de información del backend, se hacen recomendaciones cercanas; el usuario selecciona alguna a la que quiere ir, o podría ir, y se le dan instrucciones para llegar; además, tiene capacidad de realizar reportes o preguntas al asistente virtual.
- **Administrador:** entra al panel de administrador, donde puede revisar la cantidad de redirecciones aceptadas, la derrama redistribuida, la nueva derrama estimada y los reportes realizados por los usuarios; además, un mapa donde se ven los puntos en tiempo real, el registro de las redirecciones (origen → destino) y la capacidad de cambiar el estado de determinados puntos dando una razón específica y por tiempo determinado; finalmente, información de umbrales e historial de puntos determinado con la base de datos.

## 4. La regla que la base hace cumplir

- **Regla:** un mismo usuario no puede registrar más de un reporte válido sobre el mismo punto turístico en un lapso de 30 minutos.
- **Por qué importa:** los reportes alimentan el semáforo y, con él, las recomendaciones. Bastan unos 3 reportes recientes para cambiar el color de un punto, así que sin esta regla una sola persona podría alterar el estado de un lugar y la redistribución de turistas.
- **Cómo se hace cumplir:** la base de datos (SQLite) tiene un trigger `BEFORE INSERT` sobre la tabla `reporte` que rechaza el registro aunque se intente guardar sin pasar por la aplicación. El backend conserva su propia validación para explicarle al usuario cuándo puede volver a reportar.
- Además, la base ya exige que todo cambio manual de estado tenga motivo y fecha de fin (`NOT NULL`), y que el color sea verde, amarillo o rojo (`CHECK`).

## 5. Qué queda fuera del alcance

- **Zonas fuera del piloto:** el sistema solo cubre los 23 puntos turísticos de la zona Puebla–Cholula–Atlixco.
- **Medición directa de afluencia:** no se usarán sensores, cámaras ni conteos en sitio; la afluencia se estima con datos oficiales, clima, tráfico y reportes de los usuarios.
- Pagos, reservaciones, compra de boletos y enlaces patrocinados.
- **Navegación propia paso a paso:** las instrucciones para llegar se abren en un servicio de mapas externo.
- **Aplicación móvil nativa y despliegue en producción:** es una aplicación web que se demuestra en un entorno controlado.
- **Integración con sistemas oficiales de la Secretaría de Turismo:** el panel de administrador trabaja solo con los datos del proyecto.

## 6. Integrantes, representante y quién hace qué

| # | Integrante | Matrícula | Rol |
| --- | --- | --- | --- |
| 1 | Angel Rugerio Jiménez (**representante**) | 201720 | Arquitecto de diseño de UI y flujo de información |
| 2 | Axel García Arellano | 201251 | Arquitecto de RAG, BD, API, MCP y lógica |
| 3 | Diego Navarro Sánchez | 202497 | Programación de componentes de backend |
| 4 | Yohualli Ollin Luna Reyes | 189670 | Programación de componentes de frontend |
| 5 | Cristian Alexei Romero Martínez | 203739 | Coordinación del backlog, pruebas con usuarios y documentación |

## 7. Extra: qué ya está hecho

- **Turista:** página principal con selección de gustos, tiempo y ubicación; mapa con semáforo de 23 puntos; ficha de cada lugar; recomendación de alternativas con enlace para llegar, y reportes de afluencia.
- **Administrador:** panel con indicadores de redirecciones y derrama, mapa de calor, semáforo estatal, umbrales y cambio manual de estado con motivo y duración.
- **Backend:** API en FastAPI con base de datos SQLite, cálculo del semáforo, recomendador, filtros de reportes y datos de clima y tráfico, con 113 pruebas automatizadas que pasan.
- **Inteligencia artificial:** asistente virtual con modelo local (Ollama) que responde con los datos del sistema y cita sus fuentes, y servidor MCP con herramientas para consultar esos datos.
- **Accesibilidad e idiomas** (trabajo de Interacción Persona Máquina): tamaño de letra ajustable, semáforo con formas, modo para daltonismo, alto contraste, barra lateral ampliable con filtros, navegación con teclado, lectura en voz alta con la voz del navegador y versión en español e inglés.

## 8. Extra: qué vamos a integrar

- Login de usuarios y administrador.
- Separación de pantallas.
- BD para preferencias, historial de recorrido, opiniones, comentarios, estrellas de calificación, corazones para guardado de lugares específicos (favoritos), preferencias de habla con el asistente y lectura en voz alta (ElevenLabs).
- Revisión de la estructura en capas.
- Prueba de MCP mediante vinculación a otros LLM.

## 9. Declaración de uso de IA

- **Herramienta:** Claude Code, con el modelo Claude Opus 5.5 de Anthropic.
- **Qué se pidió:** completar las secciones que faltaban (usuario real, regla que la base hace cumplir, fuera de alcance y qué ya está hecho), comprobarlas contra el código y la documentación del proyecto, implementar el trigger de la regla con sus pruebas y verificar que todo el documento luciera bien. El tema, el título, el problema, los roles y flujo de la demo, los integrantes, los roles de cada integrante (salvo la redacción del rol de Cristian) y la lista de lo que se va a integrar son del equipo.
- **Qué se modificó y por qué:** la primera versión de la sección 4 decía que la regla solo la validaba el backend; se cambió al implementar el trigger, para que el texto reflejara el estado real, y por lo mismo se actualizó de 111 a 113 el número de pruebas. La IA detectó que la matrícula de Yohualli no coincidía entre documentos y el equipo confirmó la correcta. El usuario real se tomó de nuestra propuesta de Interacción Persona Máquina; la IA no inventó participantes. El equipo propuso el rol de Cristian como "organización y desarrollo de pensamiento de programación"; la IA sugirió la redacción final porque la original no indicaba un entregable revisable, y el equipo la aceptó.
- **Qué se rechazó y por qué:** la IA sugirió detallar los roles de Diego y Yohualli con tareas concretas; el equipo lo rechazó y conservó su propia redacción. No se rechazó ningún otro contenido propuesto por la IA.

---

## Cambios después de la validación

Decisiones del equipo del 7 de noviembre de 2026, tomadas al contrastar la ficha con las [instrucciones de la sesión 22](Instrucciones_ProyectoFinal.pdf). El estado de cada requisito está en [`README.md`](README.md).

| Sección | Cambio |
| --- | --- |
| 4. La regla | La base de datos pasa de SQLite a **Firebase** (el stack que pide la materia). La regla de los 30 minutos se reescribe como **Security Rules** y se aplica por usuario autenticado, no por sesión. Si la migración resulta inviable, se platica con el profesor. |
| 5. Fuera del alcance | **El despliegue entra al alcance:** la app se publicará en una URL en dos capas (frontend y backend). El asistente con Ollama puede quedar fuera del despliegue y funcionar solo en local. |
| 8. Qué vamos a integrar | El login con dos roles (turista y administrador) y los datos con dueño son obligatorios. De la regla RN_07 del hackathon ("sin cuenta ni datos personales") se quita la parte de "sin cuenta", que chocaba con el login. Se conserva la otra mitad: la ubicación no se guarda, solo se usa en el momento para localizar al usuario y los puntos cercanos. |
| 8. Qué vamos a integrar | El frontend adopta las capas vistas en clase (pantalla, `logic/`, `data/`) y lleva pruebas propias. |
