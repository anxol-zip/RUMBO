import { intensidad, RAMPA } from '../data/calor.js'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// "Gente ahora": la afluencia relativa en una barra de Menos a Más, con la misma rampa rosa
// del mapa de calor. nivel 1.0 = una hora normal en ese lugar (cae a la mitad de la barra).
// Cerrado o sin dato: no hay barra, porque no hay nada que medir.
function GenteAhora({ nivel, color }) {
  const { t } = useIdioma()
  if (nivel == null || color === 'cerrado' || color === 'sin_dato') return null
  const pos = Math.round(intensidad(nivel) * 100)
  const texto = t(pos < 34 ? 'gente.poca' : pos < 67 ? 'gente.normal' : 'gente.mucha')
  return (
    <div className="gente-ahora">
      <p className="gente-ahora-titulo"><Icono nombre="personas" />{t('leyenda.titulo')}</p>
      <div className="gente-barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pos}
        aria-valuetext={texto} aria-label={t('leyenda.titulo')}>
        <div className="gente-rampa" style={{ background: `linear-gradient(90deg, ${RAMPA.join(', ')})` }} />
        <span className="gente-marca" style={{ left: `${pos}%` }} />
      </div>
      <div className="gente-extremos" aria-hidden="true"><span>{t('leyenda.menos')}</span><span>{t('leyenda.mas')}</span></div>
    </div>
  )
}

export default GenteAhora
