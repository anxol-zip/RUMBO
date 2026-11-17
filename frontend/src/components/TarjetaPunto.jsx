import BotonFavorito from './BotonFavorito.jsx'
import Resenas from './Resenas.jsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, codigoDe } from '../api/cliente.js'
import { hora, horarioDeHoy, partesRazon, textoTraslado } from '../data/formato.js'
import { hechosVisita } from '../data/hechos.js'
import BotonEscuchar from './BotonEscuchar.jsx'
import IconoEstado from './IconoEstado.jsx'
import { textosConclusion } from '../data/conclusion.js'
import { ficha } from '../i18n/backend.js'
import { useIdioma } from '../i18n/contexto.js'
import Foto from './Foto.jsx'
import Semaforo from './Semaforo.jsx'
import Semana from './Semana.jsx'
import VistaSemana from './VistaSemana.jsx'
import BotonCompartir from './BotonCompartir.jsx'
import Icono from './Icono.jsx'
import Esqueleto from './Esqueleto.jsx'

// Ícono del clima por hora según la lluvia
const LLUVIA = { sin: 'sol', moderada: 'llovizna', fuerte: 'lluvia' }

function confianzaTexto(e, t) {
  if (e.color === 'cerrado') return null
  if (e.color === 'sin_dato') return t('conf.sinDato')
  if (e.confianza === 'confirmado por turistas') return t('conf.confirmado', { n: e.n_reportes })
  const base = e.n_reportes ? t('conf.estimadoReportes', { n: e.n_reportes }) : t('conf.estimado')
  const normal = e.normalmente && e.normalmente !== e.color ? ` ${t('conf.normalmente', { color: t(`sem.${e.normalmente}`).toLowerCase() })}` : ''
  return base + normal
}

// "Clima de hace 12 min · tráfico de hace 5 min" (RNF_02); lo que no hay se omite.
function actualizacion(datos, t) {
  const partes = []
  if (datos?.clima_hace_min != null) partes.push(t('datos.clima', { min: datos.clima_hace_min }))
  if (datos?.trafico_hace_min != null) partes.push(t('datos.trafico', { min: datos.trafico_hace_min }))
  return partes.length ? `${t('datos.actualizado')} ${partes.join(' · ')}.` : ''
}

