import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hechosVisita, horarioLegible } from './hechos.js'

// t de prueba: devuelve la clave con sus variables, para comprobar qué texto se eligió.
const t = (clave, v = {}) => (Object.keys(v).length ? `${clave}(${Object.values(v).join('|')})` : clave)
const LUNES = 1

test('abierto todo el día se dice en palabras', () => {
  assert.equal(horarioLegible({ lun: '00:00-24:00' }, t, LUNES), 'ficha.abierto24')
  assert.equal(horarioLegible('00:00-24:00', t, LUNES), 'ficha.abierto24')
})

test('un rango lleva guion de rango y uno partido se separa con coma', () => {
  assert.equal(horarioLegible({ lun: '10:00-17:00' }, t, LUNES), 'ficha.hoyHorario(10:00–17:00)')
  assert.equal(horarioLegible({ lun: '10:00-14:00,16:00-18:00' }, t, LUNES), 'ficha.hoyHorario(10:00–14:00, 16:00–18:00)')
})

test('sin horario de hoy dice cerrado; sin horario registrado no muestra nada', () => {
  assert.equal(horarioLegible({ mar: '10:00-17:00' }, t, LUNES), 'ficha.cerradoHoy')
  assert.equal(horarioLegible(null, t, LUNES), null)
})

test('los datos que no se saben no aparecen', () => {
  const hechos = hechosVisita({ traslado: null, horario: null, duracion_sugerida: null, costo_mxn: null }, t, LUNES)
  assert.deepEqual(hechos, [])
})

test('entrada libre, precio y traslado en coche', () => {
  const hechos = hechosVisita({
    traslado: { minutos: 17, modo: 'en coche' }, horario: { lun: '09:00-18:00' }, duracion_sugerida: '1-2 h', costo_mxn: 0,
  }, t, LUNES)
  assert.deepEqual(hechos.map((h) => h.clave), ['traslado', 'horario', 'duracion', 'entrada'])
  assert.equal(hechos[0].icono, 'coche')
  assert.equal(hechos[3].texto, 'ficha.entradaLibre')
  const conPrecio = hechosVisita({ costo_mxn: 48 }, t, LUNES)
  assert.match(conPrecio[0].texto, /^ficha\.entradaPrecio\(\$48\)$/)
})
