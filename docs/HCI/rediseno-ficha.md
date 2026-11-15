# Rediseño de la ficha del lugar

**Rama:** `feature/ficha-rediseno` (sale de `develop`)
**Fecha:** 2026-11-14
**Alcance:** solo frontend (`frontend/src`). No cambia el backend ni la base de datos.

**Objetivo:** que la ficha de un lugar responda primero "¿voy o no?" y luego muestre los datos ordenados en tarjetas fáciles de escanear, sin emojis y con el rosa de la marca. Aplica a **todos los lugares**, porque todas las fichas usan el mismo componente (`TarjetaPunto.jsx`).

---

## 1. Qué cambió

### 1.1 Estructura de la ficha

Con el panel ancho, la ficha va en dos columnas:

| Izquierda (lo principal) | Derecha (los datos, en tarjetas) |
|---|---|
| ← Todos los lugares | **Por qué tiene ese color**: la razón, la confianza ("Estimado con datos oficiales") y la barra **Gente ahora** |
| Destino (con ícono de pin) y nombre, con botones de **compartir** y **favorito** | **Las próximas horas** y el botón "¿Cuándo me conviene ir?" |
| Semáforo y **Escuchar** | **Clima por hora** (si hay datos) |
| **Conclusión**: "Hay algo de gente ahora." + qué hacer | **Tu visita**: traslado, tiempo sugerido, horario de hoy y entrada, cada uno con su ícono |
| Foto (con crédito encima y botón para ampliarla) | **Próximos eventos** (si hay) |
| Descripción | |
| Acciones: **Mejor ve a…** · **Estoy aquí** · **Cómo llegar** | |

Abajo, a todo lo ancho, van **las fuentes**, en una caja gris con ícono de información. En el panel angosto y en el celular todo va en una sola columna, en ese mismo orden.

### 1.2 Conclusión arriba de la ficha

Una frase grande, con una barra del color del semáforo a la izquierda, que responde "¿voy o no?" antes de cualquier dato. Sale del color actual y del pronóstico de las próximas 12 horas (`proximas_horas`), sin pedir nada nuevo al backend (`data/conclusion.js`).

| Estado | Frase | Debajo |
|---|---|---|
| Verde | Buen momento para ir. | Sigue tranquilo hasta las 17:00. |
| Amarillo | Hay algo de gente ahora. | Más tranquilo a las 18:00, o busca otra opción con «Mejor ve a…». |
| Rojo | Ahora está lleno. | Más tranquilo a las 17:00, o busca otra opción con «Mejor ve a…». |
| Cerrado | Ahora está cerrado. | Abre a las 10:00 / mañana a las 10:00 / Hoy ya no abre. |
| Sin dato | Todavía no sabemos cómo está. | Si vas, cuéntanos con «Estoy aquí». |

Si el pronóstico no muestra una hora mejor, la frase no inventa una. "Escuchar" también la lee, justo después del nombre.

### 1.3 Barra "Gente ahora" en rosa

- Una barra de **Menos** a **Más** con una marca donde está la afluencia ahora (`GenteAhora.jsx`). Usa `nivel` del backend: 1.0 es una hora normal para ese lugar y cae a la mitad de la barra.
- En un lugar cerrado o sin dato no sale, porque no hay nada que medir.
- La rampa de color pasó de **azul a rosa mexicano** (`data/calor.js`). La comparten la barra, el **mapa de calor** y su **leyenda**, para que el mismo dato se vea igual en todos lados.
- Para lector de pantalla es un `role="meter"` con texto ("Poca gente", "Gente como de costumbre", "Mucha gente").

### 1.4 Íconos de línea en vez de emojis

`Icono.jsx` dibuja íconos SVG de línea (basados en Lucide, licencia ISC) que toman el color del texto, así que respetan el modo de alto contraste. Reemplazan a 🔊, 📍, ☀️🌦🌧 y ★/☆:

