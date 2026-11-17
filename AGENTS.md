# AGENTS.md — RUMBO: correcciones incrementales con aprobación humana

> Instrucciones operativas para Codex en la raíz de `anxol-zip/RUMBO`.
> La persona usuaria es la única que puede autorizar publicar, subir o integrar cambios.
> **Al iniciar, ejecuta exclusivamente la etapa 1. No avances a la 2 sin autorización explícita.**

## 1. Contexto del proyecto (verificar contra el código local)

RUMBO (Redistribución Unificada con Mapas, Búsquedas y Opiniones) es una aplicación turística para Puebla, Cholula y Atlixco con mapa, semáforo de afluencia, recomendaciones, favoritos, reseñas y panel de la Secretaría de Turismo.

- Repositorio: `anxol-zip/RUMBO`; rama de integración: `develop`.
- Frontend: React 19, Vite 8, React Router 7, Leaflet, `oxlint`; código bajo `frontend/src/`.
- Backend: FastAPI, PostgreSQL/Supabase; código bajo `backend/`.
- Cuentas: Supabase Auth con proveedor Microsoft; el uso sin iniciar sesión sigue permitido.
- Roles existentes: `turista` y `administrador`.
- Idiomas de la app turística: español e inglés; preservar i18n, accesibilidad y ajustes de lectura.
- La API del panel ya utiliza `solo_admin` en `backend/app/deps.py` y `Depends(solo_admin)` en `backend/app/routers/panel.py`. **Verificarlo, no duplicar un sistema de autenticación sin motivo.**
- Puntos de partida para inspeccionar (no asumir que el código permanece idéntico):
  - `frontend/src/App.jsx`, `frontend/src/components/Cabecera.jsx`, `frontend/src/index.css`
  - `frontend/src/components/BotonCuenta.jsx`, `frontend/src/cuenta/Cuenta.jsx`, `frontend/src/cuenta/contexto.js`
  - `frontend/src/components/BotonFavorito.jsx`, `frontend/src/components/Resenas.jsx`
  - `frontend/src/pages/Turista.jsx`, `frontend/src/pages/Panel.jsx`, `frontend/src/api/cliente.js`, `frontend/src/api/supabase.js`
  - `backend/app/deps.py`, `backend/app/routers/panel.py`, `backend/sql/esquema_postgres.sql`
  - `README.md`, `frontend/README.md`, `backend/README.md`, `INSTALACION.md` y documentación/contratos relevantes.

Los nombres anteriores son referencias al estado conocido, no autorización para cambiar todos esos archivos. Lee primero los que afecten a la etapa actual y sigue el contrato real del repositorio.

## 2. Reglas irrevocables de Git y alcance

