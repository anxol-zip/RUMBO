import BotonFavorito from './BotonFavorito.jsx'
import Resenas from './Resenas.jsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, codigoDe } from '../api/cliente.js'
import { hora, horarioDeHoy, partesRazon, pesos, textoTraslado } from '../data/formato.js'
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
import GenteAhora from './GenteAhora.jsx'
import Icono from './Icono.jsx'

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
function TarjetaPunto({ puntoId, origenId, onVolver, onAlternativa, onEstoyAqui, onCargado, onError }) {
  const { idioma, t } = useIdioma()
  const [estado, setEstado] = useState(null)
  const [fallo, setFallo] = useState(false)
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
      .then((datos) => { if (vigente) setEstado(datos) })
      .catch((e) => { if (vigente) { setFallo(true); onError(codigoDe(e)) } })
    return () => { vigente = false }
  }, [puntoId, origenId, onError])

  useEffect(() => {
    if (estado) onCargado?.(titulo.current)
  }, [estado, onCargado])

  if (fallo) return <button type="button" className="boton-texto" onClick={onVolver}>{t('ficha.volver')}</button>
  if (!estado || estado.id !== puntoId) return <p className="suave">{t('cargando')}</p>

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

  return (
    // Con la barra ampliada: a la izquierda lo principal, las acciones y las fuentes; a la derecha los datos
    // en tarjetas. En la barra angosta van una tras otra (CSS).
    <article className={`detalle-punto${fase === 'saliendo' ? ' saliendo' : fase === 'regresando' ? ' regresando' : ''}`}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && fase === 'regresando') setFase('ficha') }}>
      <div className="ficha-principal">
      <button type="button" className="boton-texto volver" onClick={onVolver}>
        <Icono nombre="atras" />{t('ficha.volver').replace(/^←\s*/, '')}
      </button>
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
      {/* HCI A2: la respuesta a "¿voy o no?" antes de cualquier dato */}
      <div className={`conclusion ${estado.color}`}>
        <p className="conclusion-titular">{concl.titular}</p>
        {concl.siguiente && <p className="conclusion-siguiente">{concl.siguiente}</p>}
      </div>
      {estado.ajuste_manual && <p style={{ marginTop: 10 }}><span className="ajuste-etiqueta">{t('ficha.ajustado', { motivo: estado.ajuste_manual })}</span></p>}
      {(estado.vs_normal === 'mas_lleno' || estado.vs_normal === 'menos_lleno') && (
        <p style={{ marginTop: 10 }}>
          <span className={`vs-normal ${estado.vs_normal}`}>
            {t(`vs.${estado.vs_normal}`)} {estado.ajuste_manual ? t('vs.porSecretaria') : t('vs.porReportes', { n: estado.n_reportes })}
          </span>
        </p>
      )}
      {estado.espera_reportada && (
        <p className="espera"><Icono nombre="reloj" /> {t('espera.texto', {
          min: estado.espera_reportada.minutos, n: estado.espera_reportada.n_reportes, hace: estado.espera_reportada.ultima_hace_min,
        })}</p>
      )}
      <Foto id={estado.clave} nombre={estado.nombre} credito ampliable />
      {descripcion && <p className="descripcion">{descripcion}</p>}
      </div>

      <div className="ficha-datos">
      {/* Por qué tiene ese color y cuánta gente hay */}
      <section className="ficha-tarjeta" aria-labelledby="ficha-por-que">
        <div className="ficha-tarjeta-titulo">
          <Icono nombre="grafica" />
          <div>
            <h3 id="ficha-por-que">{razones[0] ?? t(`sem.${estado.color}`)}</h3>
            {confianza && <p className="ficha-tarjeta-sub">{confianza}</p>}
          </div>
        </div>
        {razones.length > 1 && (
          <ul className="razones">{razones.slice(1).map((r) => <li key={r}>{r}</li>)}</ul>
        )}
        <GenteAhora nivel={estado.nivel} color={estado.color} />
      </section>

      {estado.proximas_horas.length > 0 && (
        <section className="ficha-tarjeta" aria-labelledby="ficha-proximas">
          <div className="ficha-tarjeta-titulo"><Icono nombre="reloj" /><h3 id="ficha-proximas">{t('ficha.proximas')}</h3></div>
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
            <p className="suave" style={{ marginTop: 8 }}>
              {t('hoy.resumen', { tranquila: estado.hoy.mas_tranquila.hora, llena: estado.hoy.mas_llena.hora })}
            </p>
          )}
          <Semana ref={botonSemana} onAbrir={abrirSemana} />
        </section>
      )}

      {estado.clima.length > 0 && (
        <section className="ficha-tarjeta" aria-labelledby="ficha-clima">
          <div className="ficha-tarjeta-titulo"><Icono nombre="sol" /><h3 id="ficha-clima">{t('ficha.clima')}</h3></div>
          <div className="horas">
            {estado.clima.slice(0, 6).map((c) => (
              <div key={c.hora} className={`hora${c.lluvia !== 'sin' ? ' lluvia' : ''}`}>
                {hora(c.hora)}
                <strong><Icono nombre={LLUVIA[c.lluvia]} /> {c.prob_lluvia_pct != null ? `${Math.round(c.prob_lluvia_pct)}%` : '—'}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ficha-tarjeta" aria-labelledby="ficha-visita">
        <div className="ficha-tarjeta-titulo"><Icono nombre="bolsa" /><h3 id="ficha-visita">{t('ficha.visita')}</h3></div>
        <div className="datos-visita">
          <Dato icono={estado.traslado?.modo === 'en coche' ? 'coche' : 'caminar'} titulo={t('ficha.traslado')} valor={traslado ?? t('ficha.sinCalcular')} />
          <Dato icono="reloj" titulo={t('ficha.tiempo')} valor={estado.duracion_sugerida ?? t('ficha.porConfirmar')} />
          <Dato icono="calendario" titulo={t('ficha.horario')} valor={horarioDeHoy(estado.horario, t)} />
          <Dato icono="etiqueta" titulo={t('ficha.entrada')} valor={estado.costo_mxn == null ? t('ficha.porConfirmar') : estado.costo_mxn === 0 ? t('ficha.gratis') : pesos(estado.costo_mxn)} />
        </div>
      </section>

      {estado.proximos_eventos.length > 0 && (
        <section className="ficha-tarjeta" aria-labelledby="ficha-eventos">
          <div className="ficha-tarjeta-titulo"><Icono nombre="calendario" /><h3 id="ficha-eventos">{t('ficha.eventos')}</h3></div>
          <ul className="razones">
            {estado.proximos_eventos.map((e) => (
              <li key={e.nombre + e.inicio}>
                <strong>{e.nombre}</strong>
                <span className="suave" style={{ display: 'block' }}>{t('ficha.eventoFechas', { inicio: e.inicio.slice(0, 10), fin: e.fin.slice(0, 10) })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>

      <div className="ficha-acciones">
        {!conviene && (
          <button type="button" className="boton primario" onClick={onAlternativa}><Icono nombre="cambiar" />{t('ficha.mejorVe')}</button>
        )}
        <button type="button" className={`boton${conviene ? ' primario' : ''}`} onClick={onEstoyAqui}><Icono nombre="pin" />{t('ficha.estoyAqui')}</button>
        <a className="boton" href={estado.como_llegar_url} target="_blank" rel="noreferrer">
          <Icono nombre="navegar" />{t('ficha.comoLlegar')}<span className="oculto-accesible"> {t('ficha.enGoogleMaps')}</span>
        </a>
      </div>

      <div className="ficha-fuentes">
        <Icono nombre="info" />
        <div>
          {estado.fuente && <p className="fuente-dato">{t('ficha.fuente', { fuente: estado.fuente })}</p>}
          <p className="fuente-dato">{actualizacion(estado.datos, t)} {t('datos.metodo')}</p>
        </div>
      </div>

      <div className="ficha-resenas"><Resenas puntoId={estado.id} /></div>
    </article>
  )
}

// Un dato de "Tu visita": ícono, qué es y cuánto
function Dato({ icono, titulo, valor }) {
  return (
    <div className="dato">
      <Icono nombre={icono} />
      <div><span className="suave">{titulo}</span><strong>{valor}</strong></div>
    </div>
  )
}

export default TarjetaPunto
