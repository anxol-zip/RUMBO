import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCuenta } from '../cuenta/contexto.js'
import { useDialogo } from '../hooks/useDialogo.js'
import { useIdioma } from '../i18n/contexto.js'

// Cuenta en la cabecera (feature 002): "Iniciar sesión" o, con sesión, el nombre con su menú.
// Si las cuentas no están configuradas (sin frontend/.env.local), no aparece nada.
function BotonCuenta({ catalogo, errorCatalogo, onReintentarCatalogo, onNavegar }) {
  const { t } = useIdioma()
  const { disponible, sesion, pidiendoEntrar, pedirEntrar, cancelarEntrar } = useCuenta()
  if (!disponible) return null
  return (
    <div className="cuenta">
      {sesion
        ? <CuentaConSesion key={sesion.user.id} catalogo={catalogo} errorCatalogo={errorCatalogo} onReintentarCatalogo={onReintentarCatalogo} onNavegar={onNavegar} />
        : <button type="button" className="boton boton-cuenta" onClick={pedirEntrar}>{t('cuenta.entrar')}</button>}
      {!sesion && pidiendoEntrar && <VentanaEntrar onCerrar={cancelarEntrar} />}
    </div>
  )
}

// Se desmonta al salir o cambiar de usuario: ningún panel o confirmación pasa a otra sesión.
function CuentaConSesion({ catalogo, errorCatalogo, onReintentarCatalogo, onNavegar }) {
  const { t } = useIdioma()
  const { perfil } = useCuenta()
  const [menu, setMenu] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const nombre = perfil?.nombre?.split(' ')[0] || t('cuenta.miCuenta')
  return <>
    <button type="button" className="boton boton-cuenta" aria-expanded={menu} aria-controls="menu-cuenta" onClick={() => setMenu((m) => !m)}>{nombre}</button>
    {menu && <MenuCuenta catalogo={catalogo} errorCatalogo={errorCatalogo} onReintentarCatalogo={onReintentarCatalogo}
      onCerrar={() => setMenu(false)} onNavegar={onNavegar} onBorrar={() => { setMenu(false); setBorrando(true) }} />}
    {borrando && <ConfirmarBorrado onCerrar={() => setBorrando(false)} />}
  </>
}

function MenuCuenta({ catalogo, errorCatalogo, onReintentarCatalogo, onCerrar, onBorrar, onNavegar }) {
  const { t } = useIdioma()
  const ubicacion = useLocation()
  const { perfil, usuario, favoritos, cargando, errorCuenta, recargarCuenta, salir, alternarFavorito } = useCuenta()
  const [quitando, setQuitando] = useState(null)
  const [saliendo, setSaliendo] = useState(false)
  const [errorAccion, setErrorAccion] = useState(null)
  const caja = useRef(null)
  useDialogo(caja, onCerrar)
  // Un clic fuera del menú lo cierra.
  useEffect(() => {
    const fuera = (e) => { if (!caja.current?.parentElement.contains(e.target)) onCerrar() }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [onCerrar])

  const nombre = perfil?.nombre || usuario.user_metadata?.full_name || usuario.user_metadata?.name || t('cuenta.miCuenta')
  const ids = [...(favoritos ?? [])]
  // Mantener la fila durante el guardado optimista permite conservar el foco y anunciar su estado.
  if (quitando !== null && !ids.includes(quitando)) ids.push(quitando)
  const lugares = ids.map((id) => catalogo.find((p) => p.id === id) ?? { id, nombre: t('cuenta.lugarNoDisponible'), ausente: true })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
  function enlace(id) {
    const parametros = new URLSearchParams(ubicacion.search)
    parametros.set('lugar', String(id))
    return { pathname: '/', search: `?${parametros}` }
  }

  async function quitar(id) {
    setErrorAccion(null)
    setQuitando(id)
    const correcto = await alternarFavorito(id)
    setQuitando(null)
    if (!correcto) setErrorAccion('cuenta.errorQuitar')
    // La fila quitada dejará de existir; continuar desde el título de Favoritos.
    caja.current?.querySelector('#titulo-favoritos')?.focus()
  }

  async function cerrarSesion() {
    setSaliendo(true)
    setErrorAccion(null)
    if (await salir()) onCerrar()
    else { setSaliendo(false); setErrorAccion('cuenta.errorSalir') }
  }

  return (
    <div id="menu-cuenta" ref={caja} className="menu-cuenta" role="group" aria-label={t('cuenta.miCuenta')}>
      <div className="menu-cuenta-identidad">
        <h2 className="menu-cuenta-nombre">{nombre}</h2>
        <button type="button" className="boton-texto" onClick={onCerrar}>{t('cuenta.cerrarPanel')}</button>
        {usuario.email && <p className="menu-cuenta-correo">{usuario.email}</p>}
      </div>
      <section className="menu-cuenta-favoritos" aria-labelledby="titulo-favoritos" aria-busy={cargando || quitando !== null}>
        <h3 id="titulo-favoritos" tabIndex={-1}>{t('filtros.favoritos')}</h3>
        {cargando ? <p role="status">{t('cuenta.cargando')}</p>
          : errorCuenta ? <div><p role="alert">{t('cuenta.errorCargar')}</p><button type="button" className="boton-texto" onClick={recargarCuenta}>{t('error.reintentar')}</button></div>
            : ids.length === 0 ? <p className="secundario">{t('filtros.sinFavoritos')}</p>
              : errorCatalogo ? <div><p role="alert">{t('cuenta.errorCargar')}</p><button type="button" className="boton-texto" onClick={onReintentarCatalogo}>{t('error.reintentar')}</button></div>
                : catalogo.length === 0 ? <p role="status">{t('cuenta.cargando')}</p>
                  : <ul className="menu-cuenta-lista">{lugares.map((p) => (
                    <li key={p.id}>
                      {p.ausente ? <p>{p.nombre}</p> : <Link to={enlace(p.id)} onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                        onCerrar(); onNavegar()
                      }}>{p.nombre}<span>{p.destino}</span></Link>}
                      <button type="button" className="boton-texto" disabled={quitando !== null || saliendo} onClick={() => quitar(p.id)}
                        aria-label={t('favorito.quitarLugar', { lugar: p.nombre })}>{t(quitando === p.id ? 'cuenta.guardando' : 'cuenta.quitar')}</button>
                    </li>
                  ))}</ul>}
      </section>
      {errorAccion && <p className="menu-cuenta-error" role="alert">{t(errorAccion)}</p>}
      <div className="menu-cuenta-acciones">
        <button type="button" className="boton ancho" disabled={saliendo || quitando !== null} onClick={cerrarSesion}>{t(saliendo ? 'cuenta.saliendo' : 'cuenta.salir')}</button>
        <button type="button" className="boton-texto peligro" disabled={saliendo || quitando !== null} onClick={onBorrar}>{t('cuenta.borrar')}</button>
      </div>
    </div>
  )
}

