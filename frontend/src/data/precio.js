import { pesos } from './formato.js'

// Precio de Google Places (feature 004) en palabras, no solo "$$" (Principio I: lo lee el lector de pantalla).
// "Precio moderado · $200 a $400"; sin nivel, solo el rango; sin nada, null.
export function textoPrecio(datos, t) {
  const partes = []
  if (datos?.nivel_precio) partes.push(t(`precio.${datos.nivel_precio}`))
  const r = datos?.rango_precio
  if (r) partes.push(r.hasta != null ? t('precio.rango', { desde: pesos(r.desde), hasta: pesos(r.hasta) }) : t('precio.desde', { desde: pesos(r.desde) }))
  return partes.length ? partes.join(' · ') : null
}
