import assert from 'node:assert/strict'
import { test } from 'node:test'
import { iniciales, nombreVisible } from './nombre.js'

test('un nombre institucional en mayúsculas pasa a formato de título', () => {
  assert.equal(nombreVisible('RUGERIO JIMENEZ ANGEL'), 'Rugerio Jimenez Angel')
  assert.equal(nombreVisible('  NUÑEZ   ÁLVAREZ  MARÍA '), 'Nuñez Álvarez María')
})

test('las partículas van en minúscula, salvo al inicio', () => {
  assert.equal(nombreVisible('DE LA CRUZ ANA'), 'De la Cruz Ana')
  assert.equal(nombreVisible('ANA DE LOS SANTOS'), 'Ana de los Santos')
})

test('un nombre que ya trae minúsculas se respeta', () => {
  assert.equal(nombreVisible('Axel García Arellano'), 'Axel García Arellano')
  assert.equal(nombreVisible('McKenzie O’Brien'), 'McKenzie O’Brien')
})

test('sin nombre devuelve cadena vacía', () => {
  assert.equal(nombreVisible(null), '')
  assert.equal(nombreVisible('   '), '')
})

test('las iniciales salen de las dos primeras palabras, sin partículas', () => {
  assert.equal(iniciales('RUGERIO JIMENEZ ANGEL'), 'RJ')
  assert.equal(iniciales('Ana de la Cruz'), 'AC')
  assert.equal(iniciales('Yohualli'), 'Y')
})

test('sin nombre, las iniciales salen del correo', () => {
  assert.equal(iniciales('', 'angel@ejemplo.mx'), 'A')
  assert.equal(iniciales(null, null), '·')
})