1. **PROHIBIDO hacer `git push` de cualquier tipo.** No usar `gh pr create`, no crear PRs remotos, no actualizar ramas remotas, no hacer merges a `develop` ni a `main`, no publicar releases ni realizar operaciones remotas de escritura. **SOLO la persona usuaria autoriza esos actos.** No inferir permiso por haber terminado una etapa o por recibir aprobación para continuar.
2. Crear **una sola rama local de feature**, preferentemente `feature/rumbo-ux-auth-access`, a partir de la rama local `develop`, antes de modificar código. Todos los seis problemas, si se autorizan, viven en esa rama y se registran en commits separados por problema.
3. Antes de crear/cambiar de rama: revisar `git status --short --branch`, rama actual y diferencias. **Conservar todos los cambios ajenos existentes.** **Excepción inicial:** si la ÚNICA novedad en el árbol es este `AGENTS.md` recién copiado y aún sin seguimiento, consérvalo y permite crear la rama local sin destruirlo; no lo confundas con un cambio de código del usuario. Si hay cualquier otro cambio pendiente, un conflicto de ramas o incertidumbre sobre el punto de partida: detenerse y preguntar; no usar `git stash`, `reset`, `clean`, `checkout --`, `restore` ni sobrescribir trabajo sin orden expresa.
4. No tocar `develop`/`main` para trabajar; no hacer `pull`, `rebase`, `merge` o `fetch` de forma automática. Usar el historial local disponible y explicar si el punto de partida no es adecuado.
5. **Conventional Commits**, mensajes claros y en inglés (consistentes con el tipo). Si `AGENTS.md` es nuevo, puede quedar en un primer commit local `docs(codex): define staged review workflow` tras crear la rama; no cambiar sus reglas sin aprobación. Ejemplos para las etapas: `fix(nav): prevent mobile header overlap`, `fix(auth): cover viewport with login backdrop`, `fix(account): require sign-in for protected actions`, `feat(account): add favorites to profile panel`, `feat(ui): add loading skeletons`, `fix(admin): hide dashboard navigation from non-admins`. Elegir el tipo según el cambio real. Sin commits vacíos ni cambios ajenos; preparar únicamente archivos relacionados (`git add <archivos>`; evitar `git add .`).
6. Trabajar **un problema por etapa**. No empezar correcciones o refactors de etapas posteriores, aunque se descubran durante la inspección. Anotarlas para después.
7. No introducir dependencias, migraciones SQL, servicios externos, cambios de autenticación o alteraciones de datos que no sean necesarios. Si una etapa no se puede completar de manera segura sin una decisión arquitectónica, detenerse y explicar las alternativas. No incluir secretos ni archivos `.env` en commits. Nunca ejecutar borrados reales de cuentas ni modificaciones destructivas en bases compartidas para probar.
8. No cambiar la apariencia o comportamiento de componentes no relacionados; conservar estilos, textos, prestaciones y accesibilidad actuales.

## 3. Organización: EXACTAMENTE dos subagentes

El **agente principal** es el coordinador: planifica la etapa, asigna trabajo, recibe entregas, contrasta evidencia, comunica el resultado y solicita aprobación humana. **No edita código ni resuelve él mismo los problemas.**

### Subagente 1: Implementador

- Único agente autorizado a editar código y pruebas de la etapa aprobada.
- Lee los archivos relevantes antes de modificar y preserva el trabajo preexistente.
- Presenta al coordinador un plan breve antes de editar: diagnóstico, archivos previstos, comprobaciones y riesgos.
- Trabaja por bloques coherentes, enviando cada bloque al coordinador con qué cambió, por qué y comprobaciones ejecutadas.
- Ejecuta pruebas pertinentes, revisa el diff, aplica las correcciones aceptadas por el coordinador y vuelve a verificar.
- Cuando una etapa esté lista, deja un commit local con Conventional Commits y registra su hash. Nunca hace push.

### Subagente 2: Supervisor

- **Revisión independiente y solo de lectura:** no edita código, pruebas ni documentación, y no hace commits.
- Revisa desde el inicio los requisitos, el diagnóstico y el plan del implementador; también cuestiona las decisiones del **agente principal** (alcance, interpretación, omisiones, validación y conclusiones).
- Tras cada bloque, examina diffs y evidencia; identifica defectos, regresiones, seguridad, accesibilidad y casos límite.
- Da hallazgos concretos en formato `severidad | archivo:línea | problema | reproducción | resultado esperado`. Si no pudo verificar algo, lo declara explícitamente; no inventa ejecución de pruebas.
- Tras las correcciones, vuelve a revisar y emite un dictamen claro: `APROBABLE`, `APROBABLE CON LIMITACIONES` o `BLOQUEADO`, con fundamentos y riesgos pendientes.

**No crear terceros subagentes, ni permitir que los dos subagentes creen otros agentes.** El coordinador no debe reemplazar al supervisor con una autorrevisión. Si el entorno no permite instanciar exactamente esos dos subagentes, declararlo y detenerse antes de editar; no simular agentes inexistentes.

## 4. Ciclo obligatorio para CADA etapa

