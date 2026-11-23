import assert from 'node:assert/strict'
import { test } from 'node:test'
import { medidorGente, textoNivel } from './genteAhora.js'

test('la marca cae en el tramo del color que decide el semáforo', () => {
  const umbrales = { bajo: 1.1, alto: 1.764 }
  assert.equal(medidorGente(0.7, umbrales).zona, 'verde')
  assert.equal(medidorGente(1.24, umbrales).zona, 'amarillo')   // Callejón de los Sapos: antes la barra marcaba el máximo
  assert.equal(medidorGente(2.1, umbrales).zona, 'rojo')
})

test('la marca queda dentro de su tramo', () => {
  const m = medidorGente(1.24, { bajo: 1.1, alto: 1.764 })
  const [verde, amarillo] = m.zonas.map((z) => z.ancho)
  assert.ok(m.posicion > verde && m.posicion < verde + amarillo)
})

test('los tramos suman el ancho completo y la escala crece si el nivel la rebasa', () => {
  const m = medidorGente(5, { bajo: 1, alto: 1.4 })
  const total = m.zonas.reduce((s, z) => s + z.ancho, 0)
  assert.ok(Math.abs(total - 100) < 0.5)
  assert.ok(m.posicion <= 98)
})

test('sin nivel o sin umbrales no hay barra', () => {
  assert.equal(medidorGente(null, { bajo: 1, alto: 2 }), null)
  assert.equal(medidorGente(1.2, null), null)
})

test('el nivel se dice en palabras', () => {
  const t = (k, v) => (v ? `${k}(${v.n})` : k)
  assert.equal(textoNivel(0.6, t), 'gente.menos')
  assert.equal(textoNivel(1.02, t), 'gente.igual')
  assert.equal(textoNivel(1.24, t), 'gente.veces(1.2)')
})
