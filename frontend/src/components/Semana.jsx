import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// Botón "¿Cuándo me conviene ir? Ver la semana" de la ficha. La semana se abre en su propia
// vista (VistaSemana), que reemplaza la ficha mientras está abierta.
function Semana({ onAbrir, ref }) {
  const { t } = useIdioma()
  return (
    <button ref={ref} type="button" className="boton ancho semana-ver" onClick={onAbrir}>
      <Icono nombre="calendario" />
      <span>{t('semana.ver')}</span>
      <Icono nombre="derecha" className="semana-ver-flecha" />
    </button>
  )
}

export default Semana
