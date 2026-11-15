import { useEffect, useRef, useState } from 'react'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// Copia texto aunque no haya Clipboard API (http sin localhost, navegadores viejos)
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: texto })
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'; area.style.opacity = '0'
    document.body.append(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

// Compartir un lugar: solo el enlace de Google Maps para llegar.
// En el celular abre el menú de compartir del sistema (WhatsApp, etc.); donde no hay menú
// (Chrome y Firefox en Linux, Firefox en Windows) copia el enlace y lo avisa junto al botón.
function BotonCompartir({ estado }) {
  const { t } = useIdioma()
  const [aviso, setAviso] = useState(null)        // 'copiado' | 'error' | null
  const temporizador = useRef(null)
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function avisar(tipo) {
    setAviso(tipo)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setAviso(null), 2500)
  }

  async function compartir() {
    const url = estado.como_llegar_url
    if (navigator.share) {
      try {
        await navigator.share({ title: estado.nombre, url })
        return
      } catch (e) {
        if (e.name === 'AbortError') return       // el turista cerró el menú: no es un error
      }
    }
    avisar((await copiar(url)) ? 'copiado' : 'error')
  }

  return (
    <span className="compartir">
      <button type="button" className="boton-icono" onClick={compartir} aria-label={t('compartir.boton', { lugar: estado.nombre })} title={t('compartir.titulo')}>
        <Icono nombre="compartir" />
      </button>
      <span className={`compartir-aviso${aviso ? ' visible' : ''}`} role="status">
        {aviso === 'copiado' ? t('compartir.copiado') : aviso === 'error' ? t('compartir.error') : ''}
      </span>
    </span>
  )
}

export default BotonCompartir