1. Identificar la etapa autorizada y leer su alcance y criterios de aceptación.
2. Inspección de solo lectura: estado de Git, fuentes relevantes, comportamiento actual y comprobaciones disponibles.
3. El coordinador asigna al Implementador y Supervisor **esa misma etapa**, conservando la independencia del segundo.
4. El Implementador aplica cambios en bloques pequeños; el Supervisor inspecciona y comunica hallazgos. Resolver hallazgos importantes antes de cerrar.
5. Ejecutar verificaciones pertinentes. En frontend, como base: `cd frontend && npm run lint && npm run build` (si hay dependencias instaladas); si se cambió backend, ejecutar las pruebas específicas con `uv run pytest ...` desde `backend/`. No inventar resultados, y explicar comandos que no pudieron ejecutarse.
6. Revisar `git diff --check`, `git diff`, cambios no deseados y el estado final. Commit **local** de la etapa terminada únicamente después de comprobaciones y dictamen satisfactorio del Supervisor; si hay defectos bloqueantes, no darla por completada.
7. Entregar un reporte al usuario en este formato:
   - **Etapa N/6 — nombre / estado**
   - Diagnóstico y solución efectivamente realizada
   - Archivos modificados
   - Pruebas ejecutadas y sus resultados (más pruebas manuales pendientes)
   - Hallazgos y dictamen del Supervisor; riesgos conocidos
   - Commit local (`hash` y mensaje) y rama actual
   - Instrucciones concretas para que la persona pueda comprobarlo en su PC/celular
   - **“DETENIDO: espero tu validación. No comenzaré la etapa N+1 hasta que escribas ‘continúa con la etapa N+1’.”**
8. **Terminar el turno y esperar.** No ejecutar, planificar en detalle, editar, commitear ni anticipar la siguiente etapa. Si el usuario reporta un fallo, corregir **la misma etapa** antes de solicitar aprobación nuevamente. Un “continúa” sin número puede interpretarse como autorización para la etapa inmediatamente siguiente únicamente si la etapa anterior ya se validó.

No tratar la aprobación técnica del Supervisor como equivalente a la aprobación humana. La aprobación del usuario para seguir no autoriza push, PR ni merge.

## 5. Backlog secuencial y criterios de aceptación

### Etapa 1/6 — Navbar rota en celular (HACER PRIMERO)

**Problema observado:** la cabecera móvil desborda y superpone elementos: logo, enlaces (`Explore`, `Dashboard`, `About`), estado en vivo, botón de lectura, cuenta e idioma se enciman; hay elementos tapados o difíciles de pulsar. Se observa en una captura de navegador móvil de RUMBO.

**Objetivo:** una navegación móvil intencional, legible y usable, coherente con el diseño rosa/blanco actual. Resolver ancho, distribución, overflow, legibilidad, estados de foco y targets táctiles; si conviene usar un menú compacto o desplegable, hacerlo accesible, sin perder secciones ni opciones. Mantener comportamiento de escritorio. No implementar todavía la regla de visibilidad de admin de la etapa 6; no mezclar cambios.

**Aceptar si:** no hay solapamientos ni scroll horizontal accidental a 320, 360, 390 y 430 px; funciona también con fuente ampliada, dos idiomas y orientación horizontal; menú y botones son usables con teclado y tacto; no se altera la vista de escritorio ni se tapan controles de mapa. Incluir pasos de comprobación en dispositivo real.

### Etapa 2/6 — Backdrop del modal de inicio de sesión en TODA la pantalla

**Problema observado:** al abrir el modal de Microsoft, el efecto de desenfoque/oscurecimiento solo se aprecia en el encabezado; el resto del mapa/página queda nítido detrás.

**Objetivo:** backdrop uniforme en **todo el viewport**, incluyendo header, mapa, paneles y controles Leaflet; modal por encima, claro y legible. Investigar contextos de apilamiento, `position: fixed`, `z-index`, portales si realmente hacen falta, y contenedores transformados/aislados; corregir la causa, no solo aumentar valores a ciegas.

**Aceptar si:** ningún área del fondo queda sin cobertura en móvil o escritorio; el diálogo no se desenfoca; el fondo no es interactivo mientras está abierto; foco gestionado, Escape/cierre funcionan y no hay scroll accidental. No romper otros diálogos, como confirmación de borrado y denuncia.

### Etapa 3/6 — Iniciar sesión antes de guardar favoritos o comentar

