import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agruparDenuncias, atencion, lugaresPorAfluencia, repartoEstados, repartoReportes } from './tablero.js'

const punto = (id, nombre, color, nivel = null, extra = {}) => ({ id, nombre, color, nivel, ...extra })

test('sin pendientes no hay avisos', () => {
  assert.deepEqual(atencion({ grupos: [], puntos: [punto(1, 'A', 'verde', 0.8)], ajustes: [] }), [])
})

test('avisa de reseñas por revisar, lugares llenos y ajustes vigentes', () => {
  const grupos = [
    { resena: { estado: 'visible' }, motivos: ['a', 'b'] },
    { resena: { estado: 'oculta' }, motivos: ['c'] },
  ]
  const puntos = [punto(1, 'Zócalo', 'rojo', 2.1), punto(2, 'Catedral', 'rojo', 2.6), punto(3, 'Ajustado', 'rojo', 1, { ajuste_manual: 'obra' })]
  const ajustes = [{ nombre: 'X', hasta: '2026-11-17T23:00:00' }, { nombre: 'Y', hasta: '2026-11-17T21:00:00' }]
  const [moderacion, llenos, vigentes] = atencion({ grupos, puntos, ajustes })
  assert.deepEqual(moderacion, { clave: 'moderacion', n: 1, denuncias: 2, pestana: 'moderacion' })
  assert.deepEqual(llenos.nombres, ['Catedral', 'Zócalo'])      // el más lleno primero; el ajustado no cuenta
  assert.equal(llenos.puntoId, 2)
  assert.deepEqual({ n: vigentes.n, vence: vigentes.vence, nombre: vigentes.nombre }, { n: 2, vence: '21:00', nombre: 'Y' })
})

test('el reparto de estados sigue el orden del semáforo y omite los vacíos', () => {
  const r = repartoEstados([punto(1, 'a', 'cerrado'), punto(2, 'b', 'verde'), punto(3, 'c', 'cerrado')])
  assert.deepEqual(r, [{ color: 'verde', n: 1 }, { color: 'cerrado', n: 2 }])
})

test('los lugares abiertos van del más lleno al menos lleno; los cerrados al final', () => {
  const orden = lugaresPorAfluencia([
    punto(1, 'Catedral', 'cerrado'), punto(2, 'Zócalo', 'amarillo', 1.24), punto(3, 'Estrella', 'verde', 0.65), punto(4, 'Africam', 'sin_dato'),
  ]).map((p) => p.id)
  assert.deepEqual(orden, [2, 3, 4, 1])
})

test('las denuncias se agrupan por reseña; primero las visibles con más denuncias', () => {
  const r1 = { id: 1, estado: 'visible' }, r2 = { id: 2, estado: 'oculta' }, r3 = { id: 3, estado: 'visible' }
  const grupos = agruparDenuncias([
    { motivo: 'spam', creada_en: '2026-11-17T10:00', resena: r1 },
    { motivo: 'ofensiva', creada_en: '2026-11-17T09:00', resena: r2 },
    { motivo: 'ofensiva', creada_en: '2026-11-17T08:00', resena: r2 },
    { motivo: 'falsa', creada_en: '2026-11-17T11:00', resena: r3 },
    { motivo: 'otra', creada_en: '2026-11-17T12:00', resena: r3 },
    { motivo: 'huérfana', creada_en: '2026-11-17T12:00', resena: null },
  ])
  assert.deepEqual(grupos.map((g) => g.resena.id), [3, 1, 2])
  assert.equal(grupos[0].ultima, '2026-11-17T12:00')
})

test('el reparto de reportes siempre trae los tres estados', () => {
  assert.deepEqual(repartoReportes({ valido: 2 }), [{ estado: 'valido', n: 2 }, { estado: 'dudoso', n: 0 }, { estado: 'descartado', n: 0 }])
})
