import assert from 'node:assert/strict'
import { test } from 'node:test'
import { textoPrecio } from './precio.js'

const t = (clave, v = {}) => (Object.keys(v).length ? `${clave}(${Object.values(v).join('|')})` : clave)

test('nivel y rango se dicen en palabras', () => {
  const d = { nivel_precio: 'moderado', rango_precio: { desde: 200, hasta: 400, moneda: 'MXN' } }
  assert.equal(textoPrecio(d, t), 'precio.moderado · precio.rango($200|$400)')
})

test('solo nivel, solo rango abierto o nada', () => {
  assert.equal(textoPrecio({ nivel_precio: 'gratis', rango_precio: null }, t), 'precio.gratis')
  assert.equal(textoPrecio({ nivel_precio: null, rango_precio: { desde: 100, hasta: null } }, t), 'precio.desde($100)')
  assert.equal(textoPrecio({ nivel_precio: null, rango_precio: null }, t), null)
  assert.equal(textoPrecio(undefined, t), null)
})