**Objetivo:** si una persona anónima intenta **añadir un favorito** o **escribir/publicar una reseña**, abrir el **mismo modal de inicio de sesión** existente; nunca navegar silenciosamente ni mostrar una acción que parece haberse guardado. Mantener la consulta pública de lugares y reseñas sin cuenta.

**Importante:** ya existe código parcial: `alternarFavorito()` en `cuenta/Cuenta.jsx` solicita login y guarda una acción pendiente; `Resenas.jsx` muestra un botón para opinar sin sesión. **Diagnosticar las rutas de interacción reales antes de reescribir**. Evitar modal duplicado; preservar la intención de favorito en OAuth sin duplicaciones. Para una reseña, si se conserva el contexto tras login, no publicar automáticamente contenido que el usuario aún no confirmó.

**Aceptar si:** invitado + favorito => modal; invitado + opinar => modal; cancelar => sin cambios persistidos; al autenticarse se recupera la acción cuando corresponda; usuario autenticado no ve login de nuevo; errores y Supabase no configurado se gestionan sin romper la app; accesible en móvil/desktop.

### Etapa 4/6 — Apartado de perfil con favoritos

**Objetivo:** al pulsar el botón de cuenta de una persona autenticada se despliega un **panel/menú de perfil** usable en móvil y escritorio. Debe mostrar identificación básica (nombre; correo si está disponible) y **mis favoritos**, con enlaces para abrir las fichas y opción para quitarlos si es coherente con el flujo existente. Al final del panel, visualmente separados: **Cerrar sesión** y **Borrar cuenta**.

**Importante:** `BotonCuenta.jsx` ya tiene menú, cerrar sesión, confirmación de borrado y `Cuenta.jsx` tiene `salir()` y `borrarCuenta()`. **Reutilizar esas funciones y el diálogo destructivo existente**, sin duplicar APIs ni borrar la cuenta Microsoft del proveedor. Respetar reglas de datos por usuario (RLS); atender loading, vacío y error. Si falla el borrado no cerrar automáticamente como si hubiese sido exitoso.

**Aceptar si:** favoritos del usuario actual visibles/actualizables sin mostrar datos de otros usuarios, panel accesible, responsive, Escape/clic fuera cuando aplique, logout correcto y borrado con confirmación explícita. Mostrar mensajes claros de error. **Ideas opcionales, no implementar sin autorización:** “Mis reseñas”, “Mis intereses”, ajustes de accesibilidad y privacidad.

### Etapa 5/6 — Skeletons de carga generales

**Objetivo:** reemplazar cargas bruscas y textos genéricos de espera por skeletons visualmente coherentes y reutilizables donde hay esperas reales: catálogo/listado, ficha de lugar, reseñas, favoritos/perfil y, si corresponde, panel administrativo. Hacer un inventario breve de los estados de carga reales antes de modificar.

**Aceptar si:** skeletons semejantes a la geometría del contenido final, sin confundirlos con datos reales, con accesibilidad (`aria-busy`, anuncios sensatos), sin saltos grandes de layout ni animaciones problemáticas (respetar `prefers-reduced-motion`); estados de vacío/error siguen siendo distintos de carga. Evitar dependencias adicionales solo para skeletons.

### Etapa 6/6 — Dashboard exclusivo para administradores (UI + comprobar seguridad)

**Problema:** la navegación muestra “Dashboard” incluso a visitantes y cuentas sin rol admin. La protección no puede depender de ocultar un enlace en el DOM.

**Objetivo:** ocultar por completo el enlace al panel para invitados y turistas normales; mostrarlo solo con rol confirmado `administrador`. Mantener una protección de ruta al abrir `/panel` directamente, con salida no reveladora/accesible (sin mostrar contenidos administrativos). Durante la carga del perfil **no asumir que es admin** y evitar destellos del enlace o del contenido protegido. Cambios de sesión/rol deben actualizar inmediatamente la UI.

