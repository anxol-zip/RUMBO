import { useCuenta } from '../cuenta/contexto.js'
import { useIdioma } from '../i18n/contexto.js'

// ☆/★ Favoritos (feature 002, FR-018). El estado va en texto y en aria-pressed, no solo en el icono.
// `compacto` es el de la lista: solo el icono, con el nombre del lugar en la etiqueta para el lector.
// Sin sesión, invita a iniciar sesión y guarda el lugar al volver (FR-020).
function BotonFavorito({ puntoId, nombre, compacto = false }) {
  const { t } = useIdioma()
  const { disponible, favoritos, alternarFavorito } = useCuenta()
  if (!disponible) return null
  const es = favoritos?.has(puntoId) ?? false
  const texto = t(es ? 'favorito.quitar' : 'favorito.agregar')
  return (
    <button
      type="button"
      className={compacto ? 'boton-icono favorito' : 'boton favorito'}
      aria-pressed={es}
      aria-label={compacto ? t(es ? 'favorito.quitarLugar' : 'favorito.agregarLugar', { lugar: nombre }) : undefined}
      title={compacto ? texto : undefined}
      onClick={() => alternarFavorito(puntoId)}
    >
      <span aria-hidden="true">{es ? '★' : '☆'}</span>{!compacto && ` ${texto}`}
    </button>
  )
}

export default BotonFavorito
