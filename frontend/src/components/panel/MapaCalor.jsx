import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { CAPAS } from '../capaBase.js'
import CapaCalor from '../CapaCalor.jsx'
import ControlesMapa from '../ControlesMapa.jsx'
import Encuadrar from '../Encuadrar.jsx'
import LeyendaMapa from '../LeyendaMapa.jsx'
import { iconoSemaforo } from '../marcadores.js'
import { useIdioma } from '../../i18n/contexto.js'
import { ESCALA_MARCADOR, usePreferencias } from '../../preferencias/contexto.js'

// La leyenda ocupa la esquina superior derecha en escritorio.
const margenesPanel = (t) => (t.x <= 520 ? { arribaIzq: [24, 24], abajoDer: [24, 90] } : { arribaIzq: [24, 24], abajoDer: [230, 24] })

// Afluencia ahora (estimada + reportes): la misma capa de calor y el mismo semáforo que ve el turista.
function MapaCalor({ puntos }) {
  const { letra } = usePreferencias()
  const { t } = useIdioma()
  const tamano = Math.round(44 * ESCALA_MARCADOR[letra])
  return (
    <div className="mapa-caja">
      <div className="mapa">
        <MapContainer center={[19.04, -98.27]} zoom={11} zoomControl={false} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          {CAPAS.map((c) => <TileLayer key={c.url} {...c} />)}
          <CapaCalor puntos={puntos} />
          {puntos.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={iconoSemaforo(p.color, { tamano })}
              title={`${p.nombre}: ${t(`sem.${p.color}`)}${p.nivel != null ? ` (${t('gente.veces', { n: p.nivel.toFixed(1) })})` : ''}`}
              alt={`${p.nombre}: ${t(`sem.${p.color}`)}`}
            />
          ))}
          <Encuadrar puntos={puntos} margenes={margenesPanel} />
          <ControlesMapa textos={{ acercar: t('mapa.acercar'), alejar: t('mapa.alejar') }} />
        </MapContainer>
        <LeyendaMapa className="en-caja" />
      </div>
    </div>
  )
}

export default MapaCalor
