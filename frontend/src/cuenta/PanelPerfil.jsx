import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Esqueleto from '../components/Esqueleto.jsx'
import Foto from '../components/Foto.jsx'
import Icono from '../components/Icono.jsx'
import Semaforo from '../components/Semaforo.jsx'
import { INTERESES } from '../data/intereses.js'
import { useIdioma } from '../i18n/contexto.js'
import { useCuenta } from './contexto.js'
import { useMisResenas, useSemaforoAhora } from './datosPerfil.js'
import { iniciales, nombreVisible } from './nombre.js'
import { ordenarFavoritos } from './ordenFavoritos.js'

const PESTANAS = ['favoritos', 'resenas', 'gustos']
const CLAVE_AMPLIO = 'rumbo:perfilAmplio'

function leerAmplio() {
  try { return localStorage.getItem(CLAVE_AMPLIO) === '1' } catch { return false }
}

// Panel de perfil (contenedor): junta la cuenta, los Favoritos con su estado de ahora, mis reseñas y
// mis gustos, y se los pasa a VistaPerfil, que solo pinta. Se abre desde el avatar de la cabecera,
// del lado derecho: la ficha de un lugar vive a la izquierda y el mapa queda en medio.
function PanelPerfil({ catalogo, cargandoCatalogo, errorCatalogo, onReintentarCatalogo, onCerrar, onBorrar, onNavegar }) {
  const ubicacion = useLocation()
  const { perfil, usuario, favoritos, cargando, errorCuenta, recargarCuenta, salir, alternarFavorito, guardarGustos } = useCuenta()
  const [pestana, setPestana] = useState('favoritos')
  const [amplio, setAmplio] = useState(leerAmplio)
  const [quitando, setQuitando] = useState(null)
  const [saliendo, setSaliendo] = useState(false)
  const [errorAccion, setErrorAccion] = useState(null)
  const [gustosEstado, setGustosEstado] = useState(null)    // null | 'guardando' | 'guardado' | 'error'
  const semaforo = useSemaforoAhora(true)
  const resenas = useMisResenas(usuario.id)

  const ids = [...(favoritos ?? [])]
  // La fila se queda mientras se guarda: conserva el foco y anuncia su estado.
  if (quitando !== null && !ids.includes(quitando)) ids.push(quitando)
  const lugares = ordenarFavoritos(ids, catalogo, semaforo)
  const cargandoFavoritos = cargando || (!errorCuenta && ids.length > 0 && catalogo.length === 0 && cargandoCatalogo)

  const enlace = useCallback((id) => {
    const parametros = new URLSearchParams(ubicacion.search)
    parametros.set('lugar', String(id))
    return { pathname: '/', search: `?${parametros}` }
  }, [ubicacion.search])

  function alternarAmplio() {
    setAmplio((a) => {
      try { localStorage.setItem(CLAVE_AMPLIO, a ? '0' : '1') } catch { /* solo dura esta visita */ }
      return !a
    })
  }

  async function quitar(id) {
    setErrorAccion(null)
    setQuitando(id)
    const correcto = await alternarFavorito(id)
    setQuitando(null)
    if (!correcto) setErrorAccion('cuenta.errorQuitar')
    document.getElementById('perfil-panel-favoritos')?.focus()
  }

  async function cambiarGustos(gustos) {
    setGustosEstado('guardando')
    setGustosEstado(await guardarGustos(gustos) ? 'guardado' : 'error')
  }

  async function cerrarSesion() {
    setSaliendo(true)
    setErrorAccion(null)
    if (await salir()) onCerrar()
    else { setSaliendo(false); setErrorAccion('cuenta.errorSalir') }
  }

  const nombre = perfil?.nombre || usuario.user_metadata?.full_name || usuario.user_metadata?.name || ''
  return (
    <VistaPerfil
      nombre={nombre} correo={usuario.email}
      pestana={pestana} onPestana={setPestana}
      amplio={amplio} onAlternarAmplio={alternarAmplio}
      favoritos={{
        lugares, quitando,
        estado: cargandoFavoritos ? 'cargando' : (errorCuenta || (ids.length > 0 && errorCatalogo)) ? 'error' : 'listo',
        conEstado: semaforo !== null && semaforo.size > 0,
        onReintentar: errorCuenta ? recargarCuenta : onReintentarCatalogo,
        onQuitar: quitar,
      }}
      resenas={{ ...resenas, catalogo }}
      gustos={{ elegidos: perfil?.gustos ?? [], estado: gustosEstado, onCambiar: cambiarGustos }}
      enlace={enlace}
      onAbrirLugar={() => { onCerrar(); onNavegar() }}
      ocupado={saliendo || quitando !== null}
      saliendo={saliendo}
      errorAccion={errorAccion}
      onSalir={cerrarSesion}
      onBorrar={onBorrar}
      onCerrar={onCerrar}
    />
  )
}