function VentanaEntrar({ onCerrar }) {
  const { t } = useIdioma()
  const { entrar } = useCuenta()
  const caja = useRef(null)
  useDialogo(caja, onCerrar, { atrapar: true })
  return (
    <DialogoCuenta titulo="titulo-entrar" onCerrar={onCerrar}>
      <div className="modal" ref={caja} onClick={(e) => e.stopPropagation()}>
        <h2 id="titulo-entrar">{t('cuenta.entrar')}</h2>
        <p className="secundario">{t('cuenta.paraQue')}</p>
        <button type="button" className="boton primario ancho grande" style={{ marginTop: 16 }} onClick={entrar}>
          {t('cuenta.continuarMicrosoft')} <span className="oculto-accesible">{t('cuenta.seAbreMicrosoft')}</span>
        </button>
        <p className="suave" style={{ marginTop: 8 }} aria-hidden="true">{t('cuenta.seAbreMicrosoft')}</p>
        <p style={{ marginTop: 12 }}><Link to="/acerca#privacidad" onClick={onCerrar}>{t('cuenta.privacidad')}</Link></p>
        <div className="acciones">
          <button type="button" className="boton" onClick={onCerrar}>{t('cuenta.cancelar')}</button>
        </div>
      </div>
    </DialogoCuenta>
  )
}

function ConfirmarBorrado({ onCerrar }) {
  const { t } = useIdioma()
  const { borrarCuenta } = useCuenta()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(false)
  const caja = useRef(null)
  // El foco empieza en "Cancelar": borrar es definitivo.
  useDialogo(caja, onCerrar, { atrapar: true, inicial: '[data-cancelar]' })

  async function borrar() {
    setEnviando(true)
    setError(false)
    try {
      if (await borrarCuenta()) onCerrar()
      else setError(true)
    } catch { setError(true) }
    finally { setEnviando(false) }
  }

  return (
    <DialogoCuenta titulo="titulo-borrar" descripcion="texto-borrar" role="alertdialog" onCerrar={onCerrar}>
      <div className="modal" ref={caja} onClick={(e) => e.stopPropagation()}>
        <h2 id="titulo-borrar">{t('cuenta.confirmarBorrado')}</h2>
        <p id="texto-borrar" className="secundario">{t('cuenta.borradoDefinitivo')}</p>
        {error && <p role="alert">{t('cuenta.errorBorrar')}</p>}
        <div className="acciones dos">
          <button type="button" className="boton" data-cancelar onClick={onCerrar}>{t('cuenta.cancelar')}</button>
          <button type="button" className="boton peligro" disabled={enviando} onClick={borrar}>{t('cuenta.borrar')}</button>
        </div>
      </div>
    </DialogoCuenta>
  )
}

// La capa superior nativa evita que el backdrop-filter de la cabecera limite el fondo fijo.
// showModal también impide interactuar con la página que queda detrás.
function DialogoCuenta({ titulo, descripcion, role = 'dialog', onCerrar, children }) {
  const dialogo = useRef(null)
  useLayoutEffect(() => {
    const elemento = dialogo.current
    const raiz = document.documentElement
    const overflow = raiz.style.overflow
    raiz.style.overflow = 'hidden'
    if (!elemento.open) elemento.showModal()
    return () => {
      elemento.close()
      raiz.style.overflow = overflow
    }
  }, [])

  return (
    <dialog
      ref={dialogo}
      className="dialogo-cuenta"
      role={role}
      aria-modal="true"
      aria-labelledby={titulo}
      aria-describedby={descripcion}
      onCancel={(evento) => { evento.preventDefault(); onCerrar() }}
      onKeyDown={(evento) => {
        if (evento.key !== 'Escape') return
        evento.preventDefault()
        evento.stopPropagation()
        onCerrar()
      }}
      onClick={(evento) => { if (evento.target === evento.currentTarget) onCerrar() }}
    >
      {children}
    </dialog>
  )
}

export default BotonCuenta
