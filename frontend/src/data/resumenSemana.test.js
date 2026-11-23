import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resumenSemana } from './resumenSemana.js'

// Un día con sus colores de las 08:00 en adelante: 'v' verde, 'a' amarillo, 'r' rojo, 'c' cerrado.
const dia = (fecha, colores, pasadas = 0) => ({
  fecha,
  horas: [...colores].map((c, i) => ({
    hora: `${String(8 + i).padStart(2, '0')}:00`,
    color: { v: 'verde', a: 'amarillo', r: 'rojo', c: 'cerrado' }[c],
    pasada: i < pasadas,
  })),
})

test('elige el día con más horas en verde y el que tiene más en rojo, con su rango', () => {
  const r = resumenSemana([dia('2026-11-17', 'vaarra'), dia('2026-11-18', 'vvvaav'), dia('2026-11-21', 'varrrv')])
  assert.deepEqual(r.tranquilo, { fecha: '2026-11-18', verdes: 4 })
  assert.deepEqual(r.lleno, { fecha: '2026-11-21', desde: '10:00', hasta: '12:00' })
})

test('la hora tranquila se dice una vez si se repite en al menos la mitad de los días', () => {
  const r = resumenSemana([dia('a', 'vaa'), dia('b', 'vaa'), dia('c', 'aav')])
  assert.deepEqual(r.horaTranquila, { hora: '08:00', dias: 2 })
})

test('las horas que ya pasaron y las cerradas no cuentan', () => {
  const r = resumenSemana([dia('hoy', 'vvva', 3), dia('mañana', 'cvaa')])
  assert.deepEqual(r.tranquilo, { fecha: 'mañana', verdes: 1 })
})

test('sin rojo no hay día lleno; sin horas abiertas no hay nada', () => {
  assert.equal(resumenSemana([dia('a', 'vaa'), dia('b', 'aav')]).lleno, null)
  assert.deepEqual(resumenSemana([dia('a', 'ccc')]), { tranquilo: null, lleno: null, horaTranquila: null })
})
