import { useRef } from 'react'
import { useIdioma } from '../i18n/contexto.js'

export const ANCHO_MINIMO = 400

// Borde derecho del panel: se arrastra para hacerlo más ancho o más angosto.
// También con teclado (flechas, Inicio para el ancho normal) y doble clic para regresar al ancho normal.
function BordePanel({ panel, ancho, onCambiar, onReiniciar }) {
  const { t } = useIdioma()
  const arrastre = useRef(null)
  const maximo = () => window.innerWidth - 160

  function bajar(e) {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    arrastre.current = panel.current.getBoundingClientRect().left
    document.body.classList.add('cambiando-ancho')
  }
  function mover(e) {
    if (arrastre.current == null) return
    onCambiar(e.clientX - arrastre.current)
  }
  function soltar() {
    arrastre.current = null
    document.body.classList.remove('cambiando-ancho')
  }
  function tecla(e) {
    const paso = e.shiftKey ? 120 : 40
    if (e.key === 'ArrowRight') onCambiar(ancho + paso)
    else if (e.key === 'ArrowLeft') onCambiar(ancho - paso)
    else if (e.key === 'Home') onReiniciar()
    else return
    e.preventDefault()
  }

  return (
    <div
      className="borde-panel" role="separator" aria-orientation="vertical" tabIndex={0}
      aria-label={t('panel.ancho')} title={t('panel.anchoAyuda')}
      aria-valuenow={Math.round(ancho)} aria-valuemin={ANCHO_MINIMO} aria-valuemax={maximo()}
      onPointerDown={bajar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
      onDoubleClick={onReiniciar} onKeyDown={tecla}
    >
      <span aria-hidden="true" />
    </div>
  )
}

export default BordePanel
