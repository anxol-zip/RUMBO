import { pesos } from '../../data/formato.js'
import { useIdioma } from '../../i18n/contexto.js'
import Icono from '../Icono.jsx'

// ¿A dónde se fueron los turistas? Cada flujo es "de → a": qué lugar pidieron, a cuál los mandó la app,
// por qué y cuántos aceptaron. Si hubo derrama, se desglosa por destino. Solo agregados (RN_12).
function Redirecciones({ datos, derrama }) {
  const { t } = useIdioma()
  const { filas } = datos
  if (filas.length === 0) {
    return <p className="tablero-vacio">{t('tablero.redirVacio')}</p>
  }
  return (
    <>
      <p className="tablero-resumen">{t(datos.total_sugeridas === 1 ? 'tablero.redirResumenUna' : 'tablero.redirResumen', { s: datos.total_sugeridas, a: datos.total_aceptadas })}</p>
      <ul className="flujos">
        {filas.map((f) => {
          const pct = f.sugeridas ? Math.round((f.aceptadas / f.sugeridas) * 100) : 0
          return (
            <li key={`${f.desde_id}-${f.hacia_id}-${f.motivo}`} className="flujo">
              <div className="flujo-ruta">
                <span>{f.desde ?? t('tablero.sinPedido')}</span>
                <Icono nombre="derecha" />
                <strong>{f.hacia}</strong>
              </div>
              <span className="insignia">{t(`tablero.motivo.${f.motivo}`)}</span>
              <div className="flujo-medida">
                <div className="progreso" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
                <span className="numero">{t('tablero.flujoAceptadas', { a: f.aceptadas, s: f.sugeridas })}</span>
              </div>
            </li>
          )
        })}
      </ul>
      {derrama.por_destino.length > 0 && (
        <div className="tabla-desplazable">
          <table className="tablero-tabla">
            <caption>{t('tablero.derramaDestino')}</caption>
            <thead><tr><th>{t('tablero.col.destino')}</th><th>{t('tablero.col.aceptadas')}</th><th>{t('tablero.col.redis')}</th><th>{t('tablero.col.nueva')}</th></tr></thead>
            <tbody>
              {derrama.por_destino.map((d) => (
                <tr key={d.destino}>
                  <td>{d.destino}</td><td className="numero">{d.aceptadas}</td>
                  <td className="numero">{pesos(d.redistribuida_mxn)}</td><td className="numero">{pesos(d.nueva_mxn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Redirecciones
