import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detalleLista } from './detalleLista.js'

const NOMBRES = { 'interes.arte': 'Arte', 'interes.historia': 'Historia', 'interes.compras': 'Compras', 'lista.y': ' y ' }
const t = (clave, v = {}) => (clave === 'lista.coincide' ? `Coincide con ${v.gustos}` : NOMBRES[clave] ?? clave)

test('no repite lo que ya dice el chip del semáforo', () => {
  for (const razon of ['Tranquilo para este lugar', 'Movimiento normal para este lugar', 'Cerrado a esta hora']) {
    assert.equal(detalleLista({ razon, categorias: [] }, [], 'es', t), null)
  }
})

test('lo que distingue al lugar va primero, con mayúscula', () => {
  const p = { razon: 'Tranquilo para este lugar · lluvia moderada, es al aire libre', categorias: ['arte'] }
  assert.equal(detalleLista(p, ['arte'], 'es', t), 'Lluvia moderada, es al aire libre')
  assert.equal(detalleLista({ razon: '2.1 veces lo normal; más lleno que el 85 % de sus horas' }, [], 'es', t),
    '2.1 veces lo normal; más lleno que el 85 % de sus horas')
})

test('en inglés se traduce', () => {
  const p = { razon: 'Tranquilo para este lugar · evento: Festival del Mole' }
  assert.equal(detalleLista(p, [], 'en', t), 'Event: Festival del Mole')
})

test('sin nada propio, dice con qué gustos coincide (a lo mucho dos)', () => {
  const p = { razon: 'Tranquilo para este lugar · confirmado por turistas', categorias: ['historia', 'arte', 'compras'] }
  assert.equal(detalleLista(p, ['arte', 'historia', 'compras'], 'es', t), 'Coincide con Historia y Arte')
})
