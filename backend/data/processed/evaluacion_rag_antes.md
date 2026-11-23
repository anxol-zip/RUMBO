# Evaluación del asistente (RAG)

Modelo `qwen3:4b-instruct`, embeddings `bge-m3`, momento 2026-11-27 13:00, corrida 2026-11-23 05:55.

## Resumen

- Recuperación (hit): 21/23
- Fidelidad (sin números inventados): 28/28
- 'No tengo ese dato' cuando no hay dato: 5/5
- Citas válidas: 24/28
- Atributos correctos (techado, color, tranquilo): 28/28
- Tiempo: promedio 12.8 s, máximo 18.5 s

## 1. ¿A qué hora abre la Biblioteca Palafoxiana y cuánto cuesta?

- Recuperación: acierto (esperado ['punto-3'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-3']
- Tiempo: 10.7 s · recuperados: ['punto-3', 'punto-7', 'punto-20', 'obs-2', 'obs-11', 'metodo-semaforo', 'obs-20']

> La Biblioteca Palafoxiana abre a las 10:00 y cuesta $48. [punto-3]

## 2. ¿Qué puedo visitar techado si llueve en el centro de Puebla?

- Recuperación: acierto (esperado ['punto-1', 'punto-10', 'punto-2', 'punto-22', 'punto-3', 'punto-7'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-17', 'punto-11', 'punto-1', 'punto-14', 'obs-3']
- Tiempo: 16.1 s · recuperados: ['punto-1', 'punto-21', 'punto-11', 'fuentes', 'metodo-semaforo', 'obs-3', 'obs-18']

> Puedes visitar:  
> 1) [punto-17] Exconvento de Huejotzingo: AMARILLO, techado, visita sugerida 1-2 h.  
> 2) [punto-11] Estrella de Puebla: AMARILLO, techado, visita sugerida 45 min.  
> 3) [punto-1] Catedral de Puebla: AMARILLO, techado, visita sugerida 1-2 h.  
> 4) [punto-14] Exconvento de San Gabriel y Capilla Real: AMARILLO, techado, visita sugerida 45 min.  
> 
> Todos son techados y adecuados para lluvia. [obs-3]

## 3. ¿Cómo está la Pirámide de Cholula ahora?

