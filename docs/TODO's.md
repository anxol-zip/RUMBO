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

---

## Retroalimentación del profesor (2026-11-23) — cambios a futuro

Sin responsable ni fecha todavía: se reparten después de la defensa, o antes si alguien tiene tiempo.

### Investigar

- [ ] **Datos de lugares con la API de Google Maps (Places API New).** Investigado el 2026-11-23:
  - **Sí trae lo que se pidió:** restaurantes y puntos turísticos (*Nearby Search* / *Text Search* por tipo y zona), su **horario** (`regularOpeningHours`, `currentOpeningHours`) y su **precio** (`priceLevel`, un nivel de `$` a `$$$$`, y `priceRange`, un rango aproximado). No hay precio exacto de entrada ni de platillos.
  - **Costo:** horario y precio son campos del SKU *Place Details Enterprise*: 1,000 llamadas gratis al mes; después se cobra cada una. La llamada se cobra al SKU más caro de los campos que pidas (`X-Goog-FieldMask`), así que hay que pedir solo lo necesario.
  - **Pide cuenta de facturación con tarjeta.** Es lo mismo que nos hizo descartar Google para el login el 2026-11-11.
  - ⚠️ **Lo que los términos no dejan hacer** (nos pega directo):
    - **No se puede guardar** lo que devuelve en Supabase ni en el índice del asistente; solo el `place_id` se puede guardar sin límite. Lo demás se pide en el momento en que el turista abre la ficha. O sea: no se puede cargar con `cargar_bd.py` ni meter al RAG.
    - **No se puede mostrar en un mapa que no sea de Google.** Nuestro mapa es Leaflet con OpenStreetMap: los datos de Google podrían ir en la ficha (sin mapa, con el logo de Google y sus atribuciones), pero no como marcadores.
  - **Propuesta mínima, si se hace:** guardar `place_id` por punto y, al abrir la ficha, pedir al backend `regularOpeningHours` y `priceLevel` (con la llave solo en el backend, nunca `VITE_`). Mostrarlo con el logo de Google. El horario que ya tenemos (`leer_horario`) se queda como respaldo.
  - *Listo cuando:* se decide en equipo si vale la pena (tarjeta + términos), y si sí, la ficha de un punto muestra el horario y el precio de Google.
- [ ] **Deploy en Hugging Face Spaces para habilitar el asistente.** Investigado el 2026-11-23:
  - Un Space **Docker** (FastAPI + Ollama) **ya no es gratis de crear**: Hugging Face pide plan **PRO (US$9 al mes)** para Spaces Docker o Gradio en CPU. Gratis solo quedan los Spaces estáticos y hasta 2 Gradio en ZeroGPU (cuenta con más de 30 días y correo verificado).
  - El CPU básico es de 2 vCPU y 16 GB de RAM: `qwen3:4b-instruct` y `bge-m3` caben, pero en CPU van lentos.
  - El disco gratis es **efímero**: en cada reinicio se vuelven a bajar los modelos y se pierde el índice de ChromaDB. El disco persistente cuesta desde US$5 al mes (20 GB, en `/data`).
  - En CPU básico el Space se duerme tras 48 h sin visitas, y mientras duerme no corren las tareas de cada hora.
  - **No reemplaza a Vercel:** el frontend se puede quedar en Vercel y solo cambiar `BACKEND_URL` al Space (`deploy/README.md`).
  - *Listo cuando:* se decide si se paga PRO o se busca otra opción (Oracle o Azure for Students, que ya están en el plan), y el chat de producción responde sin 503 (`SinOllama`).

### Corregir

- [ ] **Al ampliar la foto se ve recortada.** El visor (`components/Foto.jsx`) sí usa `object-fit: contain`, pero el archivo ya viene recortado: todas las fotos de `frontend/public/fotos/` son de 900×600 (3:2). Hay que guardar una versión completa de cada foto (p. ej. `<id>-completa.jpg`, 1600 px el lado largo, desde la página de la fuente en `data/fotos.js`) y usarla solo en el `<dialog>`; además quitar el `aspect-ratio: 3 / 2` fijo de `.foto-ampliada` en `index.css`.
  - *Listo cuando:* una foto vertical o panorámica se ve entera al ampliarla, sin recorte.
- [ ] **El panel lateral debe crecer con el tamaño de letra.** Hoy el mínimo (`ANCHO_MINIMO = 400` en `components/BordePanel.jsx`) y el ancho elegido (`rumbo.anchoPanel` en `pages/Turista.jsx`) están en píxeles fijos, así que con letra 125 % o 150 % el texto se aprieta. Multiplicarlos por `ESCALA_TEXTO[letra]` (o guardarlos en `rem`).
  - *Listo cuando:* al pasar de letra normal a muy grande, el panel se ensancha en la misma proporción (sin pasar de `window.innerWidth - 160`).

### Agregar

- [ ] **Ubicación en tiempo real.** Hoy `hooks/useUbicacion.js` lee una sola vez (`getCurrentPosition`). Cambiar a `watchPosition` mientras la app esté abierta (y `clearWatch` al salir), para que el punto del turista se mueva en el mapa y los traslados se recalculen.
- [ ] **Botón "Usar mi ubicación" desde el inicio**, visible al abrir la app, antes de elegir un lugar. Sin permiso o sin HTTPS se avisa el motivo (los de `onError`) y la app sigue sin ubicación.
- [ ] **Elegir destino y ver la ubicación actual a la vez:** origen = "Mi ubicación" (o un punto elegido a mano), destino = cualquier lugar. Mostrar los dos en el mapa y abrir la ruta con el `url_como_llegar` que ya existe.
  - *Listo cuando:* en celular, con la ubicación activada, el punto se mueve al caminar y "Cómo llegar" sale desde donde estás hasta el destino elegido.
