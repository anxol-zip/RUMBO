import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { api, codigoDe } from '../api/cliente.js'
import { distanciaM, masCercano } from '../data/geo.js'
import { ORDEN } from '../data/semaforo.js'
import { useUbicacion } from '../hooks/useUbicacion.js'
import { useCuenta } from '../cuenta/contexto.js'
import { useIdioma } from '../i18n/contexto.js'
import BotonReporte from '../components/BotonReporte.jsx'
import Chat from '../components/Chat.jsx'
import FiltrosLugares from '../components/FiltrosLugares.jsx'
import GuiaPrimerUso from '../components/GuiaPrimerUso.jsx'
import BordePanel, { ANCHO_MINIMO } from '../components/BordePanel.jsx'
import Inicio from '../components/Inicio.jsx'
import Esqueleto from '../components/Esqueleto.jsx'
import ListaPuntos from '../components/ListaPuntos.jsx'
import Mapa from '../components/Mapa.jsx'
import Recomendacion from '../components/Recomendacion.jsx'
import TarjetaPunto from '../components/TarjetaPunto.jsx'
import TodosLosLugares from '../components/TodosLosLugares.jsx'
import { useHoja } from '../hooks/useHoja.js'
import { ESCALA_TEXTO, usePreferencias } from '../preferencias/contexto.js'

// El semáforo se vuelve a pedir cada minuto: los reportes de otros turistas lo mueven.
const RECARGA_MS = 60_000
const COLORES = ['verde', 'amarillo', 'rojo', 'sin_dato', 'cerrado']
// La ubicación del GPS pasa a ser el punto de partida (el punto del catálogo más cercano, porque los
// traslados salen de la matriz de OpenRouteService entre puntos) solo si es confiable y estás en la zona.
const PRECISION_MAX_M = 1000
const DISTANCIA_MAX_M = 2000
// La distancia al lugar solo acompaña un reporte si el GPS es mejor que la geocerca de 500 m (RN_04).
const PRECISION_REPORTE_M = 500
const AVISO_MS = 6000

function textosMapa(t) {
  const semaforo = Object.fromEntries(COLORES.map((c) => [c, t(`sem.${c}`)]))
  return {
    etiqueta: t('mapa.etiqueta'),
    tu: t('mapa.tu'),
    elegido: t('mapa.elegido'),
    semaforo,
    controles: { ubicar: t('mapa.ubicar'), buscando: t('mapa.buscando'), acercar: t('mapa.acercar'), alejar: t('mapa.alejar') },
    leyenda: { titulo: t('leyenda.titulo'), menos: t('leyenda.menos'), mas: t('leyenda.mas'), semaforo },
  }
}

const km = (m) => (m / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })

// El backend ya manda la lista ordenada por conveniencia (afluencia, clima y traslado).
// Aquí solo se agrupa por color y, dentro de cada color, sube lo que coincide con tus intereses;
// sort es estable, así que se respeta el orden del backend en lo demás.
function ordenar(puntos, intereses) {
  const coincide = (p) => (p.categorias.some((c) => intereses.includes(c)) ? 0 : 1)
  return [...puntos].sort((a, b) => ORDEN[a.color] - ORDEN[b.color] || coincide(a) - coincide(b))
}

// Filtros de la barra (D4): por destino y "solo lo que me gusta" (los intereses del inicio).
const SIN_FILTRO = { destino: null, gustos: false, favoritos: false }
function filtrar(puntos, filtro, intereses, favoritos) {
  return puntos.filter((p) => (filtro.destino === null || p.destino === filtro.destino)
    && (!filtro.gustos || p.categorias.some((c) => intereses.includes(c)))
    && (!filtro.favoritos || (favoritos?.has(p.id) ?? false)))
}

function resumen(puntos, t) {
  const verdes = puntos.filter((p) => p.color === 'verde').length
  if (verdes === 1) return t('resumen.uno')
  if (verdes > 1) return t('resumen.varios', { n: verdes })
  if (puntos.length > 0 && puntos.every((p) => p.color === 'cerrado')) return t('resumen.cerrado')
  return t('resumen.ninguno')
}

