import { hora } from './formato.js'

// HCI A2: la respuesta a "¿voy o no?" en una línea, antes de cualquier dato de la ficha.
// Sale solo de lo que ya trae la ficha: el color de ahora y el pronóstico de las próximas horas
// (proximas_horas, 12 horas desde la siguiente). No inventa: si el pronóstico no dice nada, no hay hora.
// Devuelve claves de textos.js con sus valores: { titular, siguiente, valores }.

// Qué cuenta como "mejor" que el color de ahora
const MEJOR = { amarillo: ['verde'], rojo: ['verde', 'amarillo'] }
const ABIERTO = ['verde', 'amarillo', 'rojo']

// YYYY-MM-DD en la hora local, la misma que usa el backend (America/Mexico_City)
function fechaLocal(d = new Date()) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

// "a las 17:00" o "mañana a las 10:00", según el día de esa hora
function cuando(franja, hoy) {
  return { clave: franja.hora.slice(0, 10) === hoy ? 'concl.aLas' : 'concl.mananaALas', hora: hora(franja.hora) }
}

export function conclusion(estado, hoy = fechaLocal()) {
  const horas = estado.proximas_horas ?? []
  const primera = (colores) => horas.find((h) => colores.includes(h.color))

  switch (estado.color) {
    case 'verde': {
      // Hasta cuándo sigue en verde: la primera hora que cambia ("hasta las 17:00"; de noche ya cerró, así que es hoy)
      const cambia = horas.find((h) => h.color !== 'verde')
      return cambia
        ? { titular: 'concl.verde', siguiente: 'concl.verdeHasta', valores: { cuando: cuando(cambia, hoy) } }
        : { titular: 'concl.verde', siguiente: null, valores: {} }
    }
    case 'amarillo':
    case 'rojo': {
      const mejor = primera(MEJOR[estado.color])
      return mejor
        ? { titular: `concl.${estado.color}`, siguiente: 'concl.masTranquilo', valores: { cuando: cuando(mejor, hoy) } }
        : { titular: `concl.${estado.color}`, siguiente: 'concl.otraOpcion', valores: {} }
    }
    case 'cerrado': {
      const abre = primera(ABIERTO)
      return abre
        ? { titular: 'concl.cerrado', siguiente: 'concl.abre', valores: { cuando: cuando(abre, hoy) } }
        : { titular: 'concl.cerrado', siguiente: 'concl.noAbre', valores: {} }
    }
    default:
      return { titular: 'concl.sinDato', siguiente: 'concl.avisanos', valores: {} }
  }
}

// Las dos líneas ya traducidas: la de "cuándo" se arma primero y entra en la siguiente
export function textosConclusion(estado, t) {
  const c = conclusion(estado)
  const cuandoTexto = c.valores.cuando && t(c.valores.cuando.clave, { hora: c.valores.cuando.hora })
  return { titular: t(c.titular), siguiente: c.siguiente && t(c.siguiente, { cuando: cuandoTexto, hora: c.valores.cuando?.hora }) }
}