**SEGURIDAD EXISTENTE A REVISAR Y PRESERVAR:**
- `frontend/src/pages/Panel.jsx` ya comprueba `perfil?.rol` antes de renderizar contenido.
- `backend/app/deps.py` ya tiene `solo_admin`: valida JWT de Supabase con JWKS y consulta el rol en la BD.
- `backend/app/routers/panel.py` aplica `Depends(solo_admin)` a las rutas `/api/panel/*`.
- La tabla `perfil`, el rol y las reglas RLS están en `backend/sql/esquema_postgres.sql`.

**Aceptar si:** invitado/turista no ven Dashboard en navbar; abrir directamente `/panel` no enseña datos; llamar endpoints protegidos directamente con `curl`, DevTools o un cliente HTTP sin token / con token de turista da `401` / `403` respectivamente; con token admin válido se accede. Confirmar también que **operaciones de escritura**, como fijar color o moderar reseñas, siguen protegidas. No confiar en esconder rutas o en `localStorage` como autorización. No exponer secretos ni usar cuentas reales sin permiso.

La seguridad exigida es simple, pero **efectiva en el servidor**: no hay que crear un nuevo auth provider, duplicar bases o agregar infraestructura innecesaria. Si la comprobación revela una falla real de seguridad, limitar el cambio a corregirla y agregar una prueba de regresión. Si existe un endpoint administrativo fuera del router protegido, reportarlo y corregirlo solo dentro de esta etapa.

## 6. Estado inicial de ejecución

- **Etapa permitida ahora:** `1/6 — navbar móvil`.
- **Prohibido:** tocar etapas 2–6 sin aprobación explícita.
- **Destino de trabajo:** nueva rama **local** `feature/rumbo-ux-auth-access` desde `develop` (si se puede crear sin tocar cambios previos).
- **Publicación / push / PR / merge:** **NO AUTORIZADOS**.
- Al finalizar la etapa 1, esperar la inspección y decisión humana antes de continuar.

## 7. Checkpoint de continuidad — 2026-11-16

Esta sección registra el avance solicitado por la persona usuaria para poder retomarlo después. No modifica las reglas anteriores ni autoriza publicación alguna.

### Estado al detenerse

- Rama local: `feature/rumbo-ux-auth-access`, creada desde `develop` sin sobrescribir trabajo previo.
- Etapas 1 y 2 entregadas; la persona usuaria autorizó avanzar a la etapa 3. **Etapa 3 implementada y revisada, pendiente de validación humana final.**
- **Etapas 4–6 no iniciadas.** La tanda actual termina aquí por solicitud de guardar el progreso y cuidar el límite de uso. No empezar la etapa 4 hasta que la persona usuaria retome y la autorice expresamente.
- Se utilizaron exclusivamente los dos subagentes requeridos: Implementador (edición) y Supervisor (revisión independiente). El coordinador no editó código.
- No se hicieron push, PR, merge, migraciones, cambios de backend ni escrituras de prueba en la base compartida. No hay autorización para publicarlos posteriormente.
- Los archivos `.env` y `.env.local` quedaron en `backend/.env` y `frontend/.env.local`; no forman parte de estos commits ni deben copiarse a este documento.

### Commits locales y cambios entregados

| Commit | Mensaje | Resultado |
| --- | --- | --- |
| `7fc26ac` | `fix(nav): prevent mobile header overlap` | Etapa 1: menú móvil accesible, Aa persistente, opciones completas, foco y distribución sin solapamientos; escritorio preservado. Controles del mapa y asistente se acomodan únicamente cuando el menú móvil está abierto. |
| `cf9decd` | `docs(codex): define staged review workflow` | Instrucciones de este archivo incorporadas intactas en un commit separado. |
| `9f8602b` | `fix(auth): cover viewport with login backdrop` | Etapa 2: login y confirmación de cuenta comparten diálogo nativo en la capa superior; backdrop completo, fondo inerte, restauración de foco y scroll interior. |
| `48de880` | `fix(account): clear canceled sign-in actions` | Etapa 3: cancelar, acceso genérico, fallo OAuth, cierre de sesión o fallo de lectura descartan la intención pendiente; el favorito retomado solo se muestra guardado tras confirmación exitosa. Rechazos muestran error y revierten el cambio optimista cuando corresponde. |

