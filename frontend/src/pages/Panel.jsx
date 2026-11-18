import { useEffect, useRef, useState } from 'react'
import { api, codigoDe } from '../api/cliente.js'
import { useCuenta } from '../cuenta/contexto.js'
import { hora } from '../data/formato.js'
import { atencion } from '../data/tablero.js'
import { useDenuncias } from '../hooks/useDenuncias.js'
import { useIdioma } from '../i18n/contexto.js'
import Atencion from '../components/panel/Atencion.jsx'
import FijarColor from '../components/panel/FijarColor.jsx'
import Indicadores from '../components/panel/Indicadores.jsx'
import LugaresAhora from '../components/panel/LugaresAhora.jsx'
import MapaCalor from '../components/panel/MapaCalor.jsx'
import Redirecciones from '../components/panel/Redirecciones.jsx'
import ResenasDenunciadas from '../components/panel/ResenasDenunciadas.jsx'
import SemaforoEstatal from '../components/panel/SemaforoEstatal.jsx'
import Umbrales from '../components/panel/Umbrales.jsx'
import Esqueleto from '../components/Esqueleto.jsx'
import Icono from '../components/Icono.jsx'

const RECARGA_MS = 30_000
const PESTANAS = ['resumen', 'moderacion', 'ajustes', 'observatorio']

// G1 — Panel de la Secretaría (CU_07). Responde primero "¿qué necesita que yo haga?" (Atención) y luego
// "¿cómo va hoy?". Solo agregados (RN_12). Se traduce como el resto de la app.
function Panel({ onError }) {
  const { t } = useIdioma()
  const { disponible, cargando, sesion, perfil, pedirEntrar } = useCuenta()
  // Solo administradores (feature 002). No se pide ningún dato del panel hasta saber el rol; el
  // backend lo vuelve a comprobar en cada petición (401 o 403).
  if (cargando) return <div className="tablero"><Esqueleto tipo="cuenta" /></div>
  if (!sesion) {
    return (
      <div className="tablero tablero-cerrado">
        <h1>{t('tablero.entrarTitulo')}</h1>
        <p className="secundario">{t('tablero.entrarTexto')}</p>
        {disponible
          ? <button type="button" className="boton primario" onClick={pedirEntrar}>{t('cuenta.entrar')}</button>
          : <p className="aviso info">{t('tablero.sinCuentas')}</p>}
      </div>
    )
  }
  if (perfil?.rol !== 'administrador') {
    return (
      <div className="tablero tablero-cerrado">
        <h1>{t('tablero.soloAdminTitulo')}</h1>
        <p className="secundario">{t('tablero.soloAdminTexto')}</p>
      </div>
    )
  }
  return <ContenidoPanel onError={onError} />
}