- Recuperación: acierto (esperado ['punto-12'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-12']
- Tiempo: 11.6 s · recuperados: ['punto-12', 'punto-13', 'punto-14', 'punto-16', 'obs-15', 'inah-3110009', 'obs-13', 'obs-4']

> La Pirámide de Cholula ahora está en AMARILLO (movimiento normal para ese lugar) y tiene un pronóstico de lluvia moderada. [punto-12]

## 4. Estoy en el Zócalo y tengo 3 horas, ¿qué me recomiendas?

- Recuperación: acierto (esperado ['punto-21'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-1', 'punto-6', 'punto-9']
- Tiempo: 17.0 s · recuperados: ['punto-21', 'punto-1', 'punto-5', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Te recomendamos visitar la **Catedral de Puebla** [punto-1]: es techado, ideal para la lluvia moderada, con visita sugerida de 1-2 h y solo 2 minutos a pie.  
> Otra opción es el **Barrio del Artista y El Parián** [punto-6]: VERDE (tranquilo), al aire libre, con visita sugerida de 1 h y 10 minutos a pie.  
> También puedes ir a la **Zona de los Fuertes (Loreto y Guadalupe)** [punto-9]: VERDE (tranquilo), al aire libre, con visita sugerida de 2 h y 10 minutos en coche.  
> [Nota: todos los lugares están abiertos y en movimiento normal, sin rojo ni cerrado.]

## 5. ¿Cuándo es el Valle de Catrinas?

- Recuperación: **falla** (esperado ['evento-1'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 10.1 s · recuperados: ['punto-18', 'punto-19', 'punto-17', 'punto-9', 'inah-2403400', 'obs-22', 'obs-6', 'metodo-recomendador']

> No tengo ese dato.

## 6. ¿Qué días hay funciones de Catrinia?

- Recuperación: **falla** (esperado ['evento-2'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 9.6 s · recuperados: ['punto-18', 'punto-16', 'punto-17', 'fuentes', 'metodo-recomendador', 'metodo-semaforo', 'inah-2403100']

> No tengo ese dato.

## 7. ¿Cuántos turistas llegan a Atlixco?

- Recuperación: acierto (esperado ['obs-2'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['obs-2']
- Tiempo: 10.4 s · recuperados: ['punto-18', 'punto-19', 'punto-16', 'punto-11', 'punto-12', 'punto-3', 'obs-2', 'obs-1', 'obs-21', 'obs-20']

> 217,090 llegadas de turistas [obs-2].

## 8. ¿Qué porcentaje de las visitas a recintos del INAH en Puebla tuvo la zona arqueológica de Cholula en 2025?

- Recuperación: acierto (esperado ['inah-3110009'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['inah-3110009']
- Tiempo: 11.2 s · recuperados: ['punto-12', 'punto-1', 'punto-11', 'punto-16', 'inah-3110009', 'inah-2301400', 'inah-4100017', 'inah-3120128']

> El 39.7 % de las visitas a recintos del INAH en Puebla tuvo la Zona Arqueológica de Cholula en 2025 [inah-3110009].

## 9. ¿Cómo sabe la app que un lugar está lleno?

- Recuperación: acierto (esperado ['metodo-semaforo'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['metodo-semaforo']
- Tiempo: 13.8 s · recuperados: ['punto-12', 'punto-20', 'punto-21', 'punto-1', 'metodo-semaforo', 'metodo-recomendador', 'metodo-reportes', 'fuentes']

> La app sabe que un lugar está lleno por la estimación de afluencia basada en datos oficiales mensuales (como INAH o el Observatorio Turístico), ajustada con factores de hora, día, eventos y reportes de turistas en vivo. Si un lugar está más lleno que en el 85 % de sus horas abiertas de 2023 a 2025, se muestra en rojo. [metodo-semaforo]

## 10. ¿Para qué sirve el botón ¿Cómo está?

- Recuperación: acierto (esperado ['metodo-reportes'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['metodo-reportes']
- Tiempo: 15.5 s · recuperados: ['punto-21', 'punto-3', 'punto-7', 'punto-18', 'metodo-recomendador', 'metodo-reportes', 'metodo-semaforo', 'fuentes']

> El botón ¿Cómo está? permite a los turistas enviar un reporte sobre su experiencia en un lugar, que se mezcla con la estimación oficial de la app para determinar el color del semáforo (verde, amarillo o rojo). Cada reporte cuenta con peso, que disminuye con el tiempo (a los 45 minutos vale cerca de un tercio, después de 3 horas ya no cuenta), y solo se aceptan reportes válidos cada 30 minutos por persona y lugar. Si hay 3 o más reportes válidos en la última hora, el lugar se marca como "confirmado por turistas". [metodo-reportes]

## 11. ¿Qué hay para ir con niños?

- Recuperación: acierto (esperado ['punto-11', 'punto-20', 'punto-23', 'punto-9'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-17', 'punto-18', 'punto-11']
- Tiempo: 14.8 s · recuperados: ['punto-20', 'punto-18', 'punto-17', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Para ir con niños, se recomienda el Exconvento de Huejotzingo [punto-17], que tiene interés en historia y gastronomía, y es techado, ideal para lluvia moderada. También se puede ir al Centro de Atlixco [punto-18], con intereses en compras y gastronomía, y es al aire libre, aunque con lluvia moderada.  
> Opción alternativa: Estrella de Puebla [punto-11], techado, visita sugerida en 45 minutos, ideal para familias y niños. [punto-11]

## 12. ¿Abre hoy el Museo Amparo?

- Recuperación: acierto (esperado ['punto-4'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-4']
- Tiempo: 10.5 s · recuperados: ['punto-4', 'punto-22', 'punto-9', 'metodo-semaforo', 'inah-4100014', 'fuentes', 'inah-4100015']

> No, el Museo Amparo está cerrado hoy. [punto-4]

## 13. ¿Cuánto cuesta entrar a Africam Safari?

- Recuperación: acierto (esperado ['punto-20'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-20']
- Tiempo: 10.5 s · recuperados: ['punto-20', 'punto-12', 'punto-18', 'punto-7', 'metodo-recomendador', 'obs-1', 'obs-4', 'obs-8']

> Entrar a Africam Safari cuesta $550 [punto-20].

## 14. ¿Dónde puedo comprar artesanías y Talavera?

- Recuperación: acierto (esperado ['punto-6'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-6']
- Tiempo: 12.9 s · recuperados: ['punto-6', 'punto-5', 'punto-16', 'punto-7', 'punto-18', 'punto-3', 'fuentes', 'inah-4100015', 'inah-4100014', 'obs-17']

> Puedes comprar artesanías y Talavera en el Barrio del Artista y El Parián [punto-6].  
> Es al aire libre y está en estado VERDE (tranquilo), aunque hay lluvia moderada pronosticada.  
> La visita sugerida es de 1 hora. [punto-6]

## 15. ¿De dónde salen los datos de la app?

- Recuperación: acierto (esperado ['fuentes'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['fuentes']
- Tiempo: 16.0 s · recuperados: ['punto-20', 'punto-5', 'punto-12', 'punto-21', 'punto-3', 'punto-11', 'punto-17', 'fuentes', 'metodo-recomendador', 'metodo-reportes', 'metodo-semaforo']

> Los datos de la app provienen de:  
> - Observatorio Turístico de Puebla [fuentes]  
> - INAH, reporte detallado Puebla [fuentes]  
> - DENUE (INEGI) 05/2026 [fuentes]  
> - Catálogo de la zona piloto (equipo) [fuentes]  
> - OpenRouteService para traslados [fuentes]  
> - Open-Meteo para el pronóstico de lluvia [fuentes]  
> - Mapas y coordenadas de OpenStreetMap [fuentes]  
> - Tráfico en vivo de TomTom [fuentes]

## 16. ¿Dónde puedo comer cerca de la Pirámide de Cholula?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ['punto-12'] · fuentes: ['denue-21140722330000151000000000U8', 'denue-21140722511000672001000000U8', 'denue-21119722511004211000000000U5']
- Tiempo: 18.5 s · recuperados: ['denue-21140722330000151000000000U8', 'denue-21140722511000672001000000U8', 'denue-21119722511004211000000000U5']

> [denue-21140722330000151000000000U8] Cholulquliza. Comida: servicios de preparación de alimentos en unidades móviles (0 a 5 personas), en San Pedro Cholula; a 308 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide).  
> [denue-21140722511000672001000000U8] Chez Marie. Comida: restaurantes con servicio de preparación de alimentos a la carta o de comida corrida (0 a 5 personas), en San Pedro Cholula; a 466 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide).  
> [denue-21119722511004211000000000U5] Barra Pagana. Comida: restaurantes con servicio de preparación de alimentos a la carta o de comida corrida (0 a 5 personas), en San Andrés Cholula; a 532 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide).

## 17. Estoy en el Zócalo, ¿dónde puedo desayunar?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-21114722110003543001000000U4', 'denue-21114722110003323001000000U1', 'denue-21114722219033132001000000U9']
- Tiempo: 16.8 s · recuperados: ['denue-21114722110003543001000000U4', 'denue-21114722110003323001000000U1', 'denue-21114722219033132001000000U9']

> [denue-21114722110003543001000000U4] The Italian Coffee. Comida: cafeterías, fuentes de sodas, neverías, refresquerías y similares (6 a 10 personas), a 194 m en línea recta de Zócalo de Puebla.  
> [denue-21114722110003323001000000U1] The Italian Coffee. Comida: cafeterías, fuentes de sodas, neverías, refresquerías y similares (0 a 5 personas), a 103 m en línea recta de Zócalo de Puebla.  
> [denue-21114722219033132001000000U9] The Italian Coffee Company. Comida: cafeterías, fuentes de sodas, neverías, refresquerías y similares (6 a 10 personas), a 55 m en línea recta de Zócalo de Puebla.

## 18. ¿Hay hoteles en el centro de Atlixco?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-21019721112000021001000000U2', 'denue-21019721112000271000000000U3', 'denue-21019721111000211000000000U1']
- Tiempo: 16.6 s · recuperados: ['denue-21019721112000021001000000U2', 'denue-21019721112000271000000000U3', 'denue-21019721111000211000000000U1']

> [denue-21019721112000021001000000U2] Hotel Atlixco. Hospedaje: hoteles sin otros servicios integrados (0 a 5 personas), en Atlixco; a 112 m en línea recta de Centro de Atlixco. [denue-21019721112000271000000000U3] Hotel Atlix. Hospedaje: hoteles sin otros servicios integrados (0 a 5 personas), en Atlixco; a 540 m en línea recta de Centro de Atlixco. [denue-21019721111000211000000000U1] Hotel Casa Flora. Hospedaje: hoteles con otros servicios integrados (11 a 30 personas), en Atlixco; a 819 m en línea recta de Centro de Atlixco.

## 19. ¿Qué restaurante me recomiendas para comer mole?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 8.7 s · recuperados: ['denue-21114722511010602001000000U8', 'denue-21119722511004621000000000U5', 'denue-21119722511001371000000000U0']

> No tengo ese dato.

## 20. Tengo 4 horas y va a llover, ¿qué hago?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ['obs-3'] · fuentes: ['punto-11', 'punto-17', 'punto-14']
- Tiempo: 15.8 s · recuperados: ['punto-1', 'punto-20', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Dado que va a llover y solo puedes ir a lugares techados, te recomiendo:  
> 1) [punto-11] Estrella de Puebla: techado, visita sugerida 45 min, AMARILLO (movimiento normal).  
> 2) [punto-17] Exconvento de Huejotzingo: techado, visita sugerida 1-2 h, AMARILLO (movimiento normal).  
> 3) [punto-14] Exconvento de San Gabriel y Capilla Real: techado, visita sugerida 45 min, AMARILLO (movimiento normal).  
> 
> Todos están disponibles, techados y con movimiento normal. No tengo ese dato.

## 21. Tengo 4 horas y va a llover, ¿qué hago?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ['obs-3'] · fuentes: ['punto-1', 'punto-11', 'punto-3']
- Tiempo: 16.1 s · recuperados: ['punto-1', 'punto-20', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Con lluvia, la app recomienda lugares techados. Tienes 4 horas y puedes hacer:  
> 1) [punto-1] Catedral de Puebla: AMARILLO (movimiento normal), techado, visita sugerida 1-2 h, 2 min a pie.  
> 2) [punto-11] Estrella de Puebla: AMARILLO (movimiento normal), techado, visita sugerida 45 min, 17 min en coche.  
> 3) [punto-3] Biblioteca Palafoxiana: AMARILLO (movimiento normal), techado, visita sugerida 30-60 min, 2 min a pie.  
> 

## 22. ¿Qué hay tranquilo cerca de mí?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ['obs-3'] · fuentes: ['punto-6', 'punto-9']
- Tiempo: 14.6 s · recuperados: ['punto-8', 'punto-19', 'punto-20', 'punto-18', 'punto-13', 'punto-17', 'punto-11', 'metodo-recomendador', 'fuentes', 'metodo-semaforo', 'metodo-reportes']

> Cerca de ti hay lugares tranquilos:  
> - [punto-6] Barrio del Artista y El Parián: VERDE (tranquilo), al aire libre, visita sugerida 1 h, 10 min a pie.  
> - [punto-9] Zona de los Fuertes (Loreto y Guadalupe): VERDE (tranquilo), al aire libre, visita sugerida 2 h, 10 min en coche.

## 23. ¿Cuándo conviene ir a la pirámide?

- Recuperación: acierto (esperado ['punto-12'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-12']
- Tiempo: 11.8 s · recuperados: ['punto-12', 'punto-13', 'punto-20', 'punto-19', 'punto-1', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'obs-21']

> Conviene ir a la pirámide a las 16:00, cuando está en verde (tranquilo) y es la hora más tranquila del día [punto-12].

## 24. ¿Cuánto cuesta un taxi del Zócalo a Cholula?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 10.0 s · recuperados: ['punto-14', 'punto-16', 'punto-12', 'punto-21', 'obs-13', 'obs-15', 'inah-3110009', 'obs-22']

> No tengo ese dato.

## 25. ¿Cuál es el restaurante mejor calificado de Puebla?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 8.6 s · recuperados: ['denue-21114722511002323000000000U1', 'denue-21114722511018285000017979S4', 'denue-21114722110000941003003155S3']

> No tengo ese dato.

## 26. ¿A qué hora sale el último tren a Cholula?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 9.8 s · recuperados: ['punto-12', 'punto-14', 'punto-13', 'punto-16', 'obs-15', 'obs-13', 'inah-3110009', 'fuentes']

> No tengo ese dato.

## 27. ¿Hay estacionamiento en el Museo Amparo?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 9.7 s · recuperados: ['punto-4', 'punto-21', 'punto-20', 'punto-13', 'metodo-recomendador', 'metodo-semaforo', 'inah-4100017', 'fuentes']

> No tengo ese dato.

## 28. ¿Cuántas personas visitaron la Pirámide de Cholula el sábado pasado?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Tiempo: 9.8 s · recuperados: ['punto-12', 'punto-13', 'punto-16', 'punto-14', 'obs-13', 'obs-15', 'inah-3110009', 'obs-4']

> No tengo ese dato.
