# TODO's — RUMBO

Lo que falta para cerrar el proyecto en las dos materias, repartido por integrante. Reemplaza a `docs/HCI/TODO's.md`. Actualizado el 2026-11-23, después de la v0.1.0.

**Producción:** https://rumbo-production.vercel.app/ · **Release actual:** `v0.1.0`

## Fechas

| Fecha | Qué | Materia |
| --- | --- | --- |
| Mié 25 – jue 26 nov | Correcciones de contenido de la Expo (si el comité las pide) | DdS |
| **Jue 26 nov** | **Entrega de código** | HCI |
| **Vie 27 nov, 9:00–12:00** | **Expo Ibero presencial:** póster y prototipo | DdS |
| **Mar 1 dic** | **Presentación y defensa técnica** (modificación grupal e individual en vivo, sin IA) | HCI |
| Por confirmar (Moodle) | Documentos de diseño `01` a `04` | DdS |

## Reglas para esta semana

- Todo entra por **PR a `develop`**, desde una rama `feature/…`, `fix/…` o `docs/…`. Nadie hace push directo a `develop` ni a `main`.
- **Solo Angel** abre y mergea los PR de `develop` a `main`: cada merge a `main` despliega producción.
- Un PR en draft no está listo: **no se mergea un draft ajeno.**
- Los commits son la evidencia individual en DdS: cada quien commitea su propio trabajo, con su cuenta.
- **Cristian solo participa en Diseño de Software.** No se le incluye en entregables, pruebas ni aportaciones de HCI.

---

## Angel (`anxol-zip`) — HCI y DdS

- [ ] **Protección de ramas en GitHub** (hoy o mañana, antes de que todos empiecen a mandar PR).
  - Ruleset `main`: sin borrar, sin force push, PR obligatorio con 1 aprobación, solo *merge commit*; bypass solo para el admin.
  - Ruleset `develop`: sin borrar, sin force push, PR obligatorio sin aprobación.
  - Settings → Pull Requests: solo *Allow merge commits*; activar *Automatically delete head branches*.
  - *Listo cuando:* un `git push origin main` directo falla con `GH013: Repository rule violations`.
- [ ] **Que el repo se vea profesional en GitHub.**
  - About: descripción, website (`https://rumbo-production.vercel.app/`) y topics (`react`, `vite`, `fastapi`, `supabase`, `postgresql`, `tourism`, `puebla`…). Cierra el issue #8.
  - README: link a producción y al último release arriba, antes de la tabla de materias.
  - Releases: `v0.1.0` ya está. Sacar **`v0.2.0` el jueves 26** con lo de HCI, con notas escritas (no `--generate-notes`).
  - Issues: cerrar #6 ("asignar color" sí funciona; fue un error temporal). Milestones opcionales por entrega (HCI 26-nov, Expo 27-nov, Defensa 1-dic).
  - Limpiar ramas viejas en GitHub y en local.
  - Imagen para redes (*Social preview*) en Settings → General.
