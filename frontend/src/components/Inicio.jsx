import { useState } from 'react'
import { codigoDe } from '../api/cliente.js'
import { rutaFoto } from '../data/fotos.js'
import { useCuenta } from '../cuenta/contexto.js'
import { INTERESES, TIEMPOS } from '../data/intereses.js'
import { useIdioma } from '../i18n/contexto.js'
import SelectorLugar from './SelectorLugar.jsx'

// Una postal por destino de la zona piloto.
const POSTALES = [
  { id: 'catedral', destino: 'Puebla' },
  { id: 'zona_arq_cholula', destino: 'Cholula' },
  { id: 'atlixco_centro', destino: 'Atlixco' },
]

// Punto de partida por omisión: el zócalo de Puebla, donde empieza casi cualquier visita.
const porClave = (puntos, clave) => puntos.find((p) => p.clave === clave)

// T1 — Inicio (CU_01): intereses, tiempo disponible y dónde está el turista.
// Pantalla propia, sin el mapa detrás: el mapa aparece hasta que el turista termina.
// Sin GPS: en http por la red del stand el celular no lo da (docs/05c §4).
function Inicio({ puntos, onListo, onError }) {
  const { t } = useIdioma()
  const { perfil, guardarGustos } = useCuenta()
  // Con cuenta, empiezan marcados los gustos guardados (FR-017); sin cuenta, los de siempre.
  const [elegidos, setIntereses] = useState(null)
  const guardados = (perfil?.gustos ?? []).filter((g) => INTERESES.includes(g))
  const intereses = elegidos ?? (guardados.length > 0 ? guardados : ['historia', 'arte'])
  const [horas, setHoras] = useState(5)
  const [origenId, setOrigenId] = useState(() => (porClave(puntos, 'zocalo_puebla') ?? porClave(puntos, 'catedral') ?? puntos[0]).id)
  const [enviando, setEnviando] = useState(false)

  function alternarInteres(id) {
    if (intereses.includes(id)) setIntereses(intereses.filter((i) => i !== id))
    else setIntereses([...intereses, id])
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    onError(null)
    try {
      if (perfil) guardarGustos(intereses)          // la cuenta los recuerda (FR-016)
      await onListo({ intereses, horas, origenId })
    } catch (e) {
      onError(codigoDe(e))
      setEnviando(false)
    }
  }

  return (
    <div className="inicio">
      <div className="inicio-portada">
        <div className="portada-texto">
          <h1 className="titular">{t('inicio.titular')}</h1>
          <p className="lema">{t('inicio.lema')}</p>
        </div>
        <div className="postales" aria-hidden="true">
          {POSTALES.map((p) => (
            <figure key={p.id} className="postal">
              <img src={rutaFoto(p.id)} alt="" width="900" height="600" />
              <figcaption>{p.destino}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <form className="inicio-contenido" onSubmit={enviar}>
        <fieldset className="pregunta">
          <legend>{t('inicio.gusta')}</legend>
          <p className="ayuda">{t('inicio.gustaAyuda')}</p>
          <div className="chips">
            {INTERESES.map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={intereses.includes(id)} onClick={() => alternarInteres(id)}>
                {t(`interes.${id}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pregunta">
          <legend>{t('inicio.tiempo')}</legend>
          <div className="segmentado ancho">
            {TIEMPOS.map((h) => (
              <button key={h} type="button" aria-pressed={horas === h} onClick={() => setHoras(h)}>
                {t(`tiempo.${h}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pregunta">
          <legend id="etiqueta-origen">{t('inicio.donde')}</legend>
          <p className="ayuda">{t('inicio.dondeAyuda')}</p>
          <SelectorLugar
            puntos={puntos}
            valor={origenId}
            onCambiar={setOrigenId}
            etiquetaId="etiqueta-origen"
            textos={{ elige: t('selector.elige'), buscar: t('selector.buscar'), sinResultados: t('selector.vacio') }}
          />
        </fieldset>

        <button type="submit" className="boton primario ancho grande" disabled={intereses.length === 0 || enviando}>
          {enviando ? t('inicio.calculando') : t('inicio.boton')}
        </button>
        <p className="nota-privacidad">{t('inicio.privacidad')}</p>
      </form>
    </div>
  )
}

export default Inicio