function ContenidoPanel({ onError }) {
  const { t } = useIdioma()
  const [datos, setDatos] = useState(null)
  const [fallo, setFallo] = useState(false)
  // RN_11: las sesiones del stand de la Expo (API con PUEBLA_DEMO=1) se marcan como prueba. Separar las
  // bases de desarrollo y de datos reales no lo cubre: el stand y los turistas reales usan la misma.
  const [actividad, setActividad] = useState('todas')
  const [version, setVersion] = useState(0)
  const [pestana, setPestana] = useState('resumen')
  const [puntoAjuste, setPuntoAjuste] = useState(null)
  const pestanas = useRef(null)
  const denuncias = useDenuncias()

  useEffect(() => {
    let vigente = true
    async function cargar() {
      try {
        const d = await api.obtenerPanel({ incluirDemo: actividad === 'todas' })
        if (vigente) { setDatos(d); setFallo(false); onError(null) }
      } catch (e) {
        if (vigente) { setFallo(true); onError(codigoDe(e)) }
      }
    }
    cargar()
    const id = setInterval(cargar, RECARGA_MS)
    return () => { vigente = false; clearInterval(id) }
  }, [actividad, version, onError])

  async function fijar(ajuste) {
    await api.fijarColor(ajuste)
    setVersion((v) => v + 1)
  }

  async function quitar(id) {
    try {
      await api.quitarAjuste(id)
      setVersion((v) => v + 1)
    } catch (e) {
      onError(codigoDe(e))
    }
  }

  // Desde un aviso o desde la lista de lugares: cambia de pestaña y, si aplica, deja el lugar elegido.
  // ancla: un elemento dentro de la pestaña (p. ej. la lista de lugares) al que se lleva la vista y el foco.
  function ir(destino, puntoId = null, ancla = null) {
    if (puntoId != null) setPuntoAjuste(puntoId)
    setPestana(destino)
    const suave = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    requestAnimationFrame(() => {
      const objetivo = ancla ? document.getElementById(ancla) : null
      if (objetivo) { objetivo.scrollIntoView({ block: 'start', behavior: suave }); objetivo.focus({ preventScroll: true }); return }
      pestanas.current?.querySelector(`#tablero-pestana-${destino}`)?.focus()
      pestanas.current?.scrollIntoView({ block: 'start', behavior: suave })
    })
  }

  // Pestañas con flechas, Inicio y Fin (patrón de pestañas de ARIA).
  function teclaPestana(e) {
    const i = PESTANAS.indexOf(pestana)
    const siguiente = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: PESTANAS.length - 1 }[e.key]
    if (siguiente === undefined) return
    e.preventDefault()
    const nueva = PESTANAS[(siguiente + PESTANAS.length) % PESTANAS.length]
    setPestana(nueva)
    pestanas.current?.querySelector(`#tablero-pestana-${nueva}`)?.focus()
  }

  if (!datos) {
    return (
      <div className="tablero">
        {!fallo ? <Esqueleto tipo="panel" />
          : <button type="button" className="boton" onClick={() => { setFallo(false); setVersion((v) => v + 1) }}>{t('error.reintentar')}</button>}
      </div>
    )
  }

  const { afluencia, redirecciones, derrama, estatal, umbrales, ajustes } = datos
  const avisos = atencion({ grupos: denuncias.grupos, puntos: afluencia.puntos, ajustes })
  const cuenta = {
    moderacion: denuncias.grupos.filter((g) => g.resena.estado === 'visible').length || null,
    ajustes: ajustes.length || null,
  }

  return (
    <div className="tablero">
      <header className="tablero-cabeza">
        <div>
          <p className="tablero-zona">{t('tablero.zona')}</p>
          <h1>{t('tablero.titulo')}</h1>
          <p className="tablero-actualizado"><span className="punto-vivo" aria-hidden="true" />{t('tablero.actualizado', { hora: hora(afluencia.datos.ahora) })}</p>
        </div>
        <div className="tablero-actividad" role="group" aria-labelledby="tablero-actividad-titulo" aria-describedby="tablero-actividad-ayuda">
          <p id="tablero-actividad-titulo" className="tablero-actividad-titulo">{t('tablero.actividad')}</p>
          <div className="segmentado">
            {['todas', 'reales'].map((a) => (
              <button key={a} type="button" aria-pressed={actividad === a} onClick={() => setActividad(a)}>{t(`tablero.actividad.${a}`)}</button>
            ))}
          </div>
          <p id="tablero-actividad-ayuda" className="tablero-ayuda">{t('tablero.actividadAyuda')}</p>
        </div>
      </header>

      <div ref={pestanas} className="tablero-pestanas" role="tablist" aria-label={t('tablero.secciones')} onKeyDown={teclaPestana}>
        {PESTANAS.map((p) => (
          <button key={p} type="button" role="tab" id={`tablero-pestana-${p}`} aria-controls={`tablero-seccion-${p}`}
            aria-selected={pestana === p} tabIndex={pestana === p ? 0 : -1} onClick={() => setPestana(p)}>
            <Icono nombre={{ resumen: 'grafica', moderacion: 'estrella', ajustes: 'semaforo', observatorio: 'calendario' }[p]} />
            {t(`tablero.pestana.${p}`)}
            {cuenta[p] != null && <span className="perfil-contador">{cuenta[p]}</span>}
          </button>
        ))}
      </div>

      <section id={`tablero-seccion-${pestana}`} role="tabpanel" aria-labelledby={`tablero-pestana-${pestana}`} className="tablero-seccion">
        {pestana === 'resumen' && <>
          <Atencion avisos={avisos} cargandoDenuncias={denuncias.estado === 'cargando'} onIr={ir} />
          <Indicadores hoy={afluencia.hoy} derrama={derrama} puntos={afluencia.puntos} />
          <div className="tablero-rejilla">
            <article className="tablero-caja t-mapa">
              <h2>{t('tablero.mapaTitulo')}</h2>
              <p className="tablero-sub">{t('tablero.mapaSub')}</p>
              <MapaCalor puntos={afluencia.puntos} />
            </article>
            <article id="tablero-lugares" tabIndex={-1} className="tablero-caja t-lugares">
              <h2>{t('tablero.lugaresTitulo')}</h2>
              <p className="tablero-sub">{t('tablero.lugaresSub')}</p>
              <LugaresAhora puntos={afluencia.puntos} onFijar={(id) => ir('ajustes', id)} />
            </article>
            <article className="tablero-caja t-ancho">
              <h2>{t('tablero.redirTitulo')}</h2>
              <p className="tablero-sub">{t('tablero.redirSub')}</p>
              <Redirecciones datos={redirecciones} derrama={derrama} />
            </article>
          </div>
        </>}

        {pestana === 'moderacion' && (
          <article className="tablero-caja">
            <h2>{t('tablero.moderacionTitulo')}</h2>
            <p className="tablero-sub">{t('tablero.moderacionSub')}</p>
            <ResenasDenunciadas {...denuncias} puntos={afluencia.puntos} />
          </article>
        )}

        {pestana === 'ajustes' && (
          <article className="tablero-caja">
            <h2>{t('tablero.ajustesTitulo')}</h2>
            <p className="tablero-sub">{t('tablero.ajustesSub')}</p>
            <FijarColor key={puntoAjuste ?? 'ninguno'} puntos={afluencia.puntos} puntoInicial={puntoAjuste} ajustes={ajustes}
              onFijar={fijar} onQuitar={quitar} onError={onError} />
          </article>
        )}

        {pestana === 'observatorio' && (
          <article className="tablero-caja">
            <SemaforoEstatal estatal={estatal} />
            <Umbrales filas={umbrales} />
          </article>
        )}
      </section>
    </div>
  )
}

export default Panel