- [ ] **Deploy del backend en Oracle Cloud** (issue #5). Pasos en la nota `Deploy — RUMBO` del vault y en `deploy/README.md`; si Oracle sigue sin dejar crear la cuenta, plan B en Azure for Students.
  - Render (`rumbo-api-nkdp.onrender.com`) se queda como respaldo: no es requisito para la Expo.
  - *Listo cuando:* `BACKEND_URL` de Production apunta a la VM y `rumbo-production.vercel.app/api/salud` responde con los conteos de `rumbo-demo`.
- [ ] **Operación para la Expo y la defensa.**
  - `pg_dump` de `rumbo-demo` antes del viernes 27, guardado fuera del repo.
  - Despertar `rumbo-api` antes de las 9:00 del viernes (o programar el ping de día): Render Free tarda 30–60 s en despertar.
  - Revisar que Supabase no pause `rumbo-demo` antes del 1 de diciembre.
- [ ] **Revisar y mergear a `develop`** los PR del equipo; resolver dudas de integración.

## Axel (`Arellano008`) — HCI y DdS

- [ ] **PR #13 (guardia del asistente)**, antes del jueves 26: la IA es lo que sube HCI a nivel "Avanzada".
  - Verificar la revisión que se le pasó (`revision-PR13-guardia-asistente.md`) y decidir qué se corrige.
  - Quitar los falsos positivos (`dan`, `credenciales`, `contraseña`, `tokens`) y agregarlos a `LEGITIMAS` en `test_guardia.py`.
  - Actualizar la rama con `develop` y rehacer la descripción del PR con `--body-file`.
  - *Listo cuando:* "¿Qué restaurantes dan comida vegetariana?" pasa la guardia y las pruebas siguen en verde.
- [ ] **La regla de la base, por usuario** (requisito de DdS: "una regla en la base").
  - Hoy el trigger `reporte_uno_cada_30_min` (`backend/sql/esquema_postgres.sql`) cuenta por `sesion_id`. El profesor la pidió por usuario autenticado.
  - Con pruebas, y con la migración aplicada en `rumbo-dev` y después en `rumbo-demo` (`pg_dump` antes; coordinarlo con Angel).
- [ ] **Asistente listo en la laptop** para la Expo (vie 27) y la defensa (1-dic): Ollama, `qwen3:4b-instruct`, `bge-m3` y el índice de ChromaDB, probado de punta a punta.
- [ ] **Revisar el PR de Diego** que quita `PUEBLA_DEMO` (toca `turismo_core`).

## Diego (`godhigo`) — HCI y DdS

- [ ] **Quitar `PUEBLA_DEMO` y la separación de la actividad del stand (RN_11)**, antes del miércoles 25 para que entre en `v0.2.0`. Decisión de Angel (2026-11-23): ya no tiene sentido y solo agrega ruido. Rama `feature/quitar-demo`; revisa Axel.
  - Backend: `es_demo` y `EsDemo` en `app/deps.py`; `turista.py` (`crear_sesion`), `sistema.py` (`modo_demo` en `/api/salud`) y `panel.py` (`incluir_demo` en los tres endpoints); `schemas.py`; `turismo_core/servicio.py`, `panel.py` (`incluye_demo` en las respuestas), `reportes.py` y `conocimiento.py` (`WHERE s.es_demo = 0`); `mcp_server/server.py`.
  - Frontend: el selector "Qué actividad contar" de `pages/Panel.jsx`, `incluirDemo` en `api/cliente.js` y sus textos en `i18n/textos.js` (español e inglés).
  - Pruebas: `tests/test_api.py` (override de `deps.es_demo` y el caso con `incluir_demo`) y `tests/test_reportes.py`.
  - Documentación y configuración: `INSTALACION.md`, `backend/README.md`, `frontend/README.md`, `backend/.env.example`, `deploy/oracle/api.env.example` y `render.yaml` (`PUEBLA_DEMO`).
  - Base: la columna `sesion.es_demo` (`esquema_postgres.sql`). Primero se despliega el código sin usarla; después, con `pg_dump` antes, `ALTER TABLE sesion DROP COLUMN es_demo` en `rumbo-dev` y `rumbo-demo`, coordinado con Angel.
  - ⚠️ **Consecuencia que hay que aceptar:** `reportes.py` hoy **no** aplica el filtro de "velocidad imposible" a las sesiones de demo. Sin la demo, aplica a todos: en el stand, si un evaluador reporta dos lugares lejanos seguidos, el segundo reporte se descarta y la sesión también. Es el antispam funcionando y se puede mostrar así.
  - *Listo cuando:* `git grep -nE "es_demo|EsDemo|incluir_demo|incluirDemo|PUEBLA_DEMO|modo_demo"` no encuentra nada (salvo la documentación histórica del hackathon) y las pruebas del backend pasan.
- [ ] **Las tres decisiones de accesibilidad, justificadas** (requisito de HCI), en `docs/HCI/accesibilidad.md`: qué se hizo, para quién (turistas, adultos mayores, baja visión) y con qué principio. Candidatas: texto hasta 150 %, alto contraste y colores para daltonismo (Aa), lectura en voz alta, objetivos de 44 px y navegación con teclado.

## Yohualli (`keebwee5`) — HCI y DdS

- [ ] **Capa `logic/` del frontend, con pruebas** (requisito de DdS: "lógica aparte, las capas de la Pokédex").
  - Pasar las funciones puras de los componentes a `frontend/src/logic/` (sin React ni Supabase).
  - Que solo `data/` y `api/` hablen con Supabase: hoy `FormResena.jsx`, `Resenas.jsx`, `cuenta/Cuenta.jsx` y `hooks/useDenuncias.js` lo importan directo.
  - Agregar `"test": "node --test"` a `frontend/package.json`: ya hay archivos `*.test.js` en `data/` y `cuenta/`, pero no hay comando para correrlos.
  - *Listo cuando:* `npm test` corre todas las pruebas del frontend y ningún componente importa `supabase` directo.
- [ ] **Documento de las pruebas de usabilidad** (`docs/HCI/pruebas-usabilidad.md`): junta los resultados que aplique el equipo de HCI (ver abajo), con hallazgos, cambios hechos y el SUS de cada participante.

## Cristian (`Alexei-el-Ruso`) — solo DdS

- [ ] **Documentos de diseño en `docs/DdS/`**, cada uno en su propio commit:
  - `01-requerimientos.md`: visión, actores, 10 historias de usuario o más, requerimientos funcionales y no funcionales.
  - `02-modelo-datos.md`: tablas, campos, relaciones, políticas RLS y la regla de la base (desde `backend/sql/esquema_postgres.sql`).
  - `03-arquitectura.md`: rutas de la API y capas pantalla / lógica / datos del frontend.
  - `04-pantallas.md`: flujos y wireframes de los dos roles (turista y administrador).
  - Punto de partida: `docs/hackathon/10 - Análisis FIS.md` (actores, casos de uso, reglas de negocio), `docs/hackathon/12 - Especificación del frontend.md` y la app en producción.
- [ ] **Declaración de uso de IA** del equipo (requisito de DdS): qué herramientas se usaron, para qué y quién.
- [ ] **Evidencia de usuarios reales** para DdS: quién probó la app (con nombre), qué hizo y qué cambió por eso. Sale de las pruebas de usabilidad; sirve también para el resumen de la Expo.
- [ ] **Poner al día `docs/DdS/README.md`** ("Estado frente a los requisitos" sigue en el 7 de noviembre: dice Firebase, sin login y sin deploy) y borrar `docs/DdS/TODO's.md`, que ya no aplica.
- [ ] **Correcciones de contenido de la Expo** (mié 25 – jue 26), junto con Angel como representante, si el comité las pide.

---

## En equipo

### Equipo de HCI (Angel, Axel, Diego y Yohualli; sin Cristian)

- [ ] **Pruebas de usabilidad**, antes del jueves 26 (requisito de HCI: al menos 2 personas ajenas al equipo; idealmente 3 a 5).
  - Sobre producción, en celular. Tarea: *"Estás en el zócalo y la Catedral está llena. ¿Qué haces?"*
  - Se anota si encuentran "Mejor ve a…", cuánto tardan y dónde se atoran; al final, el cuestionario SUS (0–100; el promedio es ~68).
  - Cada quien consigue al menos un participante y le pasa sus notas a Yohualli.
- [ ] **Presentación del 1 de diciembre** (PDF o diapositivas): problema y justificación, aportación social, principios de IPM aplicados y demostración. Angel coordina.
- [ ] **Practicar la defensa sin IA:** cada quien explica un fragmento de lo que hizo, sin comentarios, y hace un cambio acotado en vivo.

### Expo Ibero (todo el equipo de DdS)

- [ ] Póster impreso (`docs/DdS/Expo Ibero/poster_RUMBO.pptx`) y un QR a producción.
- [ ] Laptop con el asistente (Axel) y producción despierta (Angel) antes de las 9:00.
