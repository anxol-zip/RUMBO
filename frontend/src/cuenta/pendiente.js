// Solo se conserva la intención de favorito durante la redirección OAuth; nunca una reseña.
const CLAVE = 'rumbo:pendiente'

export function descartarPendiente(almacen) {
  try { (almacen ?? globalThis.sessionStorage)?.removeItem(CLAVE) } catch { /* almacenamiento bloqueado */ }
}

export function guardarPendiente(puntoId, almacen) {
  descartarPendiente(almacen)
  if (!Number.isInteger(puntoId) || puntoId <= 0) return
  try { (almacen ?? globalThis.sessionStorage)?.setItem(CLAVE, JSON.stringify({ tipo: 'favorito', puntoId })) } catch { /* sin almacenamiento */ }
}

export function tomarPendiente(almacen) {
  let pendiente = null
  try { pendiente = JSON.parse((almacen ?? globalThis.sessionStorage)?.getItem(CLAVE) ?? 'null') } catch { /* dato inválido o almacenamiento bloqueado */ }
  descartarPendiente(almacen)
  return pendiente?.tipo === 'favorito' && Number.isInteger(pendiente.puntoId) && pendiente.puntoId > 0 ? pendiente : null
}

export async function reanudarFavorito(pendiente, favoritos, guardar) {
  if (!pendiente || favoritos.has(pendiente.puntoId)) return { favoritos, agregado: false, error: false }
  try {
    const { error } = await guardar(pendiente.puntoId)
    if (error) return { favoritos, agregado: false, error: true }
    return { favoritos: new Set([...favoritos, pendiente.puntoId]), agregado: true, error: false }
  } catch {
    return { favoritos, agregado: false, error: true }
  }
}
