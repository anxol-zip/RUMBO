import { medidorGente } from '../../data/genteAhora.js'
import { useIdioma } from '../../i18n/contexto.js'
import Semaforo from '../Semaforo.jsx'

// Los destinos del Observatorio en el mes, cada uno contra su propia historia (capa estructural).
// Cada renglón lleva la misma barra de tres tramos que "Gente ahora" en la ficha: el tramo es el color
// y la marca dice qué tan cerca está del siguiente. Del más al menos lleno (así lo manda el backend).
function SemaforoEstatal({ estatal }) {
  const { idioma, t } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'es-MX'
  const mes = new Date(estatal.anio, estatal.mes - 1, 15).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const estimados = estatal.destinos.some((d) => d.tipo === 'estimado')
  return (
    <section aria-labelledby="estatal-titulo">
      <h2 id="estatal-titulo">{t('tablero.estatalTitulo', { mes })}</h2>
      <p className="tablero-sub">{t('tablero.estatalSub')}</p>
      {estimados && <p className="aviso info">{t('tablero.estatalEstimado')}</p>}
      <ul className="estatal-lista">
        {estatal.destinos.map((d) => {
          const medidor = medidorGente(d.nivel, d.umbrales)
          return (
            <li key={d.destino_id}>
              <div className="estatal-nombre">
                <p>{d.destino}{d.tipo === 'estimado' && <span className="tablero-ayuda"> {t('tablero.estimado')}</span>}</p>
                {d.visitantes != null && <p className="tablero-ayuda numero">{t('tablero.visitantes', { n: d.visitantes.toLocaleString(locale) })}</p>}
              </div>
              {medidor
                ? <div className="gente-barra estatal-barra" aria-hidden="true">
                    {medidor.zonas.map((z) => <span key={z.color} className={`gente-tramo ${z.color}${z.color === medidor.zona ? ' activo' : ''}`} style={{ width: `${z.ancho}%` }} />)}
                    <span className="gente-marca" style={{ left: `${medidor.posicion}%` }} />
                  </div>
                : <span />}
              <Semaforo color={d.color} />
            </li>
          )
        })}
      </ul>
      <details className="plegable">
        <summary><span className="plegable-titulo">{t('tablero.estatalComo')}</span></summary>
        <div className="plegable-cuerpo"><p>{t('tablero.estatalMetodo')}</p></div>
      </details>
      <p className="fuente-dato">{t('tablero.fuente', { fuente: estatal.fuente })}</p>
    </section>
  )
}

export default SemaforoEstatal
