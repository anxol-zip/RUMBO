# Rediseño del perfil y de la ficha del lugar

**Rama:** `feature/perfil-y-ficha` (sale de `develop`)
**Fecha:** 2026-11-17
**Alcance:** solo frontend (`frontend/src`). No cambia el backend ni la base de datos.

**Origen:** revisión de un recorrido grabado de la app (83 s, 2026-11-17). Continúa [`rediseno-ficha.md`](rediseno-ficha.md): la conclusión arriba, los íconos de línea, la vista de la semana y el borde ajustable siguen igual. Lo que cambia de ese documento está en §2.

---

## 1. Problemas encontrados en el recorrido

| # | Dónde | Qué pasaba | Principio |
|---|---|---|---|
| 1 | Ficha | Ocho bloques del mismo peso a la vista. El turista llega con una sola pregunta. | Carga cognitiva, memoria de trabajo (4 ± 1) |
| 2 | Ficha | Tres señales de afluencia que se contradecían: chip «Con precaución», barra «Gente ahora» al máximo y título «Movimiento normal». | Consistencia (Nielsen 4) |
| 3 | Ficha | El título de la tarjeta de datos era la primera razón, así que cambiaba en cada lugar. | Consistencia, escaneo |
| 4 | Ficha | 8 horas en 7 columnas: las 22:00 quedaban solas en otro renglón. | Gestalt (proximidad) |
| 5 | Ficha | En un lugar cerrado, ocho cuadros de «cerrado». | Relación señal-ruido |
| 6 | Ficha | «Por confirmar» dos veces y «00:00-24:00». | Coincidencia con el mundo real (Nielsen 2) |
| 7 | Ficha | Texto interno de la base a la vista («coordenada: DENUE 05/2026…»), en español aunque la interfaz esté en inglés. | Lenguaje del usuario (HCI A4) |
| 8 | Ficha | El formulario de reseña vacío era el bloque más grande. | Jerarquía visual |
| 9 | Ficha | Con el panel en dos columnas, «Cómo llegar» quedaba sola en un renglón. | Gestalt, jerarquía |
| 10 | Ficha | Después de «Estoy aquí», la ficha volvía al esqueleto y perdía el scroll. | Visibilidad del estado (Nielsen 1) |
| 11 | Mapa | El marcador de «cerrado» (cuadro con «–») era igual al botón de alejar. | Prevención de errores (Nielsen 5) |
| 12 | Cabecera | El botón de la cuenta decía «RUGERIO»: las cuentas institucionales llegan como «APELLIDOS NOMBRE». | Lenguaje del usuario |
| 13 | Perfil | Un desplegable pequeño con los Favoritos como texto, sin las reseñas propias ni los gustos. | Reconocer en vez de recordar (Nielsen 6) |

## 2. Qué cambió

### 2.1 Panel de perfil

El avatar con iniciales (azul talavera) abre un panel lateral a la derecha, a toda la altura. La ficha vive a la izquierda y el mapa queda en medio. Tiene tres pestañas:

- **Favoritos:** foto, destino y **cómo están ahora**, con el semáforo. Primero van los que conviene visitar. Un Favorito deja de ser un marcador y se vuelve una razón para abrir la app.
- **Mis reseñas:** lugar con foto, estrellas, fecha, texto, si moderación la ocultó, a cuántos les sirvió y un enlace para verla o editarla en el lugar.
- **Mis gustos:** los intereses del inicio, editables, con «Gustos guardados» como confirmación.

El botón **Ampliar** cambia la lista por una cuadrícula con fotos grandes, y la app lo recuerda en ese navegador. Las pestañas se recorren con flechas, Inicio y Fin; Esc cierra el panel y el foco regresa al avatar. En el celular, el panel ocupa toda la pantalla.

No hay endpoints nuevos. Las reseñas propias las permite la política RLS `leer reseñas` (`usuario_id = auth.uid()`) y el estado sale del semáforo público.

### 2.2 Ficha del lugar

Pasa a **una sola columna**: una respuesta, tres datos y una acción.

| A la vista | Plegado (`<details>`) |
|---|---|
| Foto de portada, nombre, semáforo y **Escuchar** | **¿Por qué está así?**: razones, confianza, ajustes |
| **Conclusión** («Hay algo de gente ahora. Más tranquilo a las 21:00») | **Clima por hora**, si hay datos |
| **Las próximas horas** en una tira de 8 (o 4 con letra grande) | **Próximos eventos**, con cuántos son |
| Datos de la visita en un renglón: «2 min a pie», «Hoy 10:00–17:00», «1-2 h de visita», «Entrada $48» | **¿De dónde salen estos datos?** |
| Barra de acciones fija | |

Debajo quedan **¿Cuándo me conviene ir?** (la vista de la semana, igual que antes) y las **Reseñas**.

