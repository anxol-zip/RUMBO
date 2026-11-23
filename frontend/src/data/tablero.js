// Lógica del panel de la Secretaría (sin React ni red): qué requiere atención, cómo están los lugares
// y cómo se agrupan las denuncias. Las pantallas (components/panel) solo pintan lo que sale de aquí.

export const ESTADOS = ['verde', 'amarillo', 'rojo', 'sin_dato', 'cerrado']

// Lo primero que ve la Secretaría: lo que pide una acción suya. Cada aviso dice cuántos son y a qué
// pestaña lleva. Sin nada pendiente, la lista sale vacía y la pantalla dice "todo en orden".
export function atencion({ grupos, puntos, ajustes }) {
  const avisos = []
  const porRevisar = (grupos ?? []).filter((g) => g.resena.estado === 'visible')
  if (porRevisar.length > 0) {
    avisos.push({ clave: 'moderacion', n: porRevisar.length, denuncias: porRevisar.reduce((s, g) => s + g.motivos.length, 0), pestana: 'moderacion' })
  }
  const llenos = puntos.filter((p) => p.color === 'rojo' && !p.ajuste_manual)
    .sort((a, b) => (b.nivel ?? 0) - (a.nivel ?? 0))
  if (llenos.length > 0) {
    avisos.push({ clave: 'llenos', n: llenos.length, nombres: llenos.slice(0, 2).map((p) => p.nombre), puntoId: llenos[0].id, pestana: 'ajustes' })
  }
  if (ajustes.length > 0) {
    const vence = [...ajustes].sort((a, b) => a.hasta.localeCompare(b.hasta))[0]
    avisos.push({ clave: 'ajustes', n: ajustes.length, vence: vence.hasta.slice(11, 16), nombre: vence.nombre, pestana: 'ajustes' })
  }
  return avisos
}

// Cuántos lugares hay en cada estado, en el orden del semáforo (para la barra apilada).
export function repartoEstados(puntos) {
  const n = Object.fromEntries(ESTADOS.map((e) => [e, 0]))
  for (const p of puntos) n[p.color in n ? p.color : 'sin_dato'] += 1
  return ESTADOS.map((color) => ({ color, n: n[color] })).filter((e) => e.n > 0)
}

// Lugares abiertos del más al menos lleno (contra su propia normal); los cerrados y sin dato, al final
// y por nombre. Es la lista de al lado del mapa: lo que más se llena, arriba.
export function lugaresPorAfluencia(puntos) {
  const abiertos = puntos.filter((p) => p.nivel != null && p.color !== 'cerrado')
    .sort((a, b) => b.nivel - a.nivel)
  const resto = puntos.filter((p) => !abiertos.includes(p))
    .sort((a, b) => ESTADOS.indexOf(a.color) - ESTADOS.indexOf(b.color) || a.nombre.localeCompare(b.nombre, 'es'))
  return [...abiertos, ...resto]
}

// Denuncias (una fila por denuncia) → una entrada por reseña con todos sus motivos. Primero las que
// siguen visibles (por revisar) y, dentro, las que tienen más denuncias.
export function agruparDenuncias(filas) {
  const porResena = new Map()
  for (const d of filas ?? []) {
    if (!d.resena) continue
    if (!porResena.has(d.resena.id)) porResena.set(d.resena.id, { resena: d.resena, motivos: [], ultima: d.creada_en })
    const g = porResena.get(d.resena.id)
    g.motivos.push(d.motivo)
    if (d.creada_en > g.ultima) g.ultima = d.creada_en
  }
  return [...porResena.values()].sort((a, b) => (a.resena.estado === 'visible' ? 0 : 1) - (b.resena.estado === 'visible' ? 0 : 1)
    || b.motivos.length - a.motivos.length || b.ultima.localeCompare(a.ultima))
}

// Reportes del día por estado, para la barra apilada (válido, dudoso, descartado).
export function repartoReportes(porEstado) {
  return ['valido', 'dudoso', 'descartado'].map((estado) => ({ estado, n: porEstado?.[estado] ?? 0 }))
}
