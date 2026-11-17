import { useEffect, useRef, useState } from 'react'
import { api, codigoDe } from '../api/cliente.js'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'
import Esqueleto from './Esqueleto.jsx'

// "¿Cuándo me conviene ir?" a pantalla completa del panel: reemplaza la ficha mientras está abierta.
// Tabla día × hora de los próximos días (GET /api/puntos/{id}/semana): es la estimación sin reportes,
// como el pronóstico de Kioto (docs: nota 15 de la bóveda). Esc o la ✕ regresan a la ficha.

const COLORES = ['verde', 'amarillo', 'rojo', 'cerrado']

function fechaLocal(d) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

function VistaSemana({ puntoId, nombre, onCerrar, onError }) {
  const { idioma, t } = useIdioma()
  const [semana, setSemana] = useState(null)
  const [elegida, setElegida] = useState(null)       // { fecha, hora } de la celda tocada
  const titulo = useRef(null)
  const [ahora] = useState(() => new Date())         // la hora de referencia: cuando se abrió la vista

  useEffect(() => {
    let vigente = true
    api.obtenerSemana(puntoId)
      .then((s) => { if (vigente) setSemana(s) })
      .catch((e) => { if (vigente) { onError(codigoDe(e)); onCerrar() } })
    return () => { vigente = false }
  }, [puntoId, onError, onCerrar])

  // Esc cierra la vista aunque el foco no esté dentro (por ejemplo, después de tocar un cuadro)
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  // El foco entra al título para que el lector de pantalla anuncie la vista nueva
  useEffect(() => { titulo.current?.focus({ preventScroll: true }); titulo.current?.scrollIntoView({ block: 'start' }) }, [])

  const hoy = fechaLocal(ahora)
  const manana = fechaLocal(new Date(ahora.getTime() + 864e5))
  const locale = idioma === 'en' ? 'en-US' : 'es-MX'
  const dia = (fecha) => fecha === hoy ? t('semana.hoy')
    : new Date(`${fecha}T12:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })
  const cuando = (fecha, hora) => fecha === hoy ? t('semana.hoyALas', { hora }) : fecha === manana ? t('semana.mananaALas', { hora })
    : t('semana.diaALas', { dia: new Date(`${fecha}T12:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric' }), hora })

  const dias = semana?.dias ?? []
  const horas = [...new Set(dias.flatMap((d) => d.horas.map((h) => h.hora)))].sort()
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:00`
  // El próximo buen momento: la primera hora en verde que todavía no pasa
  const mejor = dias.flatMap((d) => d.horas.filter((h) => h.color === 'verde' && !h.pasada).map((h) => ({ fecha: d.fecha, hora: h.hora })))[0]
  const celdaElegida = elegida && dias.find((d) => d.fecha === elegida.fecha)?.horas.find((h) => h.hora === elegida.hora)

  return (
    <section className="vista-semana" aria-labelledby="semana-titulo">
      <div className="vista-semana-cabecera">
        <button type="button" className="boton-texto volver" onClick={onCerrar}>
          <Icono nombre="atras" />{t('semana.volver', { lugar: nombre })}
        </button>
        <button type="button" className="boton-icono" onClick={onCerrar} aria-label={t('semana.cerrar')} title={t('semana.cerrar')}>
          <Icono nombre="cerrar" />
        </button>
      </div>
      <h2 id="semana-titulo" ref={titulo} tabIndex={-1}>{t('semana.titulo')}</h2>
      <p className="suave">{nombre}{dias.length > 0 ? ` · ${t('semana.proximosDias', { n: dias.length })}` : ''}</p>

      {!semana && <Esqueleto tipo="semana" />}

      {semana && horas.length === 0 && <p className="suave" style={{ marginTop: 16 }}>{t('semana.sinDatos')}</p>}

      {semana && horas.length > 0 && (
        <>
          {mejor && (
            <div className="semana-mejor">
              <Icono nombre="calendario" />
              <div>
                <span>{t('semana.proximoBueno')}</span>
                <strong>{cuando(mejor.fecha, mejor.hora)}</strong>
              </div>
            </div>
          )}

          <div className="semana-cuadro">
            <div className="semana-tabla" role="table" aria-label={t('semana.titulo')} style={{ '--columnas': horas.length }}>
              <div className="semana-fila encabezado" role="row">
                <span role="columnheader"><span className="oculto-accesible">{t('semana.dia')}</span></span>
                {horas.map((h) => (
                  <span key={h} role="columnheader" className={`semana-hora${Number(h.slice(0, 2)) % 2 ? ' impar' : ''}${h === horaActual ? ' ahora' : ''}`}>
                    {Number(h.slice(0, 2))}
                  </span>
                ))}
              </div>
              {dias.map((d) => {
                const porHora = Object.fromEntries(d.horas.map((h) => [h.hora, h]))
                return (
                  <div key={d.fecha} className={`semana-fila${d.fecha === hoy ? ' hoy' : ''}`} role="row">
                    <span role="rowheader" className="semana-dia">{dia(d.fecha)}</span>
                    {horas.map((h) => {
                      const celda = porHora[h]
                      const color = celda?.color ?? 'cerrado'
                      const texto = t(`sem.${color}`)
                      const marcada = elegida?.fecha === d.fecha && elegida?.hora === h
                      return (
                        <span key={h} role="cell"
                          className={`semana-celda ${color}${celda?.pasada ? ' pasada' : ''}${marcada ? ' elegida' : ''}${d.fecha === hoy && h === horaActual ? ' ahora' : ''}`}
                          title={`${dia(d.fecha)} ${h}: ${texto}`}
                          onClick={() => setElegida({ fecha: d.fecha, hora: h })}>
                          <span className="oculto-accesible">{h} {texto}</span>
                        </span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          <p className="semana-detalle" aria-live="polite">
            {elegida
              ? <><span className={`semana-punto ${celdaElegida?.color ?? 'cerrado'}`} aria-hidden="true" />{cuando(elegida.fecha, elegida.hora)}: <strong>{t(`sem.${celdaElegida?.color ?? 'cerrado'}`)}</strong></>
              : t('semana.toca')}
          </p>

          <ul className="semana-leyenda" aria-label={t('semana.leyenda')}>
            {COLORES.map((c) => <li key={c}><span className={`semana-punto ${c}`} aria-hidden="true" />{t(`sem.${c}`)}</li>)}
          </ul>

          <h3 className="semana-subtitulo">{t('semana.porDia')}</h3>
          <ul className="semana-dias">
            {dias.filter((d) => d.resumen).map((d) => (
              <li key={d.fecha} className={d.fecha === hoy ? 'hoy' : undefined}>
                <span className="semana-dias-nombre">{dia(d.fecha)}</span>
                <span><span className="semana-punto verde" aria-hidden="true" />{t('semana.tranquila', { hora: d.resumen.mas_tranquila.hora })}</span>
                <span><span className="semana-punto rojo" aria-hidden="true" />{t('semana.llena', { hora: d.resumen.mas_llena.hora })}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="ficha-fuentes">
        <Icono nombre="info" />
        <p className="fuente-dato">{t('semana.nota')}</p>
      </div>
    </section>
  )
}

export default VistaSemana
