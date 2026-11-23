import { traducirRazon } from '../i18n/backend.js'

// Frases del backend (servicio.razon_corta) que solo repiten el color: el chip del semáforo ya lo dice.
// "confirmado por turistas" tampoco va: la tarjeta lo muestra como insignia.
const REPITE_EL_COLOR = [
  /^Tranquilo para este lugar$/, /^Movimiento normal para este lugar$/, /^Cerrado a esta hora$/, /^confirmado por turistas$/,
]

const mayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// El renglón de cada tarjeta de la lista: lo que distingue a ese lugar, no lo que ya dice el chip.
// Antes cada tarjeta repetía "Tranquilo para este lugar" debajo de "Buen momento".
// 1. Lo que cambia la visita: ajuste de la Secretaría, cuánto más lleno, lluvia, evento o sin dato.
// 2. Si no hay nada de eso, con qué gustos de la persona coincide.
// 3. Si tampoco, ningún renglón (null).
export function detalleLista(punto, intereses, idioma, t) {
  const propias = (punto.razon ?? '').split(' · ').filter((r) => r && !REPITE_EL_COLOR.some((p) => p.test(r)))
  if (propias.length > 0) return mayuscula(traducirRazon(propias[0], idioma))
  const coinciden = (punto.categorias ?? []).filter((c) => intereses.includes(c))
  if (coinciden.length === 0) return null
  const nombres = coinciden.slice(0, 2).map((c) => t(`interes.${c}`))
  return t('lista.coincide', { gustos: nombres.join(t('lista.y')) })
}
