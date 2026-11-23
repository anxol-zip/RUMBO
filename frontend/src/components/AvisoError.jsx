import { useIdioma } from '../i18n/contexto.js'

// Mensaje de error de toda la app. Recibe solo el código que reportó el componente que falló; el
// texto sale de i18n/textos.js ('error.<codigo>'), así que siempre está en el idioma de la persona.
function AvisoError({ codigo, onCerrar }) {
  const { t } = useIdioma()
  return (
    <div className="aviso-error" role="alert">
      <p>{t(`error.${codigo}`)}</p>
      <button type="button" className="boton-icono" onClick={onCerrar} aria-label={t('error.cerrar')}>✕</button>
    </div>
  )
}

export default AvisoError
