import { useIdioma } from '../../i18n/contexto.js'
import Icono from '../Icono.jsx'
import IconoEstado from '../IconoEstado.jsx'

const ICONO = { moderacion: 'estrella', llenos: 'personas', ajustes: 'semaforo' }

// "Requiere atención": lo primero del panel. Cada aviso dice cuántos son, qué hay detrás y lleva a donde
// se resuelve. Sin pendientes, una sola línea tranquila: el panel no inventa urgencias.
function Atencion({ avisos, cargandoDenuncias, onIr }) {
  const { t } = useIdioma()
  if (avisos.length === 0) {
    return (
      <p className="atencion-ok" role="status">
        <IconoEstado color="verde" />
        <span><strong>{t('tablero.ok')}</strong> {t(cargandoDenuncias ? 'tablero.okCargando' : 'tablero.okTexto')}</span>
      </p>
    )
  }
  const detalle = (a) => (a.clave === 'moderacion' ? t(a.denuncias === 1 ? 'tablero.aviso.moderacionUna' : 'tablero.aviso.moderacionVarias', { n: a.denuncias })
    : a.clave === 'llenos' ? a.nombres.join(t('lista.y')) + (a.n > a.nombres.length ? t('tablero.aviso.yMas', { n: a.n - a.nombres.length }) : '')
      : t('tablero.aviso.vence', { lugar: a.nombre, hora: a.vence }))
  return (
    <section className="atencion" aria-labelledby="atencion-titulo">
      <h2 id="atencion-titulo">{t('tablero.atencion')}</h2>
      <ul className="atencion-lista">
        {avisos.map((a) => (
          <li key={a.clave} className={`atencion-aviso aviso-${a.clave}`}>
            <span className="atencion-icono" aria-hidden="true"><Icono nombre={ICONO[a.clave]} /></span>
            <div className="atencion-texto">
              <p className="atencion-titulo"><span className="numero">{a.n}</span> {t(`tablero.aviso.${a.clave}${a.n === 1 ? 'Uno' : 'Varios'}`)}</p>
              <p className="atencion-detalle">{detalle(a)}</p>
            </div>
            <button type="button" className="boton" onClick={() => onIr(a.pestana, a.clave === 'llenos' ? null : a.puntoId, a.clave === 'llenos' ? 'tablero-lugares' : null)}>
              {t(`tablero.aviso.${a.clave}Accion`)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Atencion
