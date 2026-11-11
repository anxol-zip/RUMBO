import { useEffect, useRef, useState } from 'react'
import { claveDeError, supabase } from '../api/supabase.js'
import { useCuenta } from '../cuenta/contexto.js'
import { useDialogo } from '../hooks/useDialogo.js'
import { useIdioma } from '../i18n/contexto.js'
import FormResena from './FormResena.jsx'

const PAGINA = 10
const CAMPOS = 'id, usuario_id, autor, estrellas, accesible, texto, estado, utiles, creada_en, editada_en'
const ORDEN = { utiles: 'utiles', recientes: 'creada_en' }

// Una página de reseñas visibles. Pide una de más para saber si hay "Ver más".
function pedirPagina(puntoId, orden, desde) {
  return supabase.from('resena').select(CAMPOS).eq('punto_id', puntoId).eq('estado', 'visible')
    .order(ORDEN[orden], { ascending: false }).order('id', { ascending: false }).range(desde, desde + PAGINA)
}
async function pedirVotos(uid, resenas) {
  if (!uid || resenas.length === 0) return []
  const { data } = await supabase.from('resena_util').select('resena_id').eq('usuario_id', uid).in('resena_id', resenas.map((r) => r.id))
  return (data ?? []).map((v) => v.resena_id)
}

// Estrellas que no dependen de ver el dibujo: siempre llevan su número ("4 de 5").
function Estrellas({ n }) {
  const { t } = useIdioma()
  return <span className="estrellas"><span aria-hidden="true">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span> {t('resena.deCinco', { n })}</span>
}

