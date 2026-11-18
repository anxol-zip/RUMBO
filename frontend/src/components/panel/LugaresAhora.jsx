import { useState } from 'react'
import { textoNivel } from '../../data/genteAhora.js'
import { lugaresPorAfluencia } from '../../data/tablero.js'
import { useIdioma } from '../../i18n/contexto.js'
import IconoEstado from '../IconoEstado.jsx'

const VISIBLES = 8

// Al lado del mapa: los lugares del más al menos lleno (contra su propia normal), con su estado y un
// atajo a "Fijar color" para ese lugar. Los cerrados y sin dato quedan detrás de "Ver todos".
function LugaresAhora({ puntos, onFijar }) {
  const { t } = useIdioma()
  const [todos, setTodos] = useState(false)
  const orden = lugaresPorAfluencia(puntos)
  const abiertos = orden.filter((p) => p.nivel != null && p.color !== 'cerrado').length
  const visibles = todos ? orden : orden.slice(0, Math.max(abiertos, Math.min(VISIBLES, orden.length)))
  return (
    <>
      <ul className="lugares-ahora">
        {visibles.map((p) => (
          <li key={p.id} className={p.color === 'cerrado' ? 'apagado' : undefined}>
            <IconoEstado color={p.color} />
            <div className="lugares-ahora-texto">
              <p className="lugares-ahora-nombre">{p.nombre}</p>
              <p className="lugares-ahora-meta">
                {p.ajuste_manual
                  ? <span className="ajuste-etiqueta">{t('tablero.ajustado')}</span>
                  : <>{t(`sem.${p.color}`)}{p.nivel != null && p.color !== 'cerrado' ? `. ${textoNivel(p.nivel, t)}` : ''}</>}
                {p.n_reportes > 0 && <span> · {t(p.n_reportes === 1 ? 'tablero.unReporte' : 'tablero.reportes', { n: p.n_reportes })}</span>}
              </p>
            </div>
            <button type="button" className="boton-texto" onClick={() => onFijar(p.id)} aria-label={t('tablero.fijarLugar', { lugar: p.nombre })}>
              {t('tablero.fijar')}
            </button>
          </li>
        ))}
      </ul>
      {orden.length > visibles.length && (
        <button type="button" className="boton ancho" onClick={() => setTodos(true)}>{t('tablero.verTodos', { n: orden.length })}</button>
      )}
      {todos && orden.length > VISIBLES && (
        <button type="button" className="boton-texto" onClick={() => setTodos(false)}>{t('tablero.verMenos')}</button>
      )}
    </>
  )
}

export default LugaresAhora
