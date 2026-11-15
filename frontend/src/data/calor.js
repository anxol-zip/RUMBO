// Rampa secuencial de un solo tono (rosa mexicano de la marca, de claro a oscuro): la afluencia es una
// magnitud, así que no usa los colores del semáforo, que quedan reservados al estado.
// La usan el mapa de calor, su leyenda y la barra "Gente ahora" de la ficha.
export const RAMPA = ['#FFD1E8', '#FF8CC3', '#F2449B', '#E4007C', '#B3005F']

// nivel es la afluencia relativa que manda el backend (1.0 = una hora normal en ese lugar).
// 0.4 o menos se ve casi vacío; 1.6 o más, lleno.
export function intensidad(valor) {
  return Math.min(1, Math.max(0, (valor - 0.4) / 1.2))
}
