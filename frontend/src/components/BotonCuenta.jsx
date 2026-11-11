import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCuenta } from '../cuenta/contexto.js'
import { useDialogo } from '../hooks/useDialogo.js'
import { useIdioma } from '../i18n/contexto.js'

// Cuenta en la cabecera (feature 002): "Iniciar sesión" o, con sesión, el nombre con su menú.
// Si las cuentas no están configuradas (sin frontend/.env.local), no aparece nada.
function BotonCuenta() {
  const { t } = useIdioma()
  const { disponible, sesion, perfil, pidiendoEntrar, pedirEntrar, cancelarEntrar } = useCuenta()
  const [menu, setMenu] = useState(false)
  const [borrando, setBorrando] = useState(false)
  if (!disponible) return null

  const nombre = perfil?.nombre.split(' ')[0] || t('cuenta.miCuenta')
  return (
    <div className="cuenta">
      {sesion
        ? <button type="button" className="boton boton-cuenta" aria-expanded={menu} aria-controls="menu-cuenta" onClick={() => setMenu((m) => !m)}>{nombre}</button>
        : <button type="button" className="boton boton-cuenta" onClick={pedirEntrar}>{t('cuenta.entrar')}</button>}
      {sesion && menu && <MenuCuenta onCerrar={() => setMenu(false)} onBorrar={() => { setMenu(false); setBorrando(true) }} />}
      {!sesion && pidiendoEntrar && <VentanaEntrar onCerrar={cancelarEntrar} />}
      {borrando && <ConfirmarBorrado onCerrar={() => setBorrando(false)} />}
    </div>
  )
}

function MenuCuenta({ onCerrar, onBorrar }) {
  const { t } = useIdioma()
  const { perfil, salir } = useCuenta()
  const caja = useRef(null)
  useDialogo(caja, onCerrar)
  // Un clic fuera del menú lo cierra.
  useEffect(() => {
    const fuera = (e) => { if (!caja.current?.parentElement.contains(e.target)) onCerrar() }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [onCerrar])
  return (
    <div id="menu-cuenta" ref={caja} className="menu-cuenta" role="group" aria-label={t('cuenta.miCuenta')}>
      {perfil?.nombre && <p className="menu-cuenta-nombre">{perfil.nombre}</p>}
      <button type="button" className="boton ancho" onClick={() => { onCerrar(); salir() }}>{t('cuenta.salir')}</button>
      <button type="button" className="boton-texto peligro" onClick={onBorrar}>{t('cuenta.borrar')}</button>
    </div>
  )
}

function VentanaEntrar({ onCerrar }) {
  const { t } = useIdioma()
  const { entrar } = useCuenta()
  const caja = useRef(null)
  useDialogo(caja, onCerrar, { atrapar: true })
  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-entrar" onClick={onCerrar}>
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
    </div>
  )
}

function ConfirmarBorrado({ onCerrar }) {
  const { t } = useIdioma()
  const { borrarCuenta } = useCuenta()
  const [enviando, setEnviando] = useState(false)
  const caja = useRef(null)
  // El foco empieza en "Cancelar": borrar es definitivo.
  useDialogo(caja, onCerrar, { atrapar: true, inicial: '[data-cancelar]' })

  async function borrar() {
    setEnviando(true)
    await borrarCuenta()
    onCerrar()
  }

  return (
    <div className="modal-fondo" role="alertdialog" aria-modal="true" aria-labelledby="titulo-borrar" aria-describedby="texto-borrar" onClick={onCerrar}>
      <div className="modal" ref={caja} onClick={(e) => e.stopPropagation()}>
        <h2 id="titulo-borrar">{t('cuenta.confirmarBorrado')}</h2>
        <p id="texto-borrar" className="secundario">{t('cuenta.borradoDefinitivo')}</p>
        <div className="acciones dos">
          <button type="button" className="boton" data-cancelar onClick={onCerrar}>{t('cuenta.cancelar')}</button>
          <button type="button" className="boton peligro" disabled={enviando} onClick={borrar}>{t('cuenta.borrar')}</button>
        </div>
      </div>
    </div>
  )
}

export default BotonCuenta
