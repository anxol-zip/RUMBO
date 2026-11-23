# Evaluación del asistente (RAG)

Modelo `qwen3:4b-instruct`, embeddings `bge-m3-cpu`, momento 2026-11-27 13:00, corrida 2026-11-23 07:31.

## Resumen

- Recuperación (hit): 22/24
- Fidelidad (sin números inventados): 34/34
- 'No tengo ese dato' cuando no hay dato: 5/5
- Citas válidas: 34/34
- Atributos correctos (techado, color, tranquilo): 34/34
- Estilo (sin relleno, sin líneas copiadas, ≤ 4 oraciones): 33/34
- Seguimientos con el lugar correcto: 5/5
- Tiempo: promedio 5.7 s, máximo 9.0 s

## 1. ¿A qué hora abre la Biblioteca Palafoxiana y cuánto cuesta?

- Recuperación: acierto (esperado ['punto-3'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-3']
- Estilo: sin problemas
- Tiempo: 4.3 s · recuperados: ['punto-3', 'punto-7', 'punto-20', 'obs-2', 'obs-11', 'metodo-semaforo', 'obs-20']

> La Biblioteca Palafoxiana abre a las 10:00 y cuesta $48 [punto-3].

## 2. ¿Qué puedo visitar techado si llueve en el centro de Puebla?

- Recuperación: acierto (esperado ['punto-1', 'punto-10', 'punto-2', 'punto-22', 'punto-3', 'punto-7'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-1', 'punto-11']
- Estilo: sin problemas
- Tiempo: 5.8 s · recuperados: ['punto-1', 'punto-21', 'punto-11', 'fuentes', 'metodo-semaforo', 'obs-3', 'obs-18']

> Puedes visitar la Catedral de Puebla, que está techada y tiene movimiento normal [punto-1]. Otra opción es la Estrella de Puebla, también techada y con visita de 45 minutos [punto-11]. Toca el lugar en el mapa para ver cómo llegar.

## 3. ¿Cómo está la Pirámide de Cholula ahora?

- Recuperación: acierto (esperado ['punto-12'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-12']
- Estilo: sin problemas
- Tiempo: 9.0 s · recuperados: ['punto-12', 'punto-13', 'punto-14', 'punto-16', 'obs-15', 'inah-3110009', 'obs-13', 'obs-4']

> La Pirámide de Cholula ahora está con movimiento normal [punto-12]. Es al aire libre y hay lluvia moderada pronosticada. La hora más tranquila sería a las 16:00. Toca el lugar en el mapa para ver cómo llegar.

## 4. Estoy en el Zócalo y tengo 3 horas, ¿qué me recomiendas?

- Recuperación: acierto (esperado ['punto-21'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-21', 'punto-1', 'punto-6']
- Estilo: sin problemas
- Tiempo: 7.4 s · recuperados: ['punto-21', 'punto-1', 'punto-5', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Estás en el Zócalo, que tiene movimiento normal [punto-21]. Te recomiendo la Catedral de Puebla: está techada, es buena opción si llueve, y la visita dura 1-2 horas [punto-1]. También puedes ir al Barrio del Artista y El Parián, que está tranquilo y es al aire libre [punto-6]. Toca el lugar en el mapa para ver cómo llegar.

## 5. ¿Cuándo es el Valle de Catrinas?

- Recuperación: **falla** (esperado ['evento-1'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-18']
- Estilo: sin problemas
- Tiempo: 5.0 s · recuperados: ['punto-18', 'punto-19', 'punto-17', 'punto-9', 'inah-2403400', 'obs-22', 'obs-6', 'metodo-recomendador']

> El Valle de Catrinas se encuentra en otoño, cuando el clima es templado [punto-18]. Toca el lugar en el mapa para ver cómo llegar.

## 6. ¿Qué días hay funciones de Catrinia?

- Recuperación: **falla** (esperado ['evento-2'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-17']
- Estilo: sin problemas
- Tiempo: 6.1 s · recuperados: ['punto-18', 'punto-16', 'punto-17', 'fuentes', 'metodo-recomendador', 'metodo-semaforo', 'inah-2403100']

> No tengo ese dato. Pero si quieres, te puedo decir qué lugares te recomiendan ahora: el Exconvento de Huejotzingo, techado, 1-2 h [punto-17]. Toca el lugar en el mapa para ver cómo llegar.

## 7. ¿Cuántos turistas llegan a Atlixco?

- Recuperación: acierto (esperado ['obs-2'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['obs-2']
- Estilo: sin problemas
- Tiempo: 4.2 s · recuperados: ['punto-18', 'punto-19', 'punto-16', 'punto-11', 'punto-12', 'punto-3', 'obs-2', 'obs-1', 'obs-21', 'obs-20']

> 217,090 llegadas de turistas [obs-2].

## 8. ¿Qué porcentaje de las visitas a recintos del INAH en Puebla tuvo la zona arqueológica de Cholula en 2025?

- Recuperación: acierto (esperado ['inah-3110009'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['inah-3110009']
- Estilo: sin problemas
- Tiempo: 5.2 s · recuperados: ['punto-12', 'punto-1', 'punto-11', 'punto-16', 'inah-3110009', 'inah-2301400', 'inah-4100017', 'inah-3120128']

> La zona arqueológica de Cholula tuvo el 39.7 % de las visitas a recintos del INAH en Puebla en 2025 [inah-3110009].

## 9. ¿Cómo sabe la app que un lugar está lleno?

- Recuperación: acierto (esperado ['metodo-semaforo'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['metodo-reportes']
- Estilo: sin problemas
- Tiempo: 7.5 s · recuperados: ['punto-12', 'punto-20', 'punto-21', 'punto-1', 'metodo-semaforo', 'metodo-recomendador', 'metodo-reportes', 'fuentes']

> La app usa reportes de turistas en tiempo real y una estimación basada en datos oficiales mensuales (como los de INAH y el Observatorio Turístico) para saber si un lugar está lleno. Si hay 3 o más reportes válidos en la última hora, dice "confirmado por turistas". Los reportes se mezclan con la estimación, pero pierden peso con el tiempo: después de 3 horas ya no cuentan. [metodo-reportes]

## 10. ¿Para qué sirve el botón ¿Cómo está?

- Recuperación: acierto (esperado ['metodo-reportes'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['metodo-reportes']
- Estilo: sin problemas
- Tiempo: 6.8 s · recuperados: ['punto-21', 'punto-3', 'punto-7', 'punto-18', 'metodo-recomendador', 'metodo-reportes', 'metodo-semaforo', 'fuentes']

> El botón ¿Cómo está? permite a los turistas compartir su experiencia en un lugar, diciendo si está vacío, normal o lleno. Esa opinión se mezcla con la estimación de la app para saber cómo está el lugar en ese momento. Si hay 3 o más reportes válidos en la última hora, el lugar se marca como "confirmado por turistas". [metodo-reportes]

## 11. ¿Qué hay para ir con niños?

- Recuperación: acierto (esperado ['punto-11', 'punto-20', 'punto-23', 'punto-9'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-20', 'punto-17']
- Estilo: sin problemas
- Tiempo: 6.5 s · recuperados: ['punto-20', 'punto-18', 'punto-17', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Te recomiendo el Africam Safari: tiene movimiento normal, es al aire libre y tiene un plan familiar de día completo, ideal para niños [punto-20]. Otra opción es el Exconvento de Huejotzingo, que es techado y tiene interés en historia y gastronomía, aunque es más corto [punto-17]. Toca el lugar en el mapa para ver cómo llegar.

## 12. ¿Abre hoy el Museo Amparo?

- Recuperación: acierto (esperado ['punto-4'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-4']
- Estilo: sin problemas
- Tiempo: 4.2 s · recuperados: ['punto-4', 'punto-22', 'punto-9', 'metodo-semaforo', 'inah-4100014', 'fuentes', 'inah-4100015']

> No, el Museo Amparo está cerrado hoy [punto-4]. Toca el lugar en el mapa para ver cómo llegar.

## 13. ¿Cuánto cuesta entrar a Africam Safari?

- Recuperación: acierto (esperado ['punto-20'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-20']
- Estilo: sin problemas
- Tiempo: 4.0 s · recuperados: ['punto-20', 'punto-12', 'punto-18', 'punto-7', 'metodo-recomendador', 'obs-1', 'obs-4', 'obs-8']

> Entrar a Africam Safari cuesta $550 [punto-20].

## 14. ¿Dónde puedo comprar artesanías y Talavera?

- Recuperación: acierto (esperado ['punto-6'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-6']
- Estilo: sin problemas
- Tiempo: 5.8 s · recuperados: ['punto-6', 'punto-5', 'punto-16', 'punto-7', 'punto-18', 'punto-3', 'fuentes', 'inah-4100015', 'inah-4100014', 'obs-17']

> Puedes comprar artesanías y Talavera en el Barrio del Artista y El Parián. Está tranquilo, es al aire libre y tiene lluvia moderada ahora [punto-6]. Toca el lugar en el mapa para ver cómo llegar.

## 15. ¿De dónde salen los datos de la app?

- Recuperación: acierto (esperado ['fuentes'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['fuentes']
- Estilo: sin problemas
- Tiempo: 5.9 s · recuperados: ['punto-20', 'punto-5', 'punto-12', 'punto-21', 'punto-3', 'punto-11', 'punto-17', 'fuentes', 'metodo-recomendador', 'metodo-reportes', 'metodo-semaforo']

> Los datos de la app salen de fuentes oficiales como el Observatorio Turístico de Puebla, INAH, DENUE (INEGI), y de datos abiertos como OpenStreetMap y Open-Meteo. [fuentes]

## 16. ¿Dónde puedo comer cerca de la Pirámide de Cholula?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: sin problemas
- Tiempo: 8.9 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> Puedes comer en Cholulquliza, servicios de preparación de alimentos en unidades móviles, a 308 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide) [denue-1]. Otra opción es Chez Marie, restaurantes con servicio de preparación de alimentos a la carta o de comida corrida, a 466 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide) [denue-2]. También hay Barra Pagana, restaurantes con servicio de preparación de alimentos a la carta o de comida corrida, a 532 m en línea recta de Zona Arqueológica de Cholula (Gran Pirámide) [denue-3].

## 17. Estoy en el Zócalo, ¿dónde puedo desayunar?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: sin problemas
- Tiempo: 5.5 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> Te puedes encontrar con The Italian Coffee, que es una cafetería, a 194 m de Zócalo de Puebla [denue-1]. Otra opción es The Italian Coffee, que es una cafetería, a 103 m de Zócalo de Puebla [denue-2]. También hay The Italian Coffee Company, que es una cafetería, a 55 m de Zócalo de Puebla [denue-3].

## 18. ¿Hay hoteles en el centro de Atlixco?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: sin problemas
- Tiempo: 6.4 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> Sí, hay hoteles en el centro de Atlixco. [denue-1] Hotel Atlixco: hospedaje, a 112 m en línea recta de Centro de Atlixco. [denue-2] Hotel Atlix: hospedaje, a 540 m en línea recta de Centro de Atlixco. [denue-3] Hotel Casa Flora: hospedaje con otros servicios integrados, a 819 m en línea recta de Centro de Atlixco.

## 19. ¿Qué restaurante me recomiendas para comer mole?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: largo (5 oraciones)
- Tiempo: 8.1 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> No tengo ese dato. Pero sí tengo estos restaurantes:  
> - Come Bien Mr Loro: restaurantes con servicio de preparación de alimentos a la carta o de comida corrida (0 a 5 personas), a 847 m en línea recta de Capilla del Rosario (Templo de Santo Domingo) [denue-1]. - Mosto Voi: restaurantes con servicio de preparación de alimentos a la carta o de comida corrida (0 a 5 personas), a 960 m en línea recta de Museo Internacional del Barroco [denue-2]. - Dolce Mio: restaurantes con servicio de preparación de alimentos a la carta o de comida corrida (0 a 5 personas), a 507 m en línea recta de Santuario de la Virgen de los Remedios [denue-3].

## 20. Tengo 4 horas y va a llover, ¿qué hago?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-11', 'punto-17']
- Estilo: sin problemas
- Tiempo: 6.5 s · recuperados: ['punto-1', 'punto-20', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Te recomiendo ir a la Estrella de Puebla: tiene movimiento normal, es techado y la visita dura 45 min [punto-11]. Otra opción es el Exconvento de Huejotzingo, que también tiene movimiento normal, es techado y la visita dura 1-2 h [punto-17]. Toca el lugar en el mapa para ver cómo llegar.

## 21. Tengo 4 horas y va a llover, ¿qué hago?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-1', 'punto-11']
- Estilo: sin problemas
- Tiempo: 6.3 s · recuperados: ['punto-1', 'punto-20', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'fuentes']

> Te recomiendo la Catedral de Puebla: tiene movimiento normal, es techada y la visita dura 1-2 h [punto-1]. Otra opción es la Estrella de Puebla, que también tiene movimiento normal, es techada y dura 45 min [punto-11]. Toca el lugar en el mapa para ver cómo llegar.

## 22. ¿Qué hay tranquilo cerca de mí?

- Recuperación: acierto (esperado ['punto-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-6', 'punto-9']
- Estilo: sin problemas
- Tiempo: 7.9 s · recuperados: ['punto-8', 'punto-19', 'punto-20', 'punto-18', 'punto-13', 'punto-17', 'punto-11', 'metodo-recomendador', 'fuentes', 'metodo-semaforo', 'metodo-reportes']

> El Barrio del Artista y El Parián está tranquilo [punto-6]. Es al aire libre y hay lluvia moderada, así que no es buena opción si llueve. La Zona de los Fuertes (Loreto y Guadalupe) también está tranquila [punto-9], es al aire libre y la visita dura 2 h. Toca el lugar en el mapa para ver cómo llegar.

## 23. ¿Cuándo conviene ir a la pirámide?

- Recuperación: acierto (esperado ['punto-12'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-12']
- Estilo: sin problemas
- Tiempo: 5.6 s · recuperados: ['punto-12', 'punto-13', 'punto-20', 'punto-19', 'punto-1', 'punto-11', 'metodo-recomendador', 'metodo-semaforo', 'metodo-reportes', 'obs-21']

> Te conviene ir a las 16:00, cuando está tranquilo [punto-12]. Ahora está con movimiento normal [punto-12]. Toca el lugar en el mapa para ver cómo llegar.

## 24. ¿Dónde puedo comer cerca del Zócalo?

- Recuperación: acierto (esperado ['denue-*'])
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: sin problemas
- Tiempo: 8.3 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> Puedes comer en Fonda de Santa Clara, un restaurante con servicio de preparación de alimentos a la carta o de comida corrida, a 360 m en línea recta de Zócalo de Puebla [denue-1]. Otra opción es Vittorios, un restaurante con servicio de preparación de alimentos a la carta o de comida corrida, a 96 m en línea recta de Zócalo de Puebla [denue-2]. También hay Restaurante Attico, un restaurante con servicio de preparación de alimentos a la carta o de comida corrida, a 117 m en línea recta de Zócalo de Puebla [denue-3].

## 25. ¿Cuánto cuesta un taxi del Zócalo a Cholula?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: []
- Estilo: sin problemas
- Tiempo: 3.7 s · recuperados: ['punto-14', 'punto-16', 'punto-12', 'punto-21', 'obs-13', 'obs-15', 'inah-3110009', 'obs-22']

> No tengo ese dato.

## 26. ¿Cuál es el restaurante mejor calificado de Puebla?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['denue-1', 'denue-2', 'denue-3']
- Estilo: sin problemas
- Tiempo: 3.0 s · recuperados: ['denue-1', 'denue-2', 'denue-3']

> No tengo ese dato. [denue-1], [denue-2], [denue-3] no tienen calificaciones publicadas.

## 27. ¿A qué hora sale el último tren a Cholula?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-14']
- Estilo: sin problemas
- Tiempo: 6.2 s · recuperados: ['punto-12', 'punto-14', 'punto-13', 'punto-16', 'obs-15', 'obs-13', 'inah-3110009', 'fuentes']

> No tengo ese dato. Pero si quieres, te puedo decir qué hacer en Puebla ahora: por ejemplo, el Exconvento de San Gabriel y Capilla Real, que tiene movimiento normal, es techado y dura 45 minutos [punto-14]. Toca el lugar en el mapa para ver cómo llegar.

## 28. ¿Hay estacionamiento en el Museo Amparo?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['punto-4']
- Estilo: sin problemas
- Tiempo: 3.5 s · recuperados: ['punto-4', 'punto-21', 'punto-20', 'punto-13', 'metodo-recomendador', 'metodo-semaforo', 'inah-4100017', 'fuentes']

> No tengo ese dato. [punto-4]

## 29. ¿Cuántas personas visitaron la Pirámide de Cholula el sábado pasado?

- Sin dato en la base: dijo No tengo ese dato
- Números que no estaban en el contexto: ninguno
- Atributos incorrectos (techado, color, tranquilo): ninguno
- Citas inválidas: ninguna · fuentes: ['inah-3110009']
- Estilo: sin problemas
- Tiempo: 3.8 s · recuperados: ['punto-12', 'punto-13', 'punto-16', 'punto-14', 'obs-13', 'obs-15', 'inah-3110009', 'obs-4']

> No tengo ese dato. [inah-3110009]

## Seguimientos (memoria de 2 preguntas)

- acierto (4.0 s): ¿Cómo está la Pirámide de Cholula? → ¿Y cuánto cuesta?

> La entrada a la Zona Arqueológica de Cholula cuesta $80 [punto-12].

- acierto (4.0 s): Háblame de la Biblioteca Palafoxiana → ¿Y a qué hora abre?

> La Biblioteca Palafoxiana abre a las 10:00. [punto-3]

- acierto (3.9 s): ¿Qué tal Africam Safari? → ¿Es techado?

> No, Africam Safari no es techado. Está al aire libre [punto-20].

- acierto (4.1 s): ¿Cómo está el Museo Amparo? → ¿Y abre hoy?

> No, el Museo Amparo no abre hoy. Está cerrado [punto-4]. Toca el lugar en el mapa para ver cómo llegar.

- acierto (4.6 s): ¿Qué es el Callejón de los Sapos? → ¿Qué tan lleno está?

> El Callejón de los Sapos está en AMARILLO, lo que significa que tiene movimiento normal, no está lleno ni tranquilo. [punto-5]
