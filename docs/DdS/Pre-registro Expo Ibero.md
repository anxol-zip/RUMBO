# Pre-registro Expo Ibero — Diseño de Software

> **Borrador** del 7 de noviembre de 2026. El pre-registro lo envía el representante (Angel) en la plataforma INNOVA (EXIBINGP-O26), antes del domingo 8 de noviembre a las 23:59. Solo se permite un pre-registro por proyecto, y sin él no se puede pasar a la entrega de documentos. El registro de Interacción Persona Máquina se hace por separado.

| Campo | Valor |
| --- | --- |
| Título completo (sin acentos) | RUMBO: Redistribucion Unificada con Mapas, Busquedas y Opiniones |
| Modalidad | Prototipo |
| Autores | Angel Rugerio Jimenez (201720), Axel Garcia Arellano (201251), Diego Navarro Sanchez (202497), Yohualli Ollin Luna Reyes (189670), Cristian Alexei Romero Martinez (203739) |
| Carrera(s) | Licenciatura en Ingeniería en Sistemas Computacionales (los cinco) |
| Semestre | 5° (Cristian Alexei Romero Martínez: 3°) |
| Materia | Diseño de Software (LIIS1208, clave del pie de las láminas de la sesión 22) |
| Profesor responsable | Mtro. Rafael Pérez Aguirre |
| Palabras clave | turismo, redistribucion de afluencia, sistema de recomendacion, inteligencia artificial, RAG, MCP, datos abiertos, Puebla |
| Línea de investigación | Automatización Inteligencia Artificial e Internet de las Cosas |
| Licencia Creative Commons | *Pendiente* (propuesta: CC BY-NC-SA 4.0) |
| Correo de contacto principal | 201720@iberopuebla.mx |

## Resumen (196 palabras; máximo 200)

Los turistas que visitan la zona Puebla-Cholula-Atlixco se concentran en pocos puntos muy conocidos, lo que los satura y empeora la experiencia, mientras que lugares cercanos y menos conocidos reciben poca afluencia. RUMBO es una aplicación web que busca repartir mejor a esos visitantes. Para estimar la afluencia de 23 puntos turísticos, extraemos y normalizamos datos oficiales reales, publicados en distintos formatos (PDF, hojas de cálculo y CSV) por el Observatorio Turístico de Puebla, el INAH y el INEGI, y los combinamos en vivo con el clima, el tráfico y los reportes de los propios usuarios. Así, un semáforo sobre el mapa muestra el estado actual de cada lugar, y el turista recibe recomendaciones cercanas y menos concurridas según sus gustos y su tiempo disponible. Un asistente de inteligencia artificial con generación aumentada por recuperación (RAG) responde preguntas usando únicamente los datos del sistema y cita sus fuentes, y un servidor MCP permite que otros modelos de lenguaje consulten esa misma información. El administrador cuenta con un panel de redirecciones, derrama económica estimada y reportes. La aplicación contará con inicio de sesión para turistas y administradores, lógica en capas con pruebas automatizadas y opciones de accesibilidad.

**Criterios de redacción:** el inicio plantea el problema. El cuerpo explica de dónde salen los datos (fuentes oficiales reales, extraídas de PDF, hojas de cálculo y CSV, y normalizadas) y qué se actualiza en vivo (clima, tráfico y reportes), además del asistente con RAG y el servidor MCP. "En vivo" se dice del estado y el semáforo, no de las fuentes oficiales, que se publican cada mes. El inicio de sesión va en futuro porque todavía no existe; lo demás ya funciona. No se nombra la tecnología de la base, para que el resumen siga siendo cierto haya o no migración a Firebase.
