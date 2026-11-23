# Diseño de Software — proyecto final y Expo Ibero

Mtro. Rafael Pérez Aguirre · Diseño de Software (LIIS1208) · Otoño 2026

Equipo: Angel Rugerio Jiménez (201720, representante), Axel García Arellano (201251), Diego Navarro Sánchez (202497), Yohualli Ollin Luna Reyes (189670) y Cristian Alexei Romero Martínez (203739).

## Documentos

| Documento | Qué es |
| --- | --- |
| [Instrucciones del proyecto final](Instrucciones_ProyectoFinal.pdf) | Sesión 22, «Proyecto final y Expo Ibero»: requisitos comunes, temas, ficha y documentos de diseño. Al PDF le faltan las láminas 02 y 06; la numeración salta, pero no es relevante |
| [Ficha de proyecto](00b%20-%20Proyecto_PDF.pdf) | Ficha entregada y validada el 4 de noviembre de 2026. Transcrita en [`00 - Proyecto.md`](00%20-%20Proyecto.md) |
| [01 - Pre-registro Expo Ibero](01%20-%20Pre-registro%20Expo%20Ibero.md) | Datos del pre-registro de la Expo, enviado el 8 de noviembre de 2026 |
| [Calendario de la Expo](../00%20-%20Calendario%20ExpoIbero.png) y [instrucciones del pre-registro](../01%20-%20Instrucciones%20Pre-registro.png) | Capturas de la plataforma de la Expo, en `docs/` |

## Lo que pide el profesor

**Requisitos comunes** (iguales para todos los equipos, en React, Vite y Firebase):

1. Login y dos roles: usuario y administrador.
2. Datos con dueño: cada quien ve lo suyo y el administrador ve todo.
3. Una regla en la base: Security Rules propias del tema.
4. Lógica aparte: las capas de la Pokédex, con pruebas.
5. URL desplegada: se abre desde cualquier navegador.
6. Usuarios reales: alguien la prueba, y esa es la evidencia del resumen. Para una propuesta propia, el usuario real tiene que tener nombre.

Los commits son la evidencia individual. Reciclar proyectos de otras generaciones es plagio.

**Documentos de diseño** (después de validar la ficha). Las instrucciones los piden en `docs/`; en este repo, compartido por dos materias, van en `docs/DdS/`:

| Archivo | Contenido |
| --- | --- |
| `00-proyecto.md` | La ficha (ya está: [`00 - Proyecto.md`](00%20-%20Proyecto.md)) |
| `01-requerimientos.md` | Visión, actores, 10 historias o más, RF y RNF |
| `02-modelo-datos.md` | Colecciones, campos y reglas de la base |
| `03-arquitectura.md` | Rutas y capas: pantalla, lógica y datos |
| `04-pantallas.md` | Flujos y wireframes de los dos roles |

Todo en el repo del equipo, con commits de cada integrante y declaración de uso de IA. Como punto de partida sirven el análisis de septiembre (el método) y la Pokédex (la estructura). Del hackathon hay material reutilizable en [`docs/hackathon/`](../hackathon/): `10 - Análisis FIS.md` (actores, casos de uso, reglas de negocio) y `12 - Especificación del frontend.md` (pantallas).

## Estado frente a los requisitos

Revisado el 7 de noviembre de 2026 sobre `develop` (`25c858e`).