- Escuchar → altavoz · Estoy aquí → pin · Cómo llegar → flecha de navegación · Mejor ve a… → flechas de intercambio
- Clima → sol, llovizna o lluvia · Favorito → corazón (vacío o lleno), también en la lista
- Tarjetas → gráfica, reloj, calendario, bolsa, coche o persona caminando, etiqueta e información

Son decorativos (`aria-hidden`): el texto de al lado dice qué significan.

### 1.5 Compartir

- Botón redondo junto al nombre (`BotonCompartir.jsx`). Comparte **solo el link de Google Maps** para llegar al lugar.
- **En celular** abre el menú de compartir del sistema (WhatsApp, etc.).
- **En compu**, como Chrome y Firefox en Linux no tienen ese menú, copia el link y muestra **"Enlace copiado"** debajo del botón durante 2.5 s. Si el navegador no tiene la API del portapapeles, usa un respaldo.
- Si el turista cierra el menú de compartir, no se muestra ningún error.

### 1.6 Foto

- El crédito de la licencia (autor y CC BY-SA) va **encima de la foto**, abajo a la izquierda, con ícono de cámara.
- **Botón para ampliarla**: abre un `<dialog>` que ocupa el 92 % del ancho o el 90 % del alto de la pantalla, lo que llegue primero. Se cierra con ✕, con Esc o con clic afuera.

### 1.7 "¿Cuándo me conviene ir?" en su propia vista

Antes, la tabla de la semana se abría dentro de la tarjeta y no cabía. Ahora (`VistaSemana.jsx`):

- **Animación:** la ficha sale hacia la izquierda y la semana entra desde la derecha, ocupando todo el panel. Con "reducir movimiento" activado en el sistema, cambia sin animación.
- **Para cerrar:** botón ✕, "← Volver a {lugar}" o Esc. La ficha regresa con animación y el foco vuelve al botón que abrió la semana.
- **Calendario mejorado:**
  - "**Próximo buen momento**" arriba en verde: la primera hora en verde que todavía no pasa ("Hoy a las 23:00").
  - Cuadros más grandes; la fila de **Hoy** en rosa, la **hora actual** con un aro rosa y las **horas que ya pasaron** rayadas y tenues.
  - Al **tocar un cuadro**, abajo dice "El lunes 16 a las 10:00: Con precaución".
  - **Leyenda** de colores y un apartado **"Día por día"** con la hora más tranquila y la más llena de cada día.
  - En panel angosto la tabla se compacta y muestra una hora sí y una no en el encabezado, para que quepa sin deslizar.

### 1.8 Ancho del panel ajustable

- Con la ficha, la recomendación o "Ver todos" abiertos, el **borde derecho del panel** se puede arrastrar para hacerlo más ancho o más angosto (`BordePanel.jsx`). Mínimo 400 px; máximo, el ancho de la ventana menos 160 px.
- **Doble clic** en el borde regresa al ancho normal.
- Con **teclado**: Tab hasta el borde y flechas (40 px; con Shift, 120 px). Inicio regresa al ancho normal. Es un `role="separator"` con su valor.
- El ancho elegido se recuerda en el navegador (`localStorage`). Solo en compu; en celular el panel sigue siendo la hoja de abajo.

### 1.9 Detalles de texto

- Letra un poco más grande: cuerpo 17 px, metadatos 15 px, subtítulos 19 px (variables `--t-*` en `index.css`; siguen en `rem`, así que el botón Aa las sigue escalando).
- Las razones ya no van en caja gris: son texto con un punto rosa.
- "📍 Estoy aquí" → "Estoy aquí" (el ícono ahora es SVG). "Cómo llegar en Google Maps" → "Cómo llegar"; para lector de pantalla se agrega "en Google Maps (se abre en otra pestaña)".

---

## 2. Por qué (principios de IPM)

