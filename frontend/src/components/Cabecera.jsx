import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import BotonCuenta from './BotonCuenta.jsx'
import EnVivo from './EnVivo.jsx'
import OpcionesLectura from './OpcionesLectura.jsx'
import { NOMBRE } from '../data/marca.js'
import { useIdioma } from '../i18n/contexto.js'
import { useCuenta } from '../cuenta/contexto.js'
import Icono from './Icono.jsx'

function Cabecera({ catalogo, cargandoCatalogo, errorCatalogo, onReintentarCatalogo }) {
  const { idioma, setIdioma, t } = useIdioma()
  const { pidiendoEntrar, sesion, perfil, cargando } = useCuenta()
  const administrador = Boolean(sesion && !cargando && perfil?.rol === 'administrador')
  const [abierto, setAbierto] = useState(false)
  const cabecera = useRef(null)
  const boton = useRef(null)
  const panel = useRef(null)
  const loginAnterior = useRef(pidiendoEntrar)

  useEffect(() => {
    // Al cerrar un login externo, el control de cuenta puede estar oculto en el menú móvil.
    const activo = document.activeElement
    if (loginAnterior.current && !pidiendoEntrar && !abierto && window.matchMedia('(max-width: 820px)').matches
      && (activo === document.body || !activo?.getClientRects().length)) boton.current?.focus()
    loginAnterior.current = pidiendoEntrar
  }, [pidiendoEntrar, abierto])

  useEffect(() => {
    const consulta = window.matchMedia('(max-width: 820px)')
    function cerrar(evento) {
      // Los diálogos de cuenta y lectura gestionan su propio Escape y foco.
      if (evento.target.closest('[role="dialog"], [role="alertdialog"], .panel-perfil, .opciones-lectura')) return
      if (evento.type === 'keydown') {
        if (evento.key !== 'Escape' || !consulta.matches) return
        setAbierto(false)
        if (panel.current?.contains(document.activeElement)) boton.current?.focus()
      } else if (!cabecera.current?.contains(evento.target)) setAbierto(false)
    }
    function redimensionar() {
      if (consulta.matches && panel.current?.contains(document.activeElement) && !document.activeElement.closest('[role="dialog"], [role="alertdialog"], .opciones-lectura')) boton.current?.focus()
      if (!consulta.matches && document.activeElement === boton.current) cabecera.current?.querySelector('.marca')?.focus()
      setAbierto(false)
    }
    document.addEventListener('keydown', cerrar)
    document.addEventListener('pointerdown', cerrar)
    consulta.addEventListener('change', redimensionar)
    return () => {
      document.removeEventListener('keydown', cerrar)
      document.removeEventListener('pointerdown', cerrar)
      consulta.removeEventListener('change', redimensionar)
    }
  }, [])

  function navegar() {
    setAbierto(false)
    if (window.matchMedia('(max-width: 820px)').matches) boton.current?.focus()
  }
  return (
    <header className={`cabecera${abierto ? ' menu-abierto' : ''}`} ref={cabecera}>
      <NavLink to="/" className="marca" aria-label={t('nav.inicio')}>
        <span className="marca-logo" aria-hidden="true"><span /></span>
        <span className="marca-texto">{NOMBRE}</span>
      </NavLink>

      <button ref={boton} type="button" className="boton-menu" aria-expanded={abierto} aria-controls="cabecera-panel" onClick={() => setAbierto((valor) => !valor)}>{t(abierto ? 'nav.cerrarMenu' : 'nav.menu')}</button>
      <div id="cabecera-panel" ref={panel} className={`cabecera-panel${abierto ? ' abierto' : ''}`}>
        <nav className="navegacion" aria-label={t('nav.secciones')} onClick={(evento) => { if (evento.target.closest('a')) navegar() }}>
          <NavLink to="/" end>{t('nav.explorar')}</NavLink>
          {administrador && <NavLink to="/panel">{t('nav.panel')}</NavLink>}
        </nav>

        <div className="cabecera-derecha">
          <EnVivo />
          <OpcionesLectura />
          {/* "Acerca de" (privacidad y créditos) fuera del menú principal: botón ⓘ junto al Aa.
              En celular va dentro del Menú, con su nombre escrito. */}
          <NavLink to="/acerca" className="boton-acerca" aria-label={t('nav.acerca')} title={t('nav.acerca')} onClick={navegar}>
            <Icono nombre="info" /><span className="boton-acerca-texto">{t('nav.acerca')}</span>
          </NavLink>
          <BotonCuenta catalogo={catalogo} cargandoCatalogo={cargandoCatalogo} errorCatalogo={errorCatalogo} onReintentarCatalogo={onReintentarCatalogo} onNavegar={navegar} />
          <div className="idioma" role="group" aria-label={t('idioma.grupo')}>
            <button type="button" lang="es" aria-pressed={idioma === 'es'} onClick={() => setIdioma('es')} aria-label="Español">ES</button>
            <button type="button" lang="en" aria-pressed={idioma === 'en'} onClick={() => setIdioma('en')} aria-label="English">EN</button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Cabecera