| Requisito | Estado | Qué falta |
| --- | --- | --- |
| React, Vite y Firebase | ⚠️ Frontend en React 19 y Vite 8. Backend en FastAPI con SQLite | Migrar la base a Firebase. Si resulta inviable, platicarlo con el profesor |
| Login y dos roles | ❌ No existe | Firebase Authentication con los roles turista y administrador. Quitar de la regla RN_07 del hackathon la parte de "sin cuenta" |
| Datos con dueño | ❌ No existe | Datos por usuario: favoritos, historial, opiniones y reportes. El administrador ve todo |
| Regla en la base | ⚠️ Trigger en SQLite: un reporte por sesión y punto cada 30 minutos | Reescribirla como Security Rules, por usuario autenticado en lugar de por sesión |
| Lógica aparte, con pruebas | ⚠️ El backend tiene 113 pruebas en Python. El frontend no tiene pruebas ni las capas de clase | Separar el frontend en pantalla, `logic/` y `data/`, como en la Pokédex. Agregar pruebas de componentes y funciones |
| URL desplegada | ❌ La ficha lo dejaba fuera del alcance | Despliegue en dos capas (frontend y backend). El asistente con Ollama puede quedarse solo en local |
| Usuarios reales | ⚠️ La ficha dice "al menos dos personas ajenas al equipo" | Angel ya tiene a las dos personas; falta anotar sus nombres |
| Commits de cada integrante | Responsabilidad de cada integrante | — |
| Documentos `01` a `04` | ❌ No existen | Escribirlos conforme avance el código; la revisión a fondo va al final |

### Capas del frontend (como en la Pokédex)

La estructura que se vio en clase con la Pokédex (refactor a tres capas, revisado por el profesor el 28 de octubre) y que se va a adoptar:

| Capa | Carpeta | Responsabilidad | No puede importar |
| --- | --- | --- | --- |
| Pantalla | componentes y páginas | Estado, efectos y eventos; decide el orden de las operaciones | Firebase |
| Reglas | `logic/` | Funciones puras que reciben lo que necesitan y regresan un resultado | React, Firebase |
| Datos | `data/` | Acceso a Firebase (y a la API); únicos archivos que importan `firebase/*` | React |

`logic/` se prueba sin navegador ni red. En clase se probó con `node:test`; las pruebas de componentes necesitan además un entorno de navegador.

## Decisiones

- **2026-11-04:** se entrega la ficha y el profesor da el visto bueno a lo que había y a lo planeado, sin comentarios sobre el backend.
- **2026-11-07:** al contrastar la ficha con las instrucciones de la sesión 22:
  - Se migra el backend a Firebase. Si resulta muy complicado, se platica con el profesor.
  - Se integran el login con dos roles y los datos con dueño. De la regla RN_07 del hackathon ("sin cuenta ni datos personales") se quita la parte de "sin cuenta". Se conserva la otra mitad: la ubicación no se guarda, solo se usa en el momento para localizar al usuario y los puntos cercanos.
  - La regla de la base se reescribe como Security Rules.
  - El frontend adopta las capas de clase, con nombres de carpetas coherentes, y lleva pruebas propias.
  - Sí se despliega, en dos capas. El asistente puede quedar fuera del despliegue.
  - El pre-registro de la Expo describe lo que la app hace y lo que es. Los registros de Diseño de Software y de Interacción Persona Máquina se hacen por separado.

## Fechas

**Expo Ingenierías Ibero Puebla, Otoño 2026:**

| Fecha | Qué |
| --- | --- |
| Lun 2 al dom 8 de noviembre, 23:59 | Pre-registro de proyectos (solo el representante) |
| Lun 9 al lun 16 de noviembre, 23:59 | Envío de documentos a la plataforma |
| Mar 17 y mié 18 de noviembre, 23:59 | Evaluación editorial |
| Jue 19 y vie 20 de noviembre, 23:59 | Correcciones editoriales |
| Lun 23 y mar 24 de noviembre, 23:59 | Revisión de contenido por el comité evaluador |
| Mié 25 y jue 26 de noviembre, 23:59 | Correcciones de contenido |
| **Vie 27 de noviembre, 9:00–12:00** | **Evaluación presencial de los proyectos (póster y prototipos)** |
| Lun 30 de noviembre | Entrega de la relación final de proyectos a la DGA |
| Jue 3 de diciembre (horario por definir) | Montaje y pre-inauguración, Gimnasio-Auditorio |
| **Vie 4 de diciembre (horario por definir)** | **Expo Ibero** |

Las fechas de entrega del proyecto en la materia están en Moodle. En Interacción Persona Máquina, el código se entrega el jueves 26 de noviembre: en la práctica, es la fecha límite para el login, Firebase y el despliegue, un día antes de la evaluación presencial.
