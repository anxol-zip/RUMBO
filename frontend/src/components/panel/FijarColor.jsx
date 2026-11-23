import { useState } from 'react'
import { codigoDe } from '../../api/cliente.js'
import { hora } from '../../data/formato.js'
import { useIdioma } from '../../i18n/contexto.js'
import IconoEstado from '../IconoEstado.jsx'
import SelectorLugar from '../SelectorLugar.jsx'
import Semaforo from '../Semaforo.jsx'

const COLORES = ['verde', 'amarillo', 'rojo']
const DURACIONES = [1, 2, 4, 8]

// "Fijar color" (RN_16): para cierres, obras o filas que el modelo no ve. Gana sobre el cálculo hasta
// la hora de fin y el turista ve el motivo. A la izquierda el formulario, en el orden en que se
// decide (lugar, color, motivo, cuánto tiempo); a la derecha lo que ya está vigente. Los botones dicen
// el nombre del color (Verde, Amarillo, Rojo): para la Secretaría es más directo que el texto del turista.
// puntoInicial: el lugar elegido desde un aviso o desde la lista del resumen.
function FijarColor({ puntos, puntoInicial, ajustes, onFijar, onQuitar, onError }) {
  const { t } = useIdioma()
  const [puntoId, setPuntoId] = useState(puntoInicial ?? puntos[0]?.id ?? '')
  const [color, setColor] = useState('rojo')
  const [motivo, setMotivo] = useState('')
  const [horas, setHoras] = useState(2)
  const [enviando, setEnviando] = useState(false)
  const actual = puntos.find((p) => p.id === puntoId)
  const valido = motivo.trim().length >= 3

  async function enviar(evento) {
    evento.preventDefault()
    if (!valido) return
    setEnviando(true)
    try {
      await onFijar({ puntoId, color, motivo: motivo.trim(), horas })
      setMotivo('')
      onError(null)
    } catch (e) {
      onError(codigoDe(e))
    } finally { setEnviando(false) }
  }

  return (
    <div className="ajustes">
      <form className="formulario" onSubmit={enviar}>
        <p className="tablero-campo" id="etiqueta-fijar">{t('tablero.ajuste.lugar')}</p>
        <SelectorLugar puntos={puntos} valor={puntoId} onCambiar={setPuntoId} etiquetaId="etiqueta-fijar"
          textos={{ elige: t('tablero.ajuste.elige'), buscar: t('tablero.ajuste.buscar'), sinResultados: t('tablero.ajuste.sinResultados') }} />
        {actual && <p className="tablero-ayuda">{t('tablero.ajuste.ahora')} <Semaforo color={actual.color} /></p>}

        <p className="tablero-campo" id="etiqueta-color">{t('tablero.ajuste.color')}</p>
        <div className="colores" role="group" aria-labelledby="etiqueta-color">
          {COLORES.map((c) => (
            <button key={c} type="button" className={`color-opcion ${c}`} aria-pressed={color === c} onClick={() => setColor(c)}>
              <IconoEstado color={c} />{t(`tablero.color.${c}`)}
            </button>
          ))}
        </div>

        <label className="tablero-campo" htmlFor="fijar-motivo">{t('tablero.ajuste.motivo')}</label>
        <input id="fijar-motivo" className="campo" maxLength={200} placeholder={t('tablero.ajuste.motivoEjemplo')} value={motivo}
          onChange={(e) => setMotivo(e.target.value)} aria-describedby="fijar-motivo-ayuda" />
        <p id="fijar-motivo-ayuda" className="tablero-ayuda">{t('tablero.ajuste.motivoAyuda')}</p>

        <p className="tablero-campo" id="etiqueta-duracion">{t('tablero.ajuste.duracion')}</p>
        <div className="segmentado ancho" role="group" aria-labelledby="etiqueta-duracion">
          {DURACIONES.map((h) => (
            <button key={h} type="button" aria-pressed={horas === h} onClick={() => setHoras(h)}>{t('tablero.ajuste.horas', { n: h })}</button>
          ))}
        </div>

        <button type="submit" className="boton primario grande" disabled={!valido || enviando}>
          {actual ? t('tablero.ajuste.fijarEn', { lugar: actual.nombre, color: t(`tablero.color.${color}`).toLowerCase() }) : t('tablero.ajuste.fijar')}
        </button>
      </form>

      <section className="ajustes-vigentes" aria-labelledby="ajustes-vigentes-titulo">
        <h3 id="ajustes-vigentes-titulo">{t('tablero.ajuste.vigentes')}</h3>
        {ajustes.length === 0 && <p className="tablero-vacio">{t('tablero.ajuste.ninguno')}</p>}
        <ul>
          {ajustes.map((a) => (
            <li key={a.id} className="ajuste">
              <div className="ajuste-cabeza"><p className="ajuste-lugar">{a.nombre}</p><Semaforo color={a.color} /></div>
              <p className="ajuste-motivo">{a.motivo}</p>
              <p className="tablero-ayuda">{t('tablero.ajuste.hasta', { hora: hora(a.hasta) })}</p>
              <button type="button" className="boton-texto" onClick={() => onQuitar(a.id)}>{t('tablero.ajuste.quitar')}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default FijarColor
