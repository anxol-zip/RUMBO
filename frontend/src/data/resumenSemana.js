// Resumen de la semana de un lugar: lo que la cuadrícula no dice de un vistazo. Sustituye a "Día por
// día", que repetía siete veces "más tranquilo a las 08:00 · más lleno a las 18:00".
// dias: [{ fecha, horas: [{ hora, color, pasada }] }] (GET /api/puntos/{id}/semana).
// Devuelve { tranquilo, lleno, horaTranquila }; cada uno es null si no aplica.

const futuras = (d) => d.horas.filter((h) => !h.pasada && h.color !== 'cerrado')
const cuenta = (horas, color) => horas.filter((h) => h.color === color).length

export function resumenSemana(dias) {
  const conHoras = dias.map((d) => ({ fecha: d.fecha, horas: futuras(d) })).filter((d) => d.horas.length > 0)
  if (conHoras.length === 0) return { tranquilo: null, lleno: null, horaTranquila: null }

  // El día con más horas en verde (el primero, si empatan).
  const tranquilo = conHoras.reduce((mejor, d) => (cuenta(d.horas, 'verde') > cuenta(mejor.horas, 'verde') ? d : mejor))
  const verdes = cuenta(tranquilo.horas, 'verde')

  // El día con más horas en rojo, con el rango de la primera a la última hora roja.
  const lleno = conHoras.reduce((peor, d) => (cuenta(d.horas, 'rojo') > cuenta(peor.horas, 'rojo') ? d : peor))
  const rojas = lleno.horas.filter((h) => h.color === 'rojo').map((h) => h.hora).sort()

  // La hora en verde que más días se repite: si se repite en al menos la mitad, se dice una vez.
  const veces = new Map()
  for (const d of conHoras) for (const h of d.horas) if (h.color === 'verde') veces.set(h.hora, (veces.get(h.hora) ?? 0) + 1)
  const [hora, n] = [...veces].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? [null, 0]

  return {
    tranquilo: verdes > 0 ? { fecha: tranquilo.fecha, verdes } : null,
    lleno: rojas.length > 0 && lleno.fecha !== tranquilo.fecha ? { fecha: lleno.fecha, desde: rojas[0], hasta: rojas.at(-1) } : null,
    horaTranquila: hora && n >= Math.ceil(conHoras.length / 2) && n > 1 ? { hora, dias: n } : null,
  }
}