// T3 — Tarjeta del punto (CU_03): qué es, si conviene ir, por qué y cuándo conviene más.
// onCargado(título): Turista mueve ahí el foco cuando la ficha se abrió desde la lista (D6).
// revision: sube cuando entra un reporte. La ficha se vuelve a pedir sin desmontarse: lo que ya se veía
// se queda (con su scroll) hasta que llega lo nuevo, en lugar de regresar al esqueleto.
function TarjetaPunto({ puntoId, origenId, revision = 0, onVolver, onAlternativa, onEstoyAqui, onCargado, onError }) {
  const { idioma, t } = useIdioma()
  const clave = `${puntoId}|${origenId}`
  const [respuesta, setRespuesta] = useState(null)
  const estado = respuesta?.clave === clave ? respuesta.estado : null
  const fallo = respuesta?.clave === clave && respuesta.error
  const titulo = useRef(null)
  // "¿Cuándo me conviene ir?": la ficha sale y entra la semana en su lugar; al cerrarla, la ficha regresa.
  // fase: 'ficha' | 'saliendo' | 'semana' | 'regresando'
  const [fase, setFase] = useState('ficha')
  const botonSemana = useRef(null)
  const espera = useRef(null)
  useEffect(() => () => clearTimeout(espera.current), [])

  function abrirSemana() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setFase('semana'); return }
    setFase('saliendo')
    espera.current = setTimeout(() => setFase('semana'), 180)
  }
  const cerrarSemana = useCallback(() => setFase('regresando'), [])

  // Al regresar, el foco vuelve al botón que abrió la semana
  useEffect(() => {
    if (fase === 'regresando') botonSemana.current?.focus()
  }, [fase])

  useEffect(() => {
    let vigente = true
    api.obtenerEstadoPunto(puntoId, origenId)
      .then((datos) => { if (vigente) setRespuesta({ clave, estado: datos, error: false }) })
      .catch((e) => { if (vigente) { setRespuesta({ clave, estado: null, error: true }); onError(codigoDe(e)) } })
    return () => { vigente = false }
  }, [puntoId, origenId, onError, clave, revision])

  useEffect(() => {
    if (estado) onCargado?.(titulo.current)
  }, [estado, onCargado])

  if (fallo) return <button type="button" className="boton-texto" onClick={onVolver}>{t('ficha.volver')}</button>
  if (!estado || estado.id !== puntoId) return <Esqueleto tipo="ficha" />

  const conviene = estado.color === 'verde'
  const traslado = textoTraslado(estado.traslado, t)
  const descripcion = estado.ficha && ficha(estado.clave, estado.ficha, idioma)
  const confianza = confianzaTexto(estado, t)
  const concl = textosConclusion(estado, t)
  const razones = [...partesRazon(estado.razon, idioma), ...estado.eventos.map((e) => t('ficha.hoy', { evento: e }))]
  // Lo que lee "Escuchar": lo mismo que se ve primero, en el orden en que se ve.
  const lectura = [
    estado.nombre, t(`sem.${estado.color}`), concl.titular, concl.siguiente, ...partesRazon(estado.razon, idioma), descripcion,
    `${t('ficha.horario')}: ${horarioDeHoy(estado.horario, t)}`, traslado && `${t('ficha.traslado')}: ${traslado}`,
  ]

  if (fase === 'semana') {
    return <VistaSemana puntoId={estado.id} nombre={estado.nombre} onCerrar={cerrarSemana} onError={onError} />
  }

  // Las horas solo se muestran si en alguna se puede ir: un lugar cerrado lo dice la conclusión
  // ("Abre mañana a las 10:00") y ocho cuadros de "cerrado" no agregan nada.
  const horasUtiles = estado.proximas_horas.some((h) => h.color !== 'cerrado')
  const hechos = hechosVisita(estado, t)
  const ajustes = [
    estado.ajuste_manual && t('ficha.ajustado', { motivo: estado.ajuste_manual }),
    (estado.vs_normal === 'mas_lleno' || estado.vs_normal === 'menos_lleno')
      && `${t(`vs.${estado.vs_normal}`)} ${estado.ajuste_manual ? t('vs.porSecretaria') : t('vs.porReportes', { n: estado.n_reportes })}`,
  ].filter(Boolean)

  return (
    // Una respuesta, tres datos y una acción a la vista (HCI A2 y A3): la conclusión, las próximas horas,
    // los datos de la visita y la barra de acciones. Lo demás se abre solo si se pide.
    <article className={`detalle-punto${fase === 'saliendo' ? ' saliendo' : fase === 'regresando' ? ' regresando' : ''}`}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && fase === 'regresando') setFase('ficha') }}>
      <button type="button" className="boton-texto volver" onClick={onVolver}>
        <Icono nombre="atras" />{t('ficha.volver').replace(/^←\s*/, '')}
      </button>
      <div className="ficha-portada"><Foto id={estado.clave} nombre={estado.nombre} credito ampliable /></div>
      <p className="ficha-destino"><Icono nombre="pin" />{estado.destino}{estado.es_inah ? t('ficha.inah') : ''}</p>
      <div className="ficha-titulo">
        <h2 id="ficha-titulo" ref={titulo} tabIndex={-1}>{estado.nombre}</h2>
        <div className="ficha-titulo-botones">
          <BotonCompartir estado={estado} />
          <BotonFavorito puntoId={estado.id} nombre={estado.nombre} compacto />
        </div>
      </div>
      <div className="estado-fila">
        <Semaforo color={estado.color} grande />
        <BotonEscuchar partes={lectura} />
      </div>
      <div className={`conclusion ${estado.color}`}>
        <p className="conclusion-titular">{concl.titular}</p>
        {concl.siguiente && <p className="conclusion-siguiente">{concl.siguiente}</p>}
      </div>
      {estado.espera_reportada && (
        <p className="espera"><Icono nombre="reloj" /> {t('espera.texto', {
          min: estado.espera_reportada.minutos, n: estado.espera_reportada.n_reportes, hace: estado.espera_reportada.ultima_hace_min,
        })}</p>
      )}

      {horasUtiles && (
        <section className="ficha-horas" aria-labelledby="ficha-proximas">
          <h3 id="ficha-proximas" className="ficha-subtitulo">{t('ficha.proximas')}</h3>
          <div className="pronostico" role="list">
            {estado.proximas_horas.slice(0, 8).map((h) => (
              <div key={h.hora} className={`franja-hora ${h.color}`} role="listitem" title={`${hora(h.hora)}: ${t(`sem.${h.color}`)}`}>
                <span className="numero">{hora(h.hora)}</span>
                <IconoEstado color={h.color} />
                <span className="oculto-accesible">{t(`sem.${h.color}`)}</span>
              </div>
            ))}
          </div>
          {estado.hoy && (
            <p className="ficha-nota">
              {estado.hoy.ultima_hora
                ? t(estado.hoy.cierra_pronto ? 'hoy.casiCierra' : 'hoy.ultimaHora', { hora: estado.hoy.ultima_hora })
                : estado.hoy.parejo
                  ? t('hoy.parejo')
                  : t('hoy.resumen', { tranquila: estado.hoy.mas_tranquila.hora, llena: estado.hoy.mas_llena.hora })}
            </p>
          )}
        </section>
      )}

      {hechos.length > 0 && (
        <ul className="ficha-hechos" aria-label={t('ficha.visita')}>
          {hechos.map((h) => <li key={h.clave}><Icono nombre={h.icono} />{h.texto}</li>)}
        </ul>
      )}
      {descripcion && <p className="descripcion">{descripcion}</p>}

      <div className="ficha-acciones">
        {!conviene && onAlternativa && (
          <button type="button" className="boton primario" onClick={onAlternativa}><Icono nombre="cambiar" />{t('ficha.mejorVe')}</button>
        )}
        {onEstoyAqui && <button type="button" className={`boton${conviene ? ' primario' : ''}`} onClick={onEstoyAqui}><Icono nombre="pin" />{t('ficha.estoyAqui')}</button>}
        <a className="boton" href={estado.como_llegar_url} target="_blank" rel="noreferrer">
          <Icono nombre="navegar" />{t('ficha.comoLlegar')}<span className="oculto-accesible"> {t('ficha.enGoogleMaps')}</span>
        </a>
      </div>

      {/* Lo que no decide la visita va plegado (divulgación progresiva): se abre con un clic o con Enter. */}
      <div className="ficha-mas">
        {estado.proximas_horas.length > 0 && <Semana ref={botonSemana} onAbrir={abrirSemana} />}
        <Plegable icono="grafica" titulo={t('ficha.porQue')}>
          <ul className="razones">{razones.map((r) => <li key={r}>{r}</li>)}</ul>
          {confianza && <p className="ficha-nota">{confianza}</p>}
          {ajustes.map((a) => <p key={a} className="ficha-nota fuerte">{a}</p>)}
        </Plegable>
        {estado.clima.length > 0 && (
          <Plegable icono="sol" titulo={t('ficha.clima')}>
            <div className="horas">
              {estado.clima.slice(0, 6).map((c) => (
                <div key={c.hora} className={`hora${c.lluvia !== 'sin' ? ' lluvia' : ''}`}>
                  {hora(c.hora)}
                  <strong><Icono nombre={LLUVIA[c.lluvia]} /> {c.prob_lluvia_pct != null ? `${Math.round(c.prob_lluvia_pct)}%` : '—'}</strong>
                </div>
              ))}
            </div>
          </Plegable>
        )}
        {estado.proximos_eventos.length > 0 && (
          <Plegable icono="calendario" titulo={t('ficha.eventos')} cuenta={estado.proximos_eventos.length}>
            <ul className="razones">
              {estado.proximos_eventos.map((e) => (
                <li key={e.nombre + e.inicio}>
                  <strong>{e.nombre}</strong>
                  <span className="ficha-nota" style={{ display: 'block' }}>{t('ficha.eventoFechas', { inicio: e.inicio.slice(0, 10), fin: e.fin.slice(0, 10) })}</span>
                </li>
              ))}
            </ul>
          </Plegable>
        )}
        <Plegable icono="info" titulo={t('ficha.fuentesTitulo')}>
          {estado.fuente && <p className="fuente-dato">{t('ficha.fuente', { fuente: estado.fuente })}</p>}
          <p className="fuente-dato">{actualizacion(estado.datos, t)} {t('datos.metodo')}</p>
        </Plegable>
      </div>

      <div className="ficha-resenas"><Resenas puntoId={estado.id} /></div>
    </article>
  )
}

// Sección plegada de la ficha: <details> nativo, accesible con teclado y lector sin JavaScript.
function Plegable({ icono, titulo, cuenta, children }) {
  return (
    <details className="plegable">
      <summary>
        <Icono nombre={icono} />
        <span className="plegable-titulo">{titulo}{cuenta != null && <span className="perfil-contador">{cuenta}</span>}</span>
        <Icono nombre="derecha" className="plegable-flecha" />
      </summary>
      <div className="plegable-cuerpo">{children}</div>
    </details>
  )
}

export default TarjetaPunto
