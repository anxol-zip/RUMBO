import { useIdioma } from '../../i18n/contexto.js'
import Semaforo from '../Semaforo.jsx'

// Umbrales por lugar: explican por qué un punto tiene ese color (turismo_core/semaforo.py). Es la parte
// técnica del panel, así que va plegada debajo del Observatorio.
function Umbrales({ filas }) {
  const { idioma, t } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'es-MX'
  return (
    <details className="plegable umbrales">
      <summary><span className="plegable-titulo">{t('tablero.umbralesTitulo')}</span></summary>
      <div className="plegable-cuerpo">
        <p className="tablero-sub">{t('tablero.umbralesSub')}</p>
        <div className="tabla-desplazable">
          <table className="tablero-tabla">
            <thead><tr><th>{t('tablero.col.lugar')}</th><th>{t('tablero.col.verdeBajo')}</th><th>{t('tablero.col.rojoSobre')}</th><th>{t('tablero.col.metodo')}</th></tr></thead>
            <tbody>
              {filas.map((u) => (
                <tr key={u.punto_id}>
                  <td>{u.nombre}</td>
                  {u.bajo == null
                    ? <td colSpan={3}><Semaforo color="sin_dato" /> {t('tablero.sinHistoria')}</td>
                    : <>
                        <td className="numero">{u.bajo.toFixed(2)}</td>
                        <td className="numero">{u.alto.toFixed(2)}</td>
                        <td>{t(`tablero.metodo.${u.metodo}`)}{u.n_muestras ? ` ${t('tablero.horas', { n: u.n_muestras.toLocaleString(locale) })}` : ''}</td>
                      </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  )
}

export default Umbrales
