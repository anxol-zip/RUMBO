import { useState } from 'react'
import { claveDeError, supabase } from '../api/supabase.js'
import { useCuenta } from '../cuenta/contexto.js'
import { useIdioma } from '../i18n/contexto.js'

const BORRADOR = 'rumbo:borradorResena'   // lo escrito, si la sesión venció al guardar
const MAXIMO = 1000

function leerBorrador(puntoId) {
  try {
    const b = JSON.parse(sessionStorage.getItem(BORRADOR))
    return b?.puntoId === puntoId ? b : null
  } catch { return null }
}

const sesionVencida = (error) => error?.code === 'PGRST301' || /jwt/i.test(error?.message ?? '')

// Formulario de mi reseña (FR-021 y FR-022): estrellas (obligatorio), "¿Es accesible?" y comentario.
// Las estrellas son botones de opción: se eligen con las flechas y el lector dice "4 de 5 estrellas".
function FormResena({ puntoId, mia = null, onGuardada, onCancelar = null }) {
  const { t } = useIdioma()
  const { avisar, pedirEntrar } = useCuenta()
  const [inicial] = useState(() => leerBorrador(puntoId) ?? mia)
  const [estrellas, setEstrellas] = useState(inicial?.estrellas ?? 0)
  const [accesible, setAccesible] = useState(inicial?.accesible ?? null)
  const [texto, setTexto] = useState(inicial?.texto ?? '')
  const [falta, setFalta] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function terminar(error, claveExito) {
    setEnviando(false)
    if (!error) {
      try { sessionStorage.removeItem(BORRADOR) } catch { /* sin almacenamiento */ }
      avisar(claveExito)
      onGuardada()
    } else if (sesionVencida(error)) {
      // La sesión venció: se guarda lo escrito y se pide entrar otra vez, sin perderlo.
      try { sessionStorage.setItem(BORRADOR, JSON.stringify({ puntoId, estrellas, accesible, texto })) } catch { /* sin almacenamiento */ }
      pedirEntrar()
    } else if (error.code === '23505') {
      onGuardada()                    // ya existía mi reseña: se recarga para editarla
    } else {
      avisar(claveDeError(error))
    }
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (estrellas === 0) { setFalta(true); return }
    setEnviando(true)
    const campos = { estrellas, accesible, texto: texto.trim() || null }
    const { error } = mia
      ? await supabase.from('resena').update(campos).eq('id', mia.id)
      : await supabase.from('resena').insert({ punto_id: puntoId, ...campos })
    terminar(error, 'resena.guardada')
  }

  async function borrar() {
    setEnviando(true)
    const { error } = await supabase.from('resena').delete().eq('id', mia.id)
    terminar(error, 'resena.borrada')
  }

  return (
    <form className="form-resena" onSubmit={guardar}>
      <fieldset className="opciones" aria-describedby={falta ? 'falta-estrellas' : undefined}>
        <legend>{t('resena.estrellas')}</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input type="radio" name="estrellas" value={n} checked={estrellas === n} aria-label={t('resena.deCinco', { n })}
              onChange={() => { setEstrellas(n); setFalta(false) }} />
            <span aria-hidden="true">{n} ★</span>
          </label>
        ))}
      </fieldset>
      {falta && <p id="falta-estrellas" className="error-campo" role="alert">{t('resena.faltanEstrellas')}</p>}

      <fieldset className="opciones">
        <legend>{t('resena.accesible')}</legend>
        {[[true, 'resena.si'], [false, 'resena.no'], [null, 'resena.noSe']].map(([valor, clave]) => (
          <label key={clave}>
            <input type="radio" name="accesible" checked={accesible === valor} onChange={() => setAccesible(valor)} />
            <span>{t(clave)}</span>
          </label>
        ))}
      </fieldset>

      <label className="campo-texto">
        <span>{t('resena.comentario')}</span>
        <textarea rows={3} maxLength={MAXIMO} value={texto} onChange={(e) => setTexto(e.target.value)} aria-describedby="contador-resena" />
      </label>
      <p id="contador-resena" className="suave">{texto.length}/{MAXIMO}</p>

      <div className="fila-botones">
        <button type="submit" className="boton primario" disabled={enviando}>{t(mia ? 'resena.guardar' : 'resena.publicar')}</button>
        {onCancelar && <button type="button" className="boton" onClick={onCancelar}>{t('cuenta.cancelar')}</button>}
        {mia && <button type="button" className="boton-texto peligro" disabled={enviando} onClick={borrar}>{t('resena.borrar')}</button>}
      </div>
    </form>
  )
}

export default FormResena
