import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ordenarFavoritos } from './ordenFavoritos.js'

const catalogo = [
  { id: 1, nombre: 'Catedral de Puebla', clave: 'catedral' },
  { id: 2, nombre: 'Capilla del Rosario', clave: 'capilla_rosario' },
  { id: 3, nombre: 'Biblioteca Palafoxiana', clave: 'biblioteca' },
  { id: 4, nombre: 'Callejón de los Sapos', clave: 'sapos' },
]

test('los Favoritos van primero por lo que conviene ahora y luego por nombre', () => {
  const semaforo = new Map([[1, { color: 'cerrado' }], [2, { color: 'verde' }], [3, { color: 'verde' }], [4, { color: 'amarillo' }]])
  const orden = ordenarFavoritos([1, 2, 3, 4], catalogo, semaforo).map((f) => f.id)
  assert.deepEqual(orden, [3, 2, 4, 1])
})

test('sin semáforo se ordenan por nombre y llevan color null', () => {
  const favoritos = ordenarFavoritos([4, 1], catalogo, null)
  assert.deepEqual(favoritos.map((f) => f.id), [4, 1])
  assert.equal(favoritos[0].color, null)
})

test('un Favorito que ya no está en el catálogo va al final, marcado como ausente', () => {
  const favoritos = ordenarFavoritos([99, 2], catalogo, new Map([[2, { color: 'rojo' }]]))
  assert.deepEqual(favoritos.map((f) => f.id), [2, 99])
  assert.equal(favoritos[1].ausente, true)
})