- **Se quita la barra «Gente ahora»** (`GenteAhora.jsx`): duplicaba al semáforo y a veces lo contradecía. El mapa de calor y su leyenda siguen con la misma rampa rosa.
- **En un lugar cerrado** no sale la tira de horas: lo dice la conclusión.
- **Lo que no se sabe no aparece**, y «00:00-24:00» se lee «Abierto las 24 horas» (`data/hechos.js`).
- **Acciones:** con tres botones, el principal («Mejor ve a…») va solo arriba y los otros dos debajo. En un panel ancho, los tres van en un renglón.
- **Reseñas:** el formulario se abre con «Escribir una reseña» y el foco entra a las estrellas; «Cancelar» lo regresa al botón. Si la sesión venció a media reseña, el formulario se abre con lo escrito.
- **Foto:** 16:9 y a lo mucho el 26 % del alto de la pantalla, para que con letra grande la conclusión no quede debajo de la barra de acciones.

### 2.3 Correcciones

- **Marcador de cerrado:** lleva un candado dibujado en lugar de «–», en el mapa, en la leyenda y en los chips.
- **Después de «Estoy aquí»**, la ficha se vuelve a pedir sin desmontarse: lo que ya se veía se queda hasta que llega lo nuevo.

## 3. Archivos

| Archivo | Qué hace |
|---|---|
| `cuenta/PanelPerfil.jsx` | Panel de perfil: contenedor (datos) y `VistaPerfil` (pantalla) |
| `cuenta/datosPerfil.js` | Mis reseñas (Supabase) y el semáforo de ahora |
| `cuenta/ordenFavoritos.js` | Orden de los Favoritos por conveniencia (con pruebas) |
| `cuenta/nombre.js` | Nombre en formato de título e iniciales (con pruebas) |
| `data/hechos.js` | Datos de la visita y horario legible (con pruebas) |

**Modificados:** `BotonCuenta.jsx` (avatar y panel en lugar del menú), `TarjetaPunto.jsx` (estructura), `Resenas.jsx` (formulario plegado), `data/formas.js` e `IconoEstado.jsx` (candado), `pages/Turista.jsx` (`revision` en lugar de `key`), `cuenta/Cuenta.jsx` (`guardarGustos` devuelve si se guardó), `Icono.jsx` (reducir y estrella), `i18n/textos.js` e `index.css`.

**Pruebas:** `node --test src/cuenta/*.test.js src/data/*.test.js` (22 pruebas).

## 4. Cómo probarlo

1. **Perfil:** inicia sesión y pica el avatar. Revisa las tres pestañas, amplía el panel, quita un Favorito, cambia tus gustos y ciérralo con Esc.
2. **Ficha:** abre un lugar en verde, uno en amarillo y la Catedral fuera de horario. La conclusión debe verse sin bajar.
3. **Plegables:** ábrelos con el mouse y con Tab + Enter.
4. **Reseña:** «Escribir una reseña» → «Cancelar»: el foco regresa al botón.
5. **Estoy aquí:** reporta y verifica que la ficha no vuelva al esqueleto.
6. **Letra grande y celular** (F12 → Ctrl+Shift+M).

## 5. Segunda ronda (2026-11-17)

| Cambio | Principio |
|---|---|
| **La lista** dice lo que distingue a cada lugar (lluvia, evento, ajuste, qué tan lleno está o con qué gustos coincide) en lugar de repetir el estado del chip (`data/detalleLista.js`). | Relación señal-ruido |
| **«Mejor ve a…»** en una columna: lo que pediste en un renglón, la alternativa con su foto y «Vamos» en la barra fija; antes quedaba fuera de la vista a 1280×800. | Visibilidad, jerarquía |
| **La semana** cambia «Día por día» por «En resumen»: el día más tranquilo, el más lleno con el rango a evitar y la hora tranquila que se repite (`data/resumenSemana.js`). | Reconocer en vez de recordar |
| **Regresa «Gente ahora»**, medida contra los umbrales del propio lugar: tres tramos (tranquilo, lo habitual, lleno), y la marca cae siempre en el del color del semáforo (`data/genteAhora.js`). La versión anterior usaba una escala global y lo contradecía. | Consistencia (Nielsen 4) |
| **Reseñas**: el cuerpo del panel vuelve a tener margen abajo y el scroll ya no rebota hacia el mapa. | Visibilidad |
| **«Ver todos»**: el encabezado de cada grupo es una franja de vidrio que se desvanece; ya no se ven tarjetas cortadas alrededor de la pastilla. | Figura-fondo |
| **Panel de la Secretaría** en cuatro pestañas (Resumen, Moderación, Fijar color, Observatorio), con «Requiere atención» primero, y traducido. | Carga cognitiva, jerarquía |

**Actividad del stand:** el interruptor «Incluir actividad de demostración» se queda como «Qué actividad contar: Toda / Sin el stand de la Expo». Separar las bases de desarrollo y de datos reales no lo cubre: el stand (API con `PUEBLA_DEMO=1`) y los turistas reales escriben en la misma base, y RN_11 pide poder separarlos.

## 6. Pendiente

- **«Mejor ve a…» todavía no dice a dónde** (HCI B1): depende de un endpoint de recomendación de solo lectura (backend, Axel).
- **Probar con una sesión real de administrador** el panel (moderación y fijar color) y, con una de turista, «Mis reseñas» y «Mis gustos». Se revisaron con una cuenta simulada y una muestra de solo lectura de la base de desarrollo.
