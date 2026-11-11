# Pendientes de HCI

**Objetivo:** que la interfaz sea mucho más intuitiva para el turista. La información relevante tiene que estar a la vista y ser fácil de leer, y la app tiene que **guiarlo** hacia "Mejor ve a…" y hacia el resto de las herramientas. Si llega y ve texto en cajas pequeñas sin saber qué botón picar, se harta y no la usa.

**Fecha límite:** código el jueves 2026-11-26; presentación y defensa el martes 2026-12-01.

> [!note] Diagnóstico de la interfaz actual (revisión del código, 2026-11-11)
> - Letra chica: el cuerpo mide 15 px (`--t-cuerpo`), y los metadatos y las razones 14 px (`--t-meta`, `.razones li`).
> - Cada razón va en su propia caja gris: ninguna destaca sobre las demás.
> - La ficha (`TarjetaPunto.jsx`) apila unos diez bloques del mismo peso: razones, confianza, próximas horas, hoy, semana, clima, datos de la visita, eventos y fuentes.
> - "Mejor ve a…" no dice a dónde, solo aparece si el lugar no está en verde, pesa lo mismo que "📍 Estoy aquí" y va después de todos los datos.
> - La guía de primer uso (`GuiaPrimerUso.jsx`) explica el semáforo, la lista y el botón Aa, pero no la acción principal.

---

## A. Leer sin esfuerzo

- [ ] **A1. Letra más grande.** Cuerpo a 16–17 px y metadatos a 15 px (`index.css`, variables `--t-*`). Las razones pasan a texto con ícono, sin caja gris.
  - *Por qué:* figura-fondo y proximidad de Gestalt. Cuando todo va en cajas iguales, nada destaca.
  - *Listo cuando:* ningún texto de la ficha ni de la lista mide menos de 15 px y se lee con la letra en tamaño normal.
- [ ] **A2. Conclusión arriba de la ficha.** Una frase grande antes de cualquier dato: "Ahora está lleno. Mejor a las 17:00, o ve a X".
  - *Por qué:* atención. El turista llega con una sola pregunta ("¿voy o no?") y se responde en una línea.
  - *Listo cuando:* al abrir una ficha, la respuesta se ve sin bajar.
- [ ] **A3. El detalle, solo si se pide.** Clima por hora, semana, eventos y fuentes van en una sección "Más detalles", plegada. Traslado, horario, entrada y tiempo de visita quedan siempre visibles, en una fila de íconos.
  - *Por qué:* carga cognitiva y memoria de trabajo (4 ± 1 bloques). Primero lo que decide la visita.
  - *Listo cuando:* sin abrir "Más detalles", la ficha muestra a lo mucho la conclusión, el semáforo, la fila de datos y las acciones.
- [ ] **A4. Lenguaje del turista, no del sistema.** Cambiar "estimado", "confirmado por turistas", "vs. normal" o "ajustado" por frases como "3 personas dicen que está lleno" o "La Secretaría de Turismo lo marcó en rojo". Se cambia en `i18n/textos.js`, en español y en inglés.
  - *Por qué:* lenguaje claro y tono adecuado (Factores humanos §4), y coincidencia entre el sistema y el mundo real (Nielsen 2).
  - *Listo cuando:* ningún texto visible usa términos internos del modelo.

## B. Llevar al turista a "Mejor ve a…"

- [ ] **B1. El botón dice el destino.** "Mejor ve a Capilla del Rosario · 8 min · tranquilo", en lugar de "Mejor ve a…".
  - *Por qué:* reconocimiento en lugar de recuerdo (Nielsen 6) y visibilidad del estado del sistema (Nielsen 1). Un botón que promete algo concreto invita a picarle.
  - ⚠️ **Depende del backend (Axel):** para saber el destino, la ficha tendría que pedir la recomendación al abrirse, y hoy cada `POST /api/recomendar` guarda una búsqueda en la base, lo que inflaría las métricas del panel de redirecciones. Opción: un endpoint de solo lectura que no registre la búsqueda.
- [ ] **B2. Un solo botón principal, fijo al pie de la ficha.** "Mejor ve a…" es el principal cuando el lugar no está en verde; "Estoy aquí" pasa a secundario.
  - *Por qué:* jerarquía visual. Dos botones con el mismo peso obligan a decidir sin ayuda.
  - *Listo cuando:* el botón principal se ve sin bajar, en celular y en computadora.
- [ ] **B3. Sugerir sin que lo pidan.**
  - Arriba de la lista, una tarjeta destacada "Tu mejor opción ahora", con su botón.
  - En las tarjetas amarillas y rojas de la lista, un "Ver alternativa" directo.
  - *Por qué:* motivación. La app propone y el turista solo acepta.
- [ ] **B4. Respuesta después de "Vamos".** "Te ahorraste la fila de ~25 min" o "Ayudas a repartir a los visitantes de Puebla".
  - *Por qué:* retroalimentación y motivación extrínseca: la acción tiene una recompensa visible.
  - ⚠️ Solo con datos reales (`espera_reportada`). Si no hay datos, va el mensaje genérico; no se inventan cifras.

## C. Guía y modelo mental

- [ ] **C1. Rehacer la guía de primer uso alrededor del flujo principal:** eliges un lugar → si está lleno, "Mejor ve a…" → al llegar, "📍 Estoy aquí". El botón Aa queda como nota breve en el último paso.
  - *Por qué:* modelos mentales. El primer contacto enseña qué hace la app, no dónde están las opciones.
- [ ] **C2. Un resumen de la lista que diga qué hacer.** "3 lugares tranquilos cerca. Empieza por X", en lugar de "3 lugares en buen momento".
  - *Por qué:* cada pantalla debe dejar claro el siguiente paso.

## D. Comprobarlo con usuarios (DCU)

- [ ] **D1. Prueba de tarea con 3–5 personas**, antes y después de los cambios.
  - Tarea: "Estás en el zócalo y la Catedral está llena. ¿Qué haces?"
  - Se mide si encuentran "Mejor ve a…", cuánto tardan y dónde se atoran. Al final se aplica el SUS (0–100; el promedio es ~68).
  - Sirve como evidencia de usabilidad para la entrega. La aplica el equipo de HCI: Angel, Axel, Diego y Yohualli.
