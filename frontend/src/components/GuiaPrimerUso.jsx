import { useRef, useState } from 'react'
import { useDialogo } from '../hooks/useDialogo.js'
import { useIdioma } from '../i18n/contexto.js'
import IconoEstado from './IconoEstado.jsx'

const PASOS = ['semaforo', 'lugares', 'opciones']
const ESTADOS = ['verde', 'amarillo', 'rojo']

// Guía de primer uso (propuesta §5.2): tres pasos que explican el semáforo, cómo comparar lugares y
// el botón Aa. Aparece una vez, al llegar al mapa; se puede volver a abrir desde "Ver mejor".
function GuiaPrimerUso({ onCerrar }) {
  const { t } = useIdioma()
  const [paso, setPaso] = useState(0)
  const caja = useRef(null)
  // Ventana modal (D6): el foco entra, Tab no se sale y Escape la cierra.
  useDialogo(caja, onCerrar, { atrapar: true, inicial: '.boton.primario' })
  const id = PASOS[paso]
  const ultimo = paso === PASOS.length - 1

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-guia">
      <div className="modal guia" ref={caja}>
        <p className="suave">{t('guia.paso', { n: paso + 1, total: PASOS.length })}</p>
        <div aria-live="polite">
          <h2 id="titulo-guia">{t(`guia.${id}.titulo`)}</h2>
          <p className="secundario">{t(`guia.${id}.texto`)}</p>
          {id === 'semaforo' && (
            <ul className="guia-estados">
              {ESTADOS.map((c) => <li key={c}><IconoEstado color={c} />{t(`sem.${c}`)}</li>)}
            </ul>
          )}
        </div>
        <div className="acciones dos">
          {paso === 0
            ? <button type="button" className="boton" onClick={onCerrar}>{t('guia.saltar')}</button>
            : <button type="button" className="boton" onClick={() => setPaso(paso - 1)}>{t('guia.anterior')}</button>}
          <button type="button" className="boton primario" onClick={ultimo ? onCerrar : () => setPaso(paso + 1)}>
            {t(ultimo ? 'guia.empezar' : 'guia.siguiente')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuiaPrimerUso
