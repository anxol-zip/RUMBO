import test from 'node:test'
import assert from 'node:assert/strict'
import { descartarPendiente, guardarPendiente, reanudarFavorito, tomarPendiente } from './pendiente.js'

function almacen() {
  const datos = new Map()
  return { getItem: (clave) => datos.get(clave) ?? null, setItem: (clave, valor) => datos.set(clave, valor), removeItem: (clave) => datos.delete(clave) }
}

test('cancelar o pedir acceso genérico descarta el favorito antes del siguiente login', async () => {
  const memoria = almacen()
  guardarPendiente(7, memoria)
  descartarPendiente(memoria)
  let escrituras = 0
  const resultado = await reanudarFavorito(tomarPendiente(memoria), new Set(), () => { escrituras++ })
  assert.equal(escrituras, 0)
  assert.equal(resultado.favoritos.size, 0)
})

test('el retorno OAuth consume una sola intención y confirma antes de mostrar el favorito', async () => {
  const memoria = almacen()
  guardarPendiente(7, memoria)
  const originales = new Set([2])
  let confirmar
  let escrituras = 0
  const tarea = reanudarFavorito(tomarPendiente(memoria), originales, (id) => {
    assert.equal(id, 7)
    escrituras++
    return new Promise((resolve) => { confirmar = resolve })
  })
  assert.equal(originales.has(7), false)
  assert.equal(tomarPendiente(memoria), null)
  confirmar({ error: null })
  const resultado = await tarea
  assert.equal(resultado.agregado, true)
  assert.equal(resultado.favoritos.has(7), true)
  assert.equal(originales.has(7), false)
  await reanudarFavorito(tomarPendiente(memoria), resultado.favoritos, () => { escrituras++ })
  assert.equal(escrituras, 1)
})

test('un favorito ya existente no se duplica al volver de OAuth', async () => {
  let escrituras = 0
  const resultado = await reanudarFavorito({ tipo: 'favorito', puntoId: 7 }, new Set([7]), () => { escrituras++ })
  assert.equal(escrituras, 0)
  assert.equal(resultado.agregado, false)
  assert.deepEqual([...resultado.favoritos], [7])
})

for (const fallo of ['respuesta', 'rechazo', 'sincrono']) {
  test(`fallo ${fallo}: conserva el estado y no anuncia guardado`, async () => {
    const originales = new Set([2])
    const resultado = await reanudarFavorito({ tipo: 'favorito', puntoId: 7 }, originales, () => {
      if (fallo === 'respuesta') return Promise.resolve({ error: { message: 'Sin permiso' } })
      if (fallo === 'rechazo') return Promise.reject(new Error('Sin red'))
      throw new Error('Cliente no disponible')
    })
    assert.equal(resultado.favoritos, originales)
    assert.equal(resultado.favoritos.has(7), false)
    assert.equal(resultado.agregado, false)
    assert.equal(resultado.error, true)
  })
}

test('datos corruptos y tipos distintos no generan escrituras después del login', () => {
  const memoria = almacen()
  for (const valor of ['{', '{"tipo":"resena","puntoId":7}', '{"tipo":"favorito","puntoId":-1}', '{"tipo":"favorito","puntoId":"7"}']) {
    memoria.setItem('rumbo:pendiente', valor)
    assert.equal(tomarPendiente(memoria), null)
    assert.equal(memoria.getItem('rumbo:pendiente'), null)
  }
})

test('almacenamiento bloqueado no lanza errores al manejar la intención', () => {
  const bloqueado = {
    getItem() { throw new Error('Bloqueado') }, setItem() { throw new Error('Bloqueado') }, removeItem() { throw new Error('Bloqueado') },
  }
  assert.doesNotThrow(() => guardarPendiente(7, bloqueado))
  assert.doesNotThrow(() => descartarPendiente(bloqueado))
  assert.equal(tomarPendiente(bloqueado), null)
})
