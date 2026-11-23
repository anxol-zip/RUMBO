import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCuenta } from '../cuenta/contexto.js'
import { useDialogo } from '../hooks/useDialogo.js'
import { useIdioma } from '../i18n/contexto.js'
import PanelPerfil from '../cuenta/PanelPerfil.jsx'
import { iniciales, nombreVisible } from '../cuenta/nombre.js'

// Cuenta en la cabecera (feature 002): "Iniciar sesión" o, con sesión, el avatar que abre el panel de perfil.
// Si las cuentas no están configuradas (sin frontend/.env.local), no aparece nada.
function BotonCuenta({ catalogo, cargandoCatalogo, errorCatalogo, onReintentarCatalogo, onNavegar }) {
  const { t } = useIdioma()
  const { disponible, sesion, pidiendoEntrar, pedirEntrar, cancelarEntrar } = useCuenta()
  if (!disponible) return null
  return (
    <div className="cuenta">
      {sesion
        ? <CuentaConSesion key={sesion.user.id} catalogo={catalogo} cargandoCatalogo={cargandoCatalogo} errorCatalogo={errorCatalogo} onReintentarCatalogo={onReintentarCatalogo} onNavegar={onNavegar} />
        : <button type="button" className="boton boton-cuenta" onClick={pedirEntrar}>{t('cuenta.entrar')}</button>}
      {!sesion && pidiendoEntrar && <VentanaEntrar onCerrar={cancelarEntrar} />}
    </div>
  )
}

// Se desmonta al salir o cambiar de usuario: ningún panel o confirmación pasa a otra sesión.
// El botón es el avatar con las iniciales: el nombre de las cuentas institucionales llega como
// "APELLIDOS NOMBRE", y mostrar la primera palabra saludaba a la persona por su apellido.
function CuentaConSesion({ catalogo, cargandoCatalogo, errorCatalogo, onReintentarCatalogo, onNavegar }) {
  const { t } = useIdioma()
  const { perfil, usuario } = useCuenta()
  const [abierto, setAbierto] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const nombre = perfil?.nombre || usuario.user_metadata?.full_name || usuario.user_metadata?.name || ''
  const visible = nombreVisible(nombre)
  return <>
    <button type="button" className="boton boton-cuenta" aria-haspopup="dialog" aria-expanded={abierto}
      aria-label={visible ? t('perfil.botonDe', { nombre: visible }) : t('perfil.boton')} onClick={() => setAbierto(true)}>
      <span className="avatar" aria-hidden="true">{iniciales(nombre, usuario.email)}</span>
      <span className="boton-cuenta-texto" aria-hidden="true">{t('perfil.boton')}</span>
    </button>
    {abierto && <PanelPerfil catalogo={catalogo} cargandoCatalogo={cargandoCatalogo} errorCatalogo={errorCatalogo} onReintentarCatalogo={onReintentarCatalogo}
      onCerrar={() => setAbierto(false)} onNavegar={onNavegar} onBorrar={() => { setAbierto(false); setBorrando(true) }} />}
    {borrando && <ConfirmarBorrado onCerrar={() => setBorrando(false)} />}
  </>
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