| Cambio | Principio |
|---|---|
| Conclusión arriba | **Atención y carga cognitiva:** el turista llega con una sola pregunta; la respuesta va primero y en una línea, para que no tenga que sacar la conclusión de los datos. |
| Datos en tarjetas con título e ícono | **Gestalt (proximidad y región común):** lo que va junto se agrupa en una tarjeta; el título dice de qué trata cada grupo. |
| Razones sin caja gris | **Figura-fondo:** cuando todo va en cajas iguales, nada destaca. |
| Íconos de línea en vez de emojis | **Consistencia:** un solo estilo visual que respeta el alto contraste; los emojis cambian según el sistema operativo. |
| Barra de gente en rosa | **Consistencia y semántica del color:** la afluencia es una magnitud (rampa de un solo tono); los colores del semáforo quedan reservados al estado. |
| Semana en su propia vista | **Divulgación progresiva:** el detalle de 10 días solo aparece si se pide, y ocupa el espacio que necesita. |
| "Próximo buen momento" | **Reconocer en vez de recordar:** la app da la respuesta en vez de que el turista la busque en 180 cuadros. |
| Horas pasadas rayadas, hora actual marcada | **Visibilidad del estado del sistema (Nielsen 1).** |
| Esc, ✕ y "Volver" para cerrar; el foco regresa | **Control y libertad del usuario (Nielsen 3)** y accesibilidad con teclado. |
| Panel de ancho ajustable | **Flexibilidad y eficiencia (Nielsen 7):** cada quien ajusta el espacio entre mapa y ficha. |
| Aviso "Enlace copiado" | **Retroalimentación:** sin el aviso, el botón parecía no hacer nada. |

---

## 3. Archivos

**Nuevos**

| Archivo | Qué hace |
|---|---|
| `components/Icono.jsx` | Íconos SVG de línea |
| `components/GenteAhora.jsx` | Barra "Gente ahora" |
| `components/BotonCompartir.jsx` | Compartir el link de Google Maps |
| `components/VistaSemana.jsx` | Vista de "¿Cuándo me conviene ir?" |
| `components/BordePanel.jsx` | Borde arrastrable del panel |
| `data/conclusion.js` | Lógica de la frase de conclusión |

**Modificados:** `TarjetaPunto.jsx` (estructura de la ficha y cambio a la vista de la semana), `Semana.jsx` (ahora solo es el botón), `Foto.jsx` (crédito encima y foto ampliable), `BotonEscuchar.jsx`, `BotonFavorito.jsx` y `Recomendacion.jsx` (íconos y tamaños), `pages/Turista.jsx` (ancho del panel), `data/calor.js` (rampa rosa), `i18n/textos.js` (textos nuevos en español e inglés) e `index.css` (estilos).

---

## 4. Cómo probarlo

1. Abre un lugar en verde y uno en amarillo o rojo: revisa la conclusión, la barra de Gente ahora y las tarjetas.
2. **Compartir:** en compu debe salir "Enlace copiado"; pega el link en otra pestaña y debe abrir Google Maps.
3. **Foto:** amplíala y ciérrala con ✕, con Esc y con clic afuera.
4. **"¿Cuándo me conviene ir?":** revisa la animación, toca un cuadro y cierra con ✕, con "Volver" y con Esc.
5. **Ancho del panel:** arrástralo a la derecha y a la izquierda, haz doble clic para regresar al normal y recarga la página para ver que se recuerda.
6. **Celular** (F12 → Ctrl+Shift+M): todo en una columna y sin borde arrastrable.
7. **Accesibilidad:** activa el alto contraste y la letra grande (Aa) y recorre la ficha con Tab.

---

## 5. Decisiones y pendientes

- El botón dice **"Mejor ve a…"** y no "Mejor momento para ir" (como en el mockup), porque recomienda **otro lugar**, no otra hora.
- En la conclusión, "o ve a X" con el nombre del lugar necesita un endpoint de solo lectura para la recomendación: hoy `POST /api/recomendar` registra una búsqueda e inflaría las métricas del panel.
- El **corazón de favoritos** solo aparece con las cuentas configuradas (`frontend/.env.local`).
- Las fotos son de 900×600 px; ampliadas en pantallas grandes se ven un poco suaves.
