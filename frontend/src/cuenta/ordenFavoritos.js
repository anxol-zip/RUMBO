import { ORDEN } from '../data/semaforo.js'

// Favoritos listos para pintar: con su ficha del catálogo y su color de ahora; primero lo que conviene
// visitar (mismo orden que la lista del turista) y, dentro de cada color, por nombre.
export function ordenarFavoritos(ids, catalogo, semaforo) {
  return ids.map((id) => {
    const punto = catalogo.find((p) => p.id === id)
    if (!punto) return { id, ausente: true }
    return { ...punto, color: semaforo?.get(id)?.color ?? null }
  }).sort((a, b) => (a.ausente - b.ausente)
    || ((ORDEN[a.color] ?? 9) - (ORDEN[b.color] ?? 9))
    || (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
}