El checkpoint se registra después en un commit documental separado; consultar `git log -5 --oneline` para identificarlo. Al cerrar esta tanda se espera un árbol de trabajo limpio, sin cambios ajenos ni secretos preparados.

### Validación efectivamente ejecutada

- Etapa 1: lint, build y `git diff --check` aprobados. Chromium verificó anchos 320, 360, 390 y 430 px, ES/EN, letra normal/150%, horizontal, escritorio y teclado. El Supervisor verificó además 24 casos finales de mapa: ubicación, zoom y asistente visibles y alcanzables.
- Etapa 2: lint, build y diff aprobados. Validación propia y ocho casos independientes del login confirmaron cobertura del viewport, contenido nítido, fondo no enfocable, Escape, foco, bloqueo/restauración del scroll y desplazamiento interno en horizontal. El Supervisor comprobó Tab, clic fuera, privacidad y mapa usando una sesión simulada local.
- Etapa 3: **8 pruebas Node aprobadas**, también ejecutadas por el Supervisor: cancelar/descartar, consumo único, una sola escritura, confirmación antes de actualizar el Set, favorito existente, fallos de respuesta/rechazo/síncronos y almacenamiento corrupto/bloqueado. Helpers probados: `frontend/src/cuenta/pendiente.js`, usados realmente por el proveedor.
- Etapa 3: lint sin nuevas advertencias, build y diff aprobados. El Supervisor verificó en navegador favorito anónimo → un único modal sin marcar guardado, Escape → intención eliminada y foco en corazón, acceso genérico → intención anterior eliminada y fallo OAuth simulado → intención eliminada y aviso. El cierre del modal tras ese error se comprobó en código, sin repetir la prueba dinámica después de añadirlo. No se usaron cuentas reales ni se ejecutó OAuth real.
- Dictamen independiente para las etapas entregadas: **APROBABLE CON LIMITACIONES**, sin bloqueantes pendientes de la etapa 3. El build conserva el aviso de bundle superior a 500 kB; no se cambió la división del bundle.

Para repetir las comprobaciones de la etapa 3, desde la raíz:

```bash
cd frontend
node src/cuenta/pendiente.test.js
npm run lint
npm run build
cd ..
git diff --check
```

### Límites conocidos y comprobación humana pendiente

- Faltan dispositivo móvil físico, Safari/otros motores y OAuth Microsoft real. No confundir las pruebas con mocks con validación de integración autenticada.
- Etapa 2: la apertura dinámica de confirmación de borrado y denuncia **no se verificó** porque los fixtures no aportaron evidencia válida. El Supervisor revisó el wrapper compartido de confirmación y los diálogos de denuncia/reporte no modificados. No probar borrados reales para suplir esta limitación.
- Etapa 3: la interacción dinámica de “Opinar” no se ejecutó; su ruta existente hacia el mismo `pedirEntrar()` fue revisada. No se añadió restauración de ficha/formulario tras OAuth ni publicación automática de reseñas.
- Se detectó un caso preexistente fuera del flujo de invitado: un JWT expirado en `FormResena` puede llamar a `pedirEntrar()` mientras `sesion` aún existe, pero `BotonCuenta` muestra el login solo con `!sesion`. Se documenta para una decisión posterior; no se cambió el sistema de autenticación ni se introdujo una guarda que lo agravara.
- Para validar la etapa 3 manualmente: sin sesión, pulsar un corazón, cancelar y después abrir Cuenta u Opinar; no debe guardarse el favorito anterior. Repetir el corazón y completar login de forma autorizada para comprobar guardado único; cancelar/error no deben aparentar guardado. Con sesión, favorito y formulario de reseña deben seguir sus flujos habituales sin pedir login otra vez.

### Servicios locales y cómo retomar

