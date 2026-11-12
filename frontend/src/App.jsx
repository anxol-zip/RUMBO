import { useCallback, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { api, codigoDe } from './api/cliente.js'
import AvisoError from './components/AvisoError.jsx'
import Cabecera from './components/Cabecera.jsx'
import { useCuenta } from './cuenta/contexto.js'
import { useIdioma } from './i18n/contexto.js'
import Acerca from './pages/Acerca.jsx'
import Panel from './pages/Panel.jsx'
import Turista from './pages/Turista.jsx'

function App() {
  const { t } = useIdioma()
  const { aviso, perfil, guardarGustos } = useCuenta()
  // Estado que comparten varias pantallas: vive aquí y baja por props (docs/05c §3.3).
  const [catalogo, setCatalogo] = useState([])
  const [errorCatalogo, setErrorCatalogo] = useState(false)
  const [sesion, setSesion] = useState(null)        // { sesionId, perfil: { intereses, horas, origenId } }

  // Código del último error: las pantallas lo reportan con onError y aquí se convierte en mensaje.
  const [errorCodigo, setErrorCodigo] = useState(null)

  const cargarCatalogo = useCallback(() => {
    api.obtenerPuntos()
      .then((puntos) => { setCatalogo(puntos); setErrorCatalogo(false); setErrorCodigo(null) })
      .catch((e) => { setErrorCatalogo(true); setErrorCodigo(codigoDe(e)) })
  }, [])

  useEffect(() => { cargarCatalogo() }, [cargarCatalogo])

  // Cuenta nueva sin gustos: se guardan los que la persona ya eligió en esta visita (FR-017).
  const deLaVisita = sesion?.perfil.intereses
  useEffect(() => {
    if (perfil && perfil.gustos.length === 0 && deLaVisita?.length > 0) guardarGustos(deLaVisita)
  }, [perfil, deLaVisita, guardarGustos])

  return (
    <div className="app">
      {/* Primer elemento con teclado: salta la cabecera (D6) */}
      <a className="saltar" href="#contenido">{t('saltar')}</a>
      <Cabecera />
      {/* Avisos de la cuenta (sesión iniciada, guardado, límite…): se ven y el lector de pantalla los anuncia. */}
      <p className="aviso-cuenta" role="status" aria-live="polite">{aviso && t(aviso.clave)}</p>
      {errorCodigo && <AvisoError codigo={errorCodigo} onCerrar={() => setErrorCodigo(null)} />}
      <main className="app-principal" id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Turista catalogo={catalogo} errorCatalogo={errorCatalogo} onReintentar={cargarCatalogo} sesion={sesion} onSesion={setSesion} onError={setErrorCodigo} />} />
          <Route path="/panel" element={<Panel onError={setErrorCodigo} />} />
          <Route path="/acerca" element={<Acerca />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
