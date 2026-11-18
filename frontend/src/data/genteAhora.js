// Geometría de la barra "Gente ahora". La escala la ponen los umbrales del propio lugar (los mismos
// que deciden su color: turismo_core/semaforo.py), así la marca siempre cae en el tramo del color que
// muestra el semáforo. La versión anterior usaba una escala global y, con 1.24 veces lo normal, marcaba
// casi el máximo en un lugar amarillo: la barra y el semáforo se contradecían.
// nivel: afluencia ÷ la normal de ese lugar a esa hora. umbrales: { bajo, alto }.

const ZONAS = ['verde', 'amarillo', 'rojo']

export function medidorGente(nivel, umbrales) {
  if (nivel == null || !umbrales || umbrales.bajo == null || umbrales.alto == null) return null
  const { bajo, alto } = umbrales
  // La escala no empieza en 0: empieza un tramo antes del umbral verde. Si empezara en 0, el verde
  // ocuparía casi toda la barra (los umbrales rondan 1.0 y 1.5) y la marca se amontonaría al final.
  const ancho = alto - bajo
  const inicio = Math.max(0, Math.min(bajo - ancho * 1.1, nivel * 0.92))
  const max = Math.max(alto + ancho * 0.9, nivel * 1.08)
  const pct = (x) => Math.round(((x - inicio) / (max - inicio)) * 1000) / 10
  const limites = [inicio, bajo, alto, max]
  const zonas = ZONAS.map((color, i) => ({ color, ancho: Math.round(((limites[i + 1] - limites[i]) / (max - inicio)) * 1000) / 10 }))
  const zona = nivel < bajo ? 'verde' : nivel < alto ? 'amarillo' : 'rojo'
  return { zonas, zona, posicion: Math.min(98, Math.max(2, pct(nivel))) }
}

// Cómo se dice el nivel: "menos gente de lo habitual", "lo habitual" o "1.4 veces lo habitual".
export function textoNivel(nivel, t) {
  if (nivel < 0.95) return t('gente.menos')
  if (nivel <= 1.05) return t('gente.igual')
  return t('gente.veces', { n: nivel.toLocaleString('es-MX', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) })
}
