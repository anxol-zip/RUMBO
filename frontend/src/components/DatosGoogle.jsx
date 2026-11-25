import { useEffect, useState } from 'react'
import { api } from '../api/cliente.js'
import { textoPrecio } from '../data/precio.js'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// Horario y precio de Google Places (feature 004). Se piden después de abrir la ficha, así la ficha no espera a
// Google. Solo los lugares nuevos (verificado = false) tienen place_id; los 23 curados ni lo piden.
// Términos de Google: esto no se guarda en ningún lado, no va en el mapa y lleva la atribución "Google Maps".
function DatosGoogle({ puntoId, verificado }) {
  const { t, idioma } = useIdioma()
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    if (verificado) return undefined
    let vigente = true
    api.obtenerDatosGoogle(puntoId, idioma)
      .then((d) => { if (vigente) setDatos(d) })
      .catch(() => { if (vigente) setDatos(null) })      // sin Google la ficha queda igual
    return () => { vigente = false; setDatos(null) }
  }, [puntoId, verificado, idioma])

  const precio = textoPrecio(datos, t)
  // La región en vivo existe desde el inicio para que el lector anuncie los datos cuando llegan.
  return (
    <div aria-live="polite">
      {datos?.disponible && (
        <section className="datos-google" aria-labelledby="google-titulo">
          <h3 id="google-titulo" className="ficha-subtitulo">{t('google.titulo')}</h3>
          {datos.abierto_ahora != null && (
            <p className={`google-abierto ${datos.abierto_ahora ? 'si' : 'no'}`}>
              <Icono nombre="reloj" />{t(datos.abierto_ahora ? 'google.abierto' : 'google.cerrado')}
            </p>
          )}
          {precio && <p className="google-precio"><Icono nombre="etiqueta" />{precio}</p>}
          {datos.horario_semana.length > 0 && (
            <details className="google-semana">
              <summary>{t('google.semana')}</summary>
              <ul>{datos.horario_semana.map((d) => <li key={d}>{d}</li>)}</ul>
            </details>
          )}
          <p className="google-fuente">
            {t('google.fuente')}{datos.atribuciones.length > 0 && ` · ${datos.atribuciones.join(', ')}`}
          </p>
        </section>
      )}
    </div>
  )
}

export default DatosGoogle