- URLs: frontend `http://127.0.0.1:5173`, documentación API `http://127.0.0.1:8000/docs`.
- Últimas sesiones de herramientas conocidas: backend `9111`, Vite `64240`; son referencias efímeras, comprobar que siguen activos. Un apagado limpio previo del backend produjo `ECONNREFUSED` en el proxy; se reinició el servicio sin modificar código. No asumir que un error de proxy exige cambiar el frontend.
- Si es necesario arrancarlos, usar dos terminales desde la raíz, conservando los archivos de entorno existentes:

```bash
cd backend
PUEBLA_TAREAS=0 uv run uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

- Antes de retomar: leer este checkpoint, revisar rama, `git status --short --branch` y commits locales; preservar cualquier cambio nuevo. Solicitar primero la validación pendiente de la etapa 3 si no consta y esperar autorización explícita para la etapa 4. No repetir ni ampliar las etapas anteriores sin un fallo reportado o una orden expresa.

## 8. Checkpoint de continuidad actualizado — 2026-11-16

Esta sección actualiza el **estado de avance** de la sección 7, que se conserva como historial. Las reglas operativas y la prohibición de publicar siguen intactas.

### Estado actual y commits locales

- Rama: `feature/rumbo-ux-auth-access`. Árbol limpio antes de esta actualización documental; al cerrarla se espera nuevamente limpio. No hubo push, PR, merge, migraciones, cambios de backend ni escrituras de prueba en bases compartidas.
- **Etapa 3 validada** por la persona usuaria con «todo bien»; no volver a solicitar esa validación por el checkpoint anterior.
- **Etapa 4 entregada y validada para avanzar**, con la observación «la tendremos que mejorar despues, pero de momento sigue con la etapa5». Las mejoras futuras del perfil quedan pendientes de definir y autorizar; no se inició una segunda versión.
- **Etapa 5 entregada y validada para avanzar**: la persona usuaria expresó «te quedaron perros» y autorizó la etapa 6.
- **Etapa 6 implementada y entregada**, pendiente de comprobación manual de la UI y de integración real. No quedan etapas nuevas autorizadas ni trabajo adicional de producto iniciado.
- Se mantuvieron exactamente los dos subagentes: Implementador como único editor y Supervisor independiente de solo lectura. El coordinador no editó código.

| Commit | Mensaje | Resultado |
| --- | --- | --- |
| `9217cb0` | `feat(account): add favorites to profile panel` | Etapa 4: identidad/correo, favoritos con enlaces a fichas públicas y opción de quitar, carga/vacío/error/reintento, acciones de sesión separadas y confirmación que permanece ante fallo de borrado. Aislamiento por usuario y protección ante respuesta tardía de borrado de otra sesión. |
| `3f52a17` | `feat(ui): add loading skeletons` | Etapa 5: componente reutilizable en catálogo/inicio, listado, ficha, reseñas/paginación, favoritos, recomendación, semana y panel/moderación. Anuncios fuera de regiones ocupadas, formas decorativas, movimiento reducido y separación carga/vacío/error; las recargas conservan datos válidos. |
| `864eaaf` | `fix(admin): hide dashboard navigation from non-admins` | Etapa 6: enlace solo con sesión y rol administrador confirmado; los eventos de autenticación revalidan también el perfil de la misma cuenta. Se preservaron la guarda de ruta, `solo_admin`, el router protegido y las reglas SQL existentes. |

### Evidencia y límites de esta tanda

- En las etapas 4–6 se aprobaron lint, build, las **8 pruebas Node existentes de intención pendiente** y `git diff --check`. Esas 8 pruebas no constituyen una batería nueva de perfil, skeletons o autorización. Se conserva el aviso conocido de bundle superior a 500 kB.
- **Etapa 4:** el Implementador verificó 11 casos CDP con API/Supabase simulados. El Supervisor comprobó independientemente errores/reintentos, aislamiento, la carrera de borrado entre cuentas, teclado/Escape/clic fuera y 24 variantes de distribución. La navegación con visita ya iniciada quedó revisada en código; la ficha pública sin visita se verificó dinámicamente.
- **Etapa 5:** el Implementador verificó 14 casos CDP de carga, fin de carga, vacíos/errores, anuncios, movimiento reducido y conservación del listado al refrescar. El Supervisor verificó cargas, errores/reintentos, paginación, semana, panel/moderación y 10 variantes de distribución. Tras corregir la paginación, el Implementador pasó **5 comprobaciones finales** con respuesta retenida y cambio de orden A→B→A: no reaparece el skeleton viejo, no se anexan respuestas obsoletas y una petición nueva funciona. El Supervisor revisó el cambio final en código; su repetición dinámica independiente quedó limitada por una herramienta bloqueada. Los fixtures CDP fueron temporales, sin dependencias nuevas en el repositorio.
- **Etapa 6:** el Supervisor aprobó **65 comprobaciones HTTP aisladas sin BD real**: ocho rutas GET/POST/DELETE frente a ocho estados de identidad/token y una revocación de rol con el mismo token. Se ejecutaron `solo_admin` y la verificación criptográfica real con una llave EC de prueba; **JWKS, BD, servicios y dispatcher de hilos fueron simulados**. No equivalen a pruebas con Microsoft/Supabase desplegados. Las pruebas existentes que crean usuarios de `auth.users` no se ejecutaron contra la base compartida.
- La protección del rol y de la moderación en SQL se revisó estáticamente: el turista solo puede actualizar `gustos` en su perfil; la moderación depende de `es_admin`, RLS y la regla `RN_R2`. No se verificaron esas políticas contra una BD real en esta tanda.
- **La UI de la etapa 6 no se verificó dinámicamente:** la herramienta quedó bloqueada y fue abortada. La evidencia frontend de esa etapa es revisión de código y lint/build. No dar por comprobados los destellos o la interacción real de invitado/turista/admin.
- Dictamen independiente de las tres etapas: **APROBABLE CON LIMITACIONES**, sin bloqueantes pendientes identificados. Faltan móvil físico, Safari/otros motores, OAuth Microsoft real y RLS/integración reales. No se usaron cuentas reales ni se hicieron borrados reales para probar.
- Un cambio externo del rol en BD no se notifica instantáneamente a la UI sin un mecanismo adicional. La UI se actualiza al recargar/revalidar el perfil y en eventos de autenticación; durante esa confirmación oculta el enlace y el contenido protegido. **El servidor consulta el rol en cada petición** y no depende de lo mostrado en la navbar. No se añadió realtime ni infraestructura.

### Cómo retomar y comprobar

1. Leer este estado actualizado y ejecutar `git status --short --branch` y `git log -8 --oneline`; preservar cualquier cambio nuevo. No reiniciar las etapas 1–5 por las notas históricas ni asumir autorización para mejoras futuras.
2. Repetir las comprobaciones locales desde la raíz:

   ```bash
   cd frontend
   node src/cuenta/pendiente.test.js
   npm run lint
   npm run build
   cd ..
   git diff --check
   ```

3. Las URLs habituales son `http://127.0.0.1:5173` y `http://127.0.0.1:8000/docs`; comprobar que los servicios siguen activos. Si hace falta, arrancarlos con los comandos de la sección 7, conservando los archivos de entorno existentes. No reutilizar identificadores de sesiones de herramientas como si fueran permanentes.
4. Validación manual pendiente: invitado y turista no deben ver Dashboard, tampoco en el menú móvil; abrir `/panel` directamente no debe mostrar datos administrativos. Con una cuenta administradora autorizada, el enlace aparece tras confirmar el perfil y la ruta funciona; al cerrar/cambiar sesión debe desaparecer. Revisar también teclado y ausencia de destellos durante la carga del perfil. No compartir tokens ni credenciales para comprobarlo.
5. Para revisar lo visual, activar una red lenta en DevTools y cargar catálogo/ficha/reseñas/perfil; distinguir skeleton, vacío y error. En móvil comprobar lectura ampliada y desplazamiento; con reducción de movimiento, los skeletons no deben animarse. La confirmación de borrado puede abrirse y cancelarse; no ejecutar un borrado real como prueba rutinaria.

La actualización de este checkpoint se registra en un commit documental separado. **Publicación, push, PR y merge siguen sin autorización.**