// "¿A dónde voy ahora?" — T1 a T6 en una sola página (docs/12).
function Turista({ catalogo, cargandoCatalogo, errorCatalogo, onReintentar, sesion, onSesion, onError }) {
  const [parametros, setParametros] = useSearchParams()
  const ubicacionPagina = useLocation()
  const lugarPedido = parametros.get('lugar')
  const idPedido = lugarPedido && /^\d+$/.test(lugarPedido) ? Number(lugarPedido) : null
  const lugarValido = Number.isSafeInteger(idPedido) && catalogo.some((p) => p.id === idPedido)
  const [puntos, setPuntos] = useState([])
  const [listaCargada, setListaCargada] = useState(false)
  const [errorLista, setErrorLista] = useState(false)
  // La base de desarrollo no tiene clima: traslados aproximados y sin datos en vivo (INSTALACION.md).
  // El semáforo lo dice en `datos`, así que el aviso aparece solo y nunca con los datos reales.
  const [simulados, setSimulados] = useState(false)
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [vista, setVista] = useState('lista')          // 'lista' | 'punto' | 'recomendacion'
  const [reportando, setReportando] = useState(false)
  const [chatAbierto, setChatAbierto] = useState(false)
  const [version, setVersion] = useState(0)            // sube cuando entra un reporte, para recargar
  const [alternativaId, setAlternativaId] = useState(null)   // "Mejor ve a…": se marca en el mapa
  const [ampliada, setAmpliada] = useState(false)      // barra lateral con todos los lugares (D4)
  const [filtro, setFiltro] = useState(SIN_FILTRO)
  // Foco (D6): al abrir una ficha desde la lista va a su título; al volver, a la tarjeta de ese lugar.
  const panel = useRef(null)
  const enfocarFicha = useRef(false)
  const volverA = useRef(null)
  const botonAsistente = useRef(null)
  const chatPrevio = useRef(false)
  const [panelAncho, setPanelAncho] = useState(400)    // para que el mapa encuadre a la derecha del panel
  // Ancho elegido arrastrando el borde del panel (ficha, recomendación o "Ver todos"); null = el normal.
  // Se recuerda en este navegador.
  const [anchoElegido, setAnchoElegido] = useState(() => {
    try { return Number(localStorage.getItem('rumbo.anchoPanel')) || null } catch { return null }
  })
  function guardarAncho(valor) {
    setAnchoElegido(valor)
    try {
      if (valor == null) localStorage.removeItem('rumbo.anchoPanel')
      else localStorage.setItem('rumbo.anchoPanel', String(valor))
    } catch { /* sin almacenamiento: solo dura esta visita */ }
  }
  const cambiarAncho = (px) => guardarAncho(Math.round(Math.min(Math.max(px, ANCHO_MINIMO), window.innerWidth - 160)))
  const { letra, guiaAbierta, cerrarGuia } = usePreferencias()
  const hoja = useHoja(ESCALA_TEXTO[letra])
  const { t } = useIdioma()
  const textos = useMemo(() => textosMapa(t), [t])
  const [aviso, setAviso] = useState(null)             // { id, texto } que se muestra sobre el mapa
  const avisar = (texto) => setAviso({ id: Date.now(), texto })

  // Con una lectura nueva del GPS, el punto de partida de toda la app (semáforo, tarjeta, "Mejor ve a…" y
  // chat) pasa al punto del catálogo más cercano, si la lectura es confiable y estás en la zona piloto.
  // Si el GPS falla, se dice por qué y el mapa no se mueve (no hay posición de respaldo).
  const ubicacion = useUbicacion({
    onError: (motivo) => avisar(t(`ubic.${motivo}`)),
    onPosicion: (gps) => {
      if (!sesion || catalogo.length === 0) return
      const elegido = catalogo.find((p) => p.id === sesion.perfil.origenId)?.nombre ?? t('mapa.lugarElegido')
      if (gps.precision > PRECISION_MAX_M) return avisar(t('ubic.aproximada', { km: km(gps.precision), lugar: elegido }))
      const cerca = masCercano(catalogo, gps.lat, gps.lon)
      if (!cerca || cerca.distancia > DISTANCIA_MAX_M) return avisar(t('ubic.lejos', { km: km(cerca?.distancia ?? 0), lugar: elegido }))
      if (cerca.punto.id !== sesion.perfil.origenId) onSesion({ ...sesion, perfil: { ...sesion.perfil, origenId: cerca.punto.id } })
      avisar(t('ubic.cerca', { m: Math.round(cerca.distancia), lugar: cerca.punto.nombre }))
    },
  })
  const gps = ubicacion.posicion
  // Solo una lectura confiable se dibuja y mueve el mapa; la aproximada se queda en el aviso.
  const gpsConfiable = gps && gps.precision <= PRECISION_MAX_M ? gps : null

  const origenId = sesion?.perfil.origenId

  // Los Favoritos enlazan a la ficha pública, incluso antes de iniciar una visita.
  const abrirEnlace = useEffectEvent(() => {
    enfocarFicha.current = true
    onError(null)
    if (sesion) {
      setSeleccionadoId(idPedido)
      setAlternativaId(null)
      setVista('punto')
      hoja.mostrar()
    }
    // Si ya está abierta esa misma ficha no se vuelve a cargar su título.
    if (!sesion || seleccionadoId === idPedido) {
      const titulo = document.getElementById('ficha-titulo')
      if (titulo) { titulo.focus(); enfocarFicha.current = false }
    }
  })
  const conVisita = Boolean(sesion)
  useEffect(() => {
    if (!lugarValido) return undefined
    // Tras cerrar el menú, sincronizar la URL con la hoja y su foco en el siguiente frame.
    const frame = requestAnimationFrame(() => abrirEnlace())
    return () => cancelAnimationFrame(frame)
  }, [lugarValido, idPedido, ubicacionPagina.key, conVisita])

  function quitarEnlace() {
    if (!parametros.has('lugar')) return
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales)
      siguientes.delete('lugar')
      return siguientes
    }, { replace: true })
  }

  useEffect(() => {
    if (!aviso) return undefined
    const id = setTimeout(() => setAviso(null), AVISO_MS)
    return () => clearTimeout(id)
  }, [aviso])

  useEffect(() => {
    if (!sesion) return undefined
    let vigente = true
    async function cargar() {
      try {
        const datos = await api.obtenerSemaforo(origenId)
        if (vigente) {
          setPuntos(datos.puntos); setListaCargada(true); setErrorLista(false)
          setSimulados(datos.datos.clima_consultado_en === null); onError(null)
        }
      } catch (e) {
        if (vigente) { setErrorLista(true); onError(codigoDe(e)) }
      }
    }
    cargar()
    const id = setInterval(cargar, RECARGA_MS)
    return () => { vigente = false; clearInterval(id) }
  }, [sesion, origenId, version, onError])

  async function empezar(perfil) {
    const nueva = await api.crearSesion(perfil)
    onSesion({ sesionId: nueva.sesion_id, perfil })
  }

  function seleccionar(id) {
    quitarEnlace()
    enfocarFicha.current = true
    onError(null)
    setSeleccionadoId(id)
    setAlternativaId(null)
    setVista('punto')
    hoja.mostrar()
  }

  function volverALista() {
    quitarEnlace()
    volverA.current = seleccionadoId
    setVista('lista')
    setSeleccionadoId(null)
    setAlternativaId(null)
  }

  function alternarAmpliada() {
    if (!ampliada && hoja.movil) hoja.expandir()      // en celular, la hoja sube hasta arriba
    setAmpliada((a) => !a)
  }

  const alCargarFicha = useCallback((titulo) => {
    if (!enfocarFicha.current) return
    enfocarFicha.current = false
    titulo?.focus()
  }, [])

  useEffect(() => {
    if (vista !== 'lista' || volverA.current == null) return
    panel.current?.querySelector(`[data-punto="${volverA.current}"]`)?.focus()
    volverA.current = null
  }, [vista, ampliada])

  // El ancho del panel cambia con la barra ampliada y con el tamaño de letra: se mide, no se supone.
  useEffect(() => {
    const caja = panel.current
    if (!caja) return undefined
    const observador = new ResizeObserver(([e]) => setPanelAncho(Math.round(e.contentRect.width)))
    observador.observe(caja)
    return () => observador.disconnect()
  }, [sesion])

  // Al cerrar el asistente, el foco vuelve al botón que lo abrió.
  useEffect(() => {
    if (chatPrevio.current && !chatAbierto) botonAsistente.current?.focus()
    chatPrevio.current = chatAbierto
  }, [chatAbierto])

  const intereses = sesion?.perfil.intereses ?? []
  const { favoritos } = useCuenta()          // null sin sesión: el filtro "Mis Favoritos" no aparece
  const visibles = filtrar(puntos, filtro, intereses, favoritos)
  const ordenados = ordenar(visibles, intereses)
  const destinos = [...new Set(catalogo.map((p) => p.destino))]
  const filtroActivo = [filtro.destino, filtro.gustos && t('filtros.gustos'), filtro.favoritos && t('filtros.favoritos')].filter(Boolean).join(' · ')
  const seleccionado = puntos.find((p) => p.id === seleccionadoId)
  // "Ver todos" y la ficha de un lugar ocupan media pantalla; la lista, un tercio.
  const mitad = ampliada || vista !== 'lista'
  const origen = catalogo.find((p) => p.id === origenId)
  // Distancia del GPS al lugar que se reporta (solo el número; la ubicación no sale del celular).
  const distanciaReporte = gps && seleccionado && gps.precision <= PRECISION_REPORTE_M
    ? Math.round(distanciaM(gps.lat, gps.lon, seleccionado.lat, seleccionado.lon)) : null

  // Primero la pantalla de inicio, limpia; el mapa aparece hasta que el turista termina.
  const catalogoPendiente = cargandoCatalogo && catalogo.length === 0
  if (parametros.has('lugar') && catalogoPendiente) return <div className="favorito-publico"><Esqueleto tipo="ficha" /></div>
  if (parametros.has('lugar') && (errorCatalogo || !lugarValido)) {
    return <div className="favorito-publico">
      <p role="alert">{t(errorCatalogo ? 'cuenta.errorCargar' : 'cuenta.lugarInvalido')}</p>
      {errorCatalogo && <button type="button" className="boton" onClick={onReintentar}>{t('error.reintentar')}</button>}
      <button type="button" className="boton-texto" onClick={volverALista}>{t('ficha.volver')}</button>
    </div>
  }
  if (!sesion && lugarValido) {
    return <div className="favorito-publico"><TarjetaPunto key={idPedido} puntoId={idPedido}
      onVolver={volverALista} onCargado={alCargarFicha} onError={onError} /></div>
  }
  if (!sesion) {
    if (errorCatalogo) return <div className="cargando"><button type="button" className="boton" onClick={onReintentar}>{t('error.reintentar')}</button></div>
    if (catalogoPendiente) return <Esqueleto tipo="inicio" />
    return catalogo.length > 0 ? <Inicio puntos={catalogo} onListo={empezar} onError={onError} /> : <p className="cargando" role="status">{t('carga.sinLugares')}</p>
  }

  return (
    <>
      {/* El panel va antes que el mapa en el HTML: con teclado se llega primero a la lista y no a
          los 23 marcadores (D6). En pantalla no cambia nada: los dos tienen posición absoluta. */}
      <section
        ref={panel}
        className={`panel-flotante${hoja.arrastrando ? ' arrastrando' : ''}${mitad ? ' mitad' : ''}`}
        style={hoja.movil ? { height: hoja.alto } : mitad && anchoElegido ? { width: anchoElegido } : undefined}
        aria-label={t('lista.region')}
      >
        <div className="zona-arrastre" {...hoja.zona}>
          <button
            type="button"
            className="manija"
            aria-expanded={!hoja.plegada}
            aria-label={hoja.plegada ? t('hoja.mostrar') : t('hoja.ocultar')}
            onClick={hoja.alternar}
          >
            <span aria-hidden="true" />
          </button>
          {vista === 'lista' && (
            <div className="panel-encabezado">
              <div className="encabezado-fila">
                <h2>{t('lista.titulo')}</h2>
                <button type="button" className="boton-ampliar" aria-expanded={ampliada} onClick={alternarAmpliada}>
                  <span aria-hidden="true">{ampliada ? '⤡' : '⤢'}</span> {ampliada ? t('todos.cerrar') : t('todos.ver')}
                </button>
              </div>
              <p className="suave">{t('lista.desde', { lugar: origen?.nombre ?? t('lista.tuUbicacion') })}</p>
              <p className="resumen" aria-live="polite">{listaCargada ? resumen(visibles, t) : null}</p>
              {simulados && <p className="aviso-simulados">{t('datos.simulados')}</p>}
            </div>
          )}
        </div>

        {/* Los filtros completos van en una barra fija de "Ver todos": siguen a la vista al bajar por la
            lista. En la lista angosta solo se avisa si hay uno activo, para no esconder los lugares. */}
        {vista === 'lista' && ampliada && <FiltrosLugares destinos={destinos} filtro={filtro} onFiltro={setFiltro} hayGustos={intereses.length > 0} hayCuenta={favoritos !== null} />}

        {vista === 'lista' && (
          <div className="panel-cuerpo">
            {!listaCargada && !errorLista ? <Esqueleto tipo="lista" /> : !listaCargada && errorLista ?
              <button type="button" className="boton" onClick={() => { setErrorLista(false); setVersion((v) => v + 1) }}>{t('error.reintentar')}</button> : <>
            {!ampliada && filtroActivo && (
              <p className="filtro-activo">
                {t('filtros.activo', { filtro: filtroActivo })}
                <button type="button" className="boton-texto" onClick={() => setFiltro(SIN_FILTRO)}>{t('filtros.quitar')}</button>
              </p>
            )}
            {listaCargada && visibles.length === 0 && (
              <p className="aviso info sin-resultados">
                {t(filtro.favoritos && favoritos?.size === 0 ? 'filtros.sinFavoritos' : 'filtros.vacio')} <button type="button" className="boton-texto" onClick={() => setFiltro(SIN_FILTRO)}>{t('filtros.quitar')}</button>
              </p>
            )}
            {ampliada
              ? <TodosLosLugares puntos={ordenados} seleccionadoId={seleccionadoId} onSeleccionar={seleccionar} />
              : <ListaPuntos puntos={ordenados} seleccionadoId={seleccionadoId} onSeleccionar={seleccionar} />}
            </>}
          </div>
        )}

        {vista === 'punto' && seleccionadoId != null && (
          <div className="panel-cuerpo con-acciones" style={{ paddingTop: 16 }}>
            <TarjetaPunto
              key={seleccionadoId}
              puntoId={seleccionadoId}
              origenId={origenId}
              revision={version}
              onVolver={volverALista}
              onAlternativa={() => setVista('recomendacion')}
              onEstoyAqui={() => setReportando(true)}
              onCargado={alCargarFicha}
              onError={onError}
            />
          </div>
        )}

        {vista === 'recomendacion' && seleccionadoId != null && (
          <div className="panel-cuerpo" style={{ paddingTop: 16 }}>
            <Recomendacion
              puntoId={seleccionadoId}
              sesionId={sesion.sesionId}
              origenId={origenId}
              catalogo={catalogo}
              intereses={sesion.perfil.intereses}
              onVolver={() => { setVista('punto'); setAlternativaId(null) }}
              onElegir={seleccionar}
              onPropuesta={setAlternativaId}
              onError={onError}
            />
          </div>
        )}
        {mitad && !hoja.movil && (
          <BordePanel panel={panel} ancho={panelAncho} onCambiar={cambiarAncho} onReiniciar={() => guardarAncho(null)} />
        )}
      </section>

      <Mapa
        puntos={visibles}
        seleccionadoId={seleccionadoId}
        destacadoId={alternativaId}
        origen={origen}
        gps={gpsConfiable}
        buscando={ubicacion.estado === 'buscando'}
        onUbicar={ubicacion.pedir}
        aviso={aviso}
        margenInferior={hoja.movil ? hoja.alto : 0}
        panelAncho={panelAncho}
        onSeleccionar={seleccionar}
        textos={textos}
      />

      {!chatAbierto && hoja.asistenteVisible && (
        <button
          ref={botonAsistente}
          type="button"
          className={`boton-asistente${hoja.arrastrando ? ' arrastrando' : ''}`}
          style={hoja.movil ? { bottom: hoja.alto + 12 } : undefined}
          onClick={() => setChatAbierto(true)}
          aria-label={t('asistente.boton')}
        >
          <span className="orbe" aria-hidden="true" /> <span className="texto-asistente">{t('asistente.boton')}</span>
        </button>
      )}
      {chatAbierto && <Chat sesionId={sesion.sesionId} origenId={origenId} onCerrar={() => setChatAbierto(false)} />}

      {reportando && seleccionado && (
        <BotonReporte
          punto={seleccionado}
          sesionId={sesion.sesionId}
          distanciaM={distanciaReporte}
          onCerrar={() => setReportando(false)}
          onReportado={() => setVersion((v) => v + 1)}
          onError={onError}
        />
      )}

      {guiaAbierta && <GuiaPrimerUso onCerrar={cerrarGuia} />}
    </>
  )
}

export default Turista
