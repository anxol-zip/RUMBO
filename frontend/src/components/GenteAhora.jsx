import { medidorGente, textoNivel } from '../data/genteAhora.js'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// "Gente ahora": dónde está la afluencia de este lugar contra su propia escala. Los tres tramos son
// los del semáforo (tranquilo, lo habitual, lleno) y el tramo en el que cae se marca con su color;
// los otros dos quedan tenues. Así la barra explica el color en lugar de competir con él.
// No sale con lugar cerrado, sin dato o con ajuste de la Secretaría (ahí el color no viene del nivel).
function GenteAhora({ nivel, umbrales, color, ajustado }) {
  const { t } = useIdioma()
  const medidor = !ajustado && ['verde', 'amarillo', 'rojo'].includes(color) ? medidorGente(nivel, umbrales) : null
  if (!medidor) return null
  const texto = textoNivel(nivel, t)
  return (
    <section className="gente-ahora" aria-labelledby="gente-titulo">
      <div className="gente-cabeza">
        <p id="gente-titulo" className="gente-titulo"><Icono nombre="personas" />{t('gente.titulo')}</p>
        <p className="gente-nivel">{texto}</p>
      </div>
      <div className="gente-barra" role="meter" aria-labelledby="gente-titulo" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(medidor.posicion)} aria-valuetext={`${t(`gente.${medidor.zona}`)}: ${texto}`}>
        {medidor.zonas.map((z) => (
          <span key={z.color} className={`gente-tramo ${z.color}${z.color === medidor.zona ? ' activo' : ''}`} style={{ width: `${z.ancho}%` }} />
        ))}
        <span className="gente-marca" style={{ left: `${medidor.posicion}%` }} />
      </div>
      <div className="gente-etiquetas" aria-hidden="true">
        {medidor.zonas.map((z) => (
          <span key={z.color} className={z.color === medidor.zona ? 'activa' : undefined} style={{ width: `${z.ancho}%` }}>{t(`gente.${z.color}`)}</span>
        ))}
      </div>
    </section>
  )
}

export default GenteAhora
