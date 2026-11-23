import { pesos, textoTraslado } from './formato.js'

const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']

// Horario de hoy en palabras del turista: "00:00-24:00" es "Abierto las 24 horas" y los rangos van
// con guion de rango ("10:00–17:00"). null si no hay horario registrado: no se muestra.
export function horarioLegible(horario, t, dia = new Date().getDay()) {
  if (!horario) return null
  const hoy = typeof horario === 'string' ? horario : horario[DIAS[dia]]
  if (!hoy) return t('ficha.cerradoHoy')
  const limpio = hoy.replace(/\s+/g, '')
  if (/^0?0:00-24:00$/.test(limpio)) return t('ficha.abierto24')
  return t('ficha.hoyHorario', { horario: limpio.replace(/-/g, '–').replace(/,/g, ', ') })
}

// Los datos de la visita que caben en un renglón: traslado, horario, duración y entrada. Lo que no se
// sabe no aparece (antes salía "Por confirmar" dos veces y ocupaba lo mismo que un dato real).
export function hechosVisita(estado, t, dia = new Date().getDay()) {
  const hechos = []
  const traslado = textoTraslado(estado.traslado, t)
  if (traslado) hechos.push({ clave: 'traslado', icono: estado.traslado.modo === 'en coche' ? 'coche' : 'caminar', texto: traslado })
  const horario = horarioLegible(estado.horario, t, dia)
  if (horario) hechos.push({ clave: 'horario', icono: 'reloj', texto: horario })
  if (estado.duracion_sugerida) hechos.push({ clave: 'duracion', icono: 'bolsa', texto: t('ficha.duracionVisita', { duracion: estado.duracion_sugerida }) })
  if (estado.costo_mxn != null) {
    hechos.push({ clave: 'entrada', icono: 'etiqueta', texto: estado.costo_mxn === 0 ? t('ficha.entradaLibre') : t('ficha.entradaPrecio', { precio: pesos(estado.costo_mxn) }) })
  }
  return hechos
}