// Reseñas de un lugar (feature 002, US6 y US7): resumen y lista para cualquiera; con sesión, mi
// reseña, "Útil" y "Denunciar". Los comentarios se pintan como texto plano (FR-025).
function Resenas({ puntoId }) {
  const { idioma, t } = useIdioma()
  const { disponible, usuario, pedirEntrar, avisar } = useCuenta()
  const uid = usuario?.id ?? null
  const [orden, setOrden] = useState('utiles')
  const [version, setVersion] = useState(0)
  const [datos, setDatos] = useState(null)      // { clave, resumen, lista, hayMas, mia, votos }
  const [editando, setEditando] = useState(false)
  const [denunciada, setDenunciada] = useState(null)
  const clave = `${puntoId}|${orden}|${uid}|${version}`

  useEffect(() => {
    if (!disponible) return undefined
    let vigente = true
    async function cargar() {
      const [resumen, pagina, mia] = await Promise.all([
        supabase.rpc('resumen_resenas', { p_punto: puntoId }),
        pedirPagina(puntoId, orden, 0),
        uid ? supabase.from('resena').select(CAMPOS).eq('punto_id', puntoId).eq('usuario_id', uid).maybeSingle() : { data: null },
      ])
      const lista = (pagina.data ?? []).slice(0, PAGINA)
      const votos = await pedirVotos(uid, lista)
      if (vigente) {
        setDatos({ clave, resumen: resumen.data?.[0] ?? null, lista, hayMas: (pagina.data ?? []).length > PAGINA, mia: mia.data, votos: new Set(votos) })
      }
    }
    cargar()
    return () => { vigente = false }
  }, [disponible, puntoId, orden, uid, version, clave])

  if (!disponible) return null
  const recargar = () => { setEditando(false); setVersion((v) => v + 1) }
  const fecha = (iso) => new Date(iso).toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
  const { resumen, lista = [], hayMas = false, mia = null, votos = new Set() } = datos ?? {}

  async function verMas() {
    const { data } = await pedirPagina(puntoId, orden, lista.length)
    const nuevas = (data ?? []).slice(0, PAGINA)
    const suyos = await pedirVotos(uid, nuevas)
    setDatos((d) => (d?.clave === clave
      ? { ...d, lista: [...d.lista, ...nuevas], hayMas: (data ?? []).length > PAGINA, votos: new Set([...d.votos, ...suyos]) }
      : d))
  }

  async function alternarUtil(r) {
    const votada = votos.has(r.id)
    const { error } = votada
      ? await supabase.from('resena_util').delete().eq('resena_id', r.id).eq('usuario_id', uid)
      : await supabase.from('resena_util').insert({ resena_id: r.id })
    if (error && error.code !== '23505') { avisar(claveDeError(error)); return }
    setDatos((d) => {
      if (d?.clave !== clave) return d
      const nuevos = new Set(d.votos)
      if (votada) nuevos.delete(r.id); else nuevos.add(r.id)
      return { ...d, votos: nuevos, lista: d.lista.map((x) => (x.id === r.id ? { ...x, utiles: Math.max(0, x.utiles + (votada ? -1 : 1)) } : x)) }
    })
  }

  return (
    <section className="resenas" aria-labelledby="titulo-resenas">
      <h3 id="titulo-resenas">{t('resena.titulo')}</h3>

      {!datos && <p className="suave">{t('cargando')}</p>}
      {datos && (!resumen || resumen.total === 0) && <p className="secundario">{t('resena.sinResenas')}</p>}
      {resumen && resumen.total > 0 && (
        <div className="resumen-resenas">
          <p className="promedio"><strong>{t('resena.deCinco', { n: Number(resumen.promedio).toFixed(1) })}</strong> · {t(resumen.total === 1 ? 'resena.una' : 'resena.varias', { n: resumen.total })}</p>
          <ul className="barras">
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n}>
                <span>{n} ★</span>
                <span className="barra" aria-hidden="true"><span style={{ width: `${100 * resumen[`e${n}`] / resumen.total}%` }} /></span>
                <span className="numero">{resumen[`e${n}`]}</span>
              </li>
            ))}
          </ul>
          {resumen.pct_accesible != null && <p className="secundario">{t('resena.accesiblePct', { n: Math.round(resumen.pct_accesible) })}</p>}
        </div>
      )}

      {datos && !uid && <button type="button" className="boton" onClick={pedirEntrar}>{t('resena.opinar')}</button>}
      {datos && uid && !mia && <FormResena key={`nueva-${puntoId}`} puntoId={puntoId} onGuardada={recargar} />}
      {datos && uid && mia && !editando && (
        <div className="resena mia">
          <p className="suave">{t('resena.tuResena')}{mia.estado === 'oculta' && <> · <strong>{t('resena.oculta')}</strong></>}</p>
          <p><Estrellas n={mia.estrellas} /></p>
          {mia.texto && <p className="resena-texto">{mia.texto}</p>}
          <button type="button" className="boton" onClick={() => setEditando(true)}>{t('resena.editar')}</button>
        </div>
      )}
      {datos && uid && mia && editando && <FormResena key={mia.id} puntoId={puntoId} mia={mia} onGuardada={recargar} onCancelar={() => setEditando(false)} />}

      {lista.length > 0 && (
        <>
          <div className="filtros" role="group" aria-label={t('resena.ordenar')}>
            {Object.keys(ORDEN).map((o) => (
              <button key={o} type="button" className="chip" aria-pressed={orden === o} onClick={() => setOrden(o)}>{t(`resena.${o}`)}</button>
            ))}
          </div>
          <ul className="lista-resenas">
            {lista.map((r) => (
              <li key={r.id} className="resena">
                <p><strong>{r.autor}</strong> <span className="suave">· {fecha(r.creada_en)}{r.editada_en && ` · ${t('resena.editada')}`}</span></p>
                <p><Estrellas n={r.estrellas} />{r.accesible != null && <span className="secundario"> · {t(r.accesible ? 'resena.esAccesible' : 'resena.noAccesible')}</span>}</p>
                {r.texto && <p className="resena-texto">{r.texto}</p>}
                {uid && r.usuario_id !== uid ? (
                  <div className="fila-botones">
                    <button type="button" className="boton" aria-pressed={votos.has(r.id)} onClick={() => alternarUtil(r)}>{t('resena.util', { n: r.utiles })}</button>
                    <button type="button" className="boton-texto" onClick={() => setDenunciada(r)}>{t('resena.denunciar')}</button>
                  </div>
                ) : r.utiles > 0 && <p className="suave">{t('resena.util', { n: r.utiles })}</p>}
              </li>
            ))}
          </ul>
          {hayMas && <button type="button" className="boton ancho" onClick={verMas}>{t('resena.verMas')}</button>}
        </>
      )}
      {denunciada && <Denunciar resena={denunciada} onCerrar={() => setDenunciada(null)} />}
    </section>
  )
}

function Denunciar({ resena, onCerrar }) {
  const { t } = useIdioma()
  const { avisar } = useCuenta()
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const caja = useRef(null)
  useDialogo(caja, onCerrar, { atrapar: true, respaldo: '#titulo-resenas' })

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    const { error } = await supabase.from('resena_denuncia').insert({ resena_id: resena.id, motivo: motivo.trim() })
    avisar(!error ? 'resena.denunciada' : error.code === '23505' ? 'resena.yaDenunciada' : claveDeError(error))
    onCerrar()
  }

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-denuncia" onClick={onCerrar}>
      <form className="modal" ref={caja} onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2 id="titulo-denuncia">{t('resena.denunciarTitulo', { autor: resena.autor })}</h2>
        <label className="campo-texto">
          <span>{t('resena.motivo')}</span>
          <textarea rows={3} maxLength={300} required value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
        <div className="acciones dos">
          <button type="button" className="boton" onClick={onCerrar}>{t('cuenta.cancelar')}</button>
          <button type="submit" className="boton primario" disabled={enviando || motivo.trim() === ''}>{t('resena.enviarDenuncia')}</button>
        </div>
      </form>
    </div>
  )
}

export default Resenas