// Panel de perfil (pantalla): recibe todo por props, sin pedir nada. Es un <dialog> modal en la capa
// superior del navegador: el backdrop-filter de la cabecera no lo recorta, Esc lo cierra y el resto
// de la página queda inerte mientras está abierto.
export function VistaPerfil({ nombre, correo, pestana, onPestana, amplio, onAlternarAmplio, favoritos, resenas, gustos,
  enlace, onAbrirLugar, ocupado, saliendo, errorAccion, onSalir, onBorrar, onCerrar }) {
  const { t } = useIdioma()
  const dialogo = useRef(null)
  const visible = nombreVisible(nombre) || t('cuenta.miCuenta')

  useLayoutEffect(() => {
    const elemento = dialogo.current
    const anterior = document.activeElement
    const raiz = document.documentElement
    const overflow = raiz.style.overflow
    raiz.style.overflow = 'hidden'
    if (!elemento.open) elemento.showModal()
    elemento.querySelector('[role="tab"][aria-selected="true"]')?.focus()
    return () => {
      elemento.close()
      raiz.style.overflow = overflow
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus()
    }
  }, [])

  // Pestañas con flechas, Inicio y Fin (patrón de pestañas de ARIA); el foco sigue a la selección.
  function teclaPestana(e) {
    const i = PESTANAS.indexOf(pestana)
    const siguiente = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: PESTANAS.length - 1 }[e.key]
    if (siguiente === undefined) return
    e.preventDefault()
    const nueva = PESTANAS[(siguiente + PESTANAS.length) % PESTANAS.length]
    onPestana(nueva)
    dialogo.current?.querySelector(`#perfil-pestana-${nueva}`)?.focus()
  }

  const contador = {
    favoritos: favoritos.estado === 'listo' ? favoritos.lugares.length : null,
    resenas: resenas.estado === 'listo' ? resenas.lista.length : null,
    gustos: gustos.elegidos.length || null,
  }

  return (
    <dialog
      ref={dialogo}
      className={`panel-perfil${amplio ? ' amplio' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfil-nombre"
      onCancel={(e) => { e.preventDefault(); onCerrar() }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCerrar() } }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
    >
      <div className="perfil-hoja">
        <header className="perfil-cabeza">
          <span className="avatar grande" aria-hidden="true">{iniciales(nombre, correo)}</span>
          <div className="perfil-identidad">
            <h2 id="perfil-nombre">{visible}</h2>
            {correo && <p className="perfil-correo">{correo}</p>}
          </div>
          <div className="perfil-controles">
            <button type="button" className="boton-icono perfil-ampliar" aria-pressed={amplio} onClick={onAlternarAmplio}
              aria-label={t(amplio ? 'perfil.reducir' : 'perfil.ampliar')} title={t(amplio ? 'perfil.reducir' : 'perfil.ampliar')}>
              <Icono nombre={amplio ? 'reducir' : 'expandir'} />
            </button>
            <button type="button" className="boton-icono" onClick={onCerrar} aria-label={t('perfil.cerrar')} title={t('perfil.cerrar')}>
              <Icono nombre="cerrar" />
            </button>
          </div>
        </header>

        <div className="perfil-pestanas" role="tablist" aria-label={t('perfil.secciones')} onKeyDown={teclaPestana}>
          {PESTANAS.map((p) => (
            <button key={p} type="button" role="tab" id={`perfil-pestana-${p}`} aria-controls={`perfil-panel-${p}`}
              aria-selected={pestana === p} tabIndex={pestana === p ? 0 : -1} onClick={() => onPestana(p)}>
              {t(`perfil.${p}`)}
              {contador[p] != null && <span className="perfil-contador">{contador[p]}</span>}
            </button>
          ))}
        </div>

        <div className="perfil-cuerpo">
          {pestana === 'favoritos' && <Favoritos {...favoritos} enlace={enlace} onAbrirLugar={onAbrirLugar} ocupado={ocupado} amplio={amplio} />}
          {pestana === 'resenas' && <MisResenas {...resenas} enlace={enlace} onAbrirLugar={onAbrirLugar} />}
          {pestana === 'gustos' && <Gustos {...gustos} />}
        </div>

        <footer className="perfil-pie">
          {errorAccion && <p className="perfil-error" role="alert">{t(errorAccion)}</p>}
          <button type="button" className="boton" disabled={ocupado} onClick={onSalir}>{t(saliendo ? 'cuenta.saliendo' : 'cuenta.salir')}</button>
          <button type="button" className="boton-texto peligro" disabled={ocupado} onClick={onBorrar}>{t('cuenta.borrar')}</button>
        </footer>
      </div>
    </dialog>
  )
}

// Clic normal: cierra el panel y abre la ficha. Con Ctrl, Shift o rueda, el navegador hace lo suyo.
function alAbrir(onAbrirLugar) {
  return (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    onAbrirLugar()
  }
}

function Favoritos({ lugares, estado, conEstado, quitando, ocupado, amplio, onReintentar, onQuitar, enlace, onAbrirLugar }) {
  const { t } = useIdioma()
  return (
    <section id="perfil-panel-favoritos" role="tabpanel" aria-labelledby="perfil-pestana-favoritos" tabIndex={-1}
      aria-busy={estado === 'cargando' || quitando !== null}>
      {estado === 'cargando' && <><p className="oculto-accesible" role="status">{t('carga.favoritos')}</p><Esqueleto tipo="lista" anunciar={false} /></>}
      {estado === 'error' && <Reintentar texto={t('cuenta.errorCargar')} onReintentar={onReintentar} />}
      {estado === 'listo' && lugares.length === 0 && (
        <Vacio icono="corazon" titulo={t('perfil.sinFavoritos')} texto={t('perfil.sinFavoritosAyuda')} />
      )}
      {estado === 'listo' && lugares.length > 0 && <>
        {conEstado && <p className="perfil-ayuda">{t('perfil.favoritosAyuda')}</p>}
        <ul className={`perfil-favoritos${amplio ? ' cuadricula' : ''}`}>
          {lugares.map((p) => (
            <li key={p.id} className="perfil-favorito">
              {p.ausente
                ? <p className="perfil-favorito-ausente">{t('cuenta.lugarNoDisponible')}</p>
                : <Link to={enlace(p.id)} className="perfil-favorito-enlace" onClick={alAbrir(onAbrirLugar)}>
                    <Foto id={p.clave} nombre={p.nombre} tamano={amplio ? 'grande' : 'mini'} />
                    <span className="perfil-favorito-texto">
                      <strong>{p.nombre}</strong>
                      <span className="perfil-favorito-destino">{p.destino}</span>
                      {p.color && <Semaforo color={p.color} />}
                    </span>
                  </Link>}
              <button type="button" className="boton-icono favorito" aria-pressed="true" disabled={ocupado}
                aria-label={t('favorito.quitarLugar', { lugar: p.nombre ?? t('cuenta.lugarNoDisponible') })}
                title={t('favorito.quitar')} onClick={() => onQuitar(p.id)}>
                {quitando === p.id ? <span className="oculto-accesible">{t('cuenta.guardando')}</span> : null}
                <Icono nombre="corazon" relleno={quitando !== p.id} />
              </button>
            </li>
          ))}
        </ul>
      </>}
    </section>
  )
}

function MisResenas({ estado, lista, catalogo, recargar, enlace, onAbrirLugar }) {
  const { idioma, t } = useIdioma()
  const fecha = (iso) => new Date(iso).toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
  return (
    <section id="perfil-panel-resenas" role="tabpanel" aria-labelledby="perfil-pestana-resenas" tabIndex={-1} aria-busy={estado === 'cargando'}>
      {estado === 'cargando' && <Esqueleto tipo="resenas" />}
      {estado === 'error' && <Reintentar texto={t('perfil.errorResenas')} onReintentar={recargar} />}
      {estado === 'listo' && lista.length === 0 && (
        <Vacio icono="estrella" titulo={t('perfil.sinResenas')} texto={t('perfil.sinResenasAyuda')} />
      )}
      {estado === 'listo' && lista.length > 0 && (
        <ul className="perfil-resenas">
          {lista.map((r) => {
            const punto = catalogo.find((p) => p.id === r.punto_id)
            return (
              <li key={r.id} className={`perfil-resena${r.estado === 'oculta' ? ' oculta' : ''}`}>
                <div className="perfil-resena-lugar">
                  {punto && <Foto id={punto.clave} nombre={punto.nombre} tamano="mini" />}
                  <div>
                    <h3>{punto?.nombre ?? t('cuenta.lugarNoDisponible')}</h3>
                    <p className="perfil-resena-meta">
                      <span className="estrellas-dibujo" aria-hidden="true">{'★'.repeat(r.estrellas)}<span>{'★'.repeat(5 - r.estrellas)}</span></span>
                      <span className="oculto-accesible">{t('resena.deCinco', { n: r.estrellas })}</span>
                      <span>{fecha(r.creada_en)}{r.editada_en && ` (${t('resena.editada')})`}</span>
                    </p>
                  </div>
                </div>
                {r.estado === 'oculta' && <p className="perfil-resena-aviso"><Icono nombre="info" />{t('perfil.resenaOculta')}</p>}
                {r.texto && <p className="perfil-resena-texto">{r.texto}</p>}
                <div className="perfil-resena-pie">
                  <span>
                    {r.accesible != null && t(r.accesible ? 'resena.esAccesible' : 'resena.noAccesible')}
                    {r.accesible != null && r.utiles > 0 && '. '}
                    {r.utiles > 0 && t(r.utiles === 1 ? 'perfil.utilUna' : 'perfil.utilVarias', { n: r.utiles })}
                  </span>
                  {punto && <Link to={enlace(punto.id)} onClick={alAbrir(onAbrirLugar)}>{t('perfil.verResena')}</Link>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Gustos({ elegidos, estado, onCambiar }) {
  const { t } = useIdioma()
  function alternar(id) {
    onCambiar(elegidos.includes(id) ? elegidos.filter((g) => g !== id) : [...elegidos, id])
  }
  return (
    <section id="perfil-panel-gustos" role="tabpanel" aria-labelledby="perfil-pestana-gustos" tabIndex={-1}>
      <p className="perfil-ayuda">{t('perfil.gustosAyuda')}</p>
      <div className="chips" role="group" aria-label={t('perfil.gustos')}>
        {INTERESES.map((id) => (
          <button key={id} type="button" className="chip" aria-pressed={elegidos.includes(id)} disabled={estado === 'guardando'}
            onClick={() => alternar(id)}>{t(`interes.${id}`)}</button>
        ))}
      </div>
      <p className={`perfil-guardado${estado === 'error' ? ' error' : ''}`} role="status">
        {estado === 'guardado' && t('perfil.gustosGuardados')}
        {estado === 'error' && t('perfil.gustosError')}
      </p>
    </section>
  )
}

function Vacio({ icono, titulo, texto }) {
  return (
    <div className="perfil-vacio">
      <Icono nombre={icono} />
      <p><strong>{titulo}</strong></p>
      <p>{texto}</p>
    </div>
  )
}

function Reintentar({ texto, onReintentar }) {
  const { t } = useIdioma()
  return <div className="perfil-vacio"><p role="alert">{texto}</p><button type="button" className="boton" onClick={onReintentar}>{t('error.reintentar')}</button></div>
}

export default PanelPerfil
