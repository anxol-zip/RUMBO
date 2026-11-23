import { useRef } from 'react'
import { FOTOS, rutaFoto } from '../data/fotos.js'
import { useIdioma } from '../i18n/contexto.js'
import Icono from './Icono.jsx'

// Foto de un lugar. "mini" es decorativa (el nombre va al lado); "grande" lleva texto
// alternativo y, si se pide, el crédito que exige la licencia (encima de la foto, abajo a la izquierda).
// "ampliable" agrega un botón para verla en grande en una ventana (dialog: Esc la cierra).
function Foto({ id, nombre, tamano = 'grande', credito = false, ampliable = false }) {
  const { t } = useIdioma()
  const ventana = useRef(null)
  const foto = FOTOS[id]
  if (!foto) return <div className={`foto ${tamano} sin-foto`} aria-hidden="true" />
  const [ancho, alto] = tamano === 'mini' ? [200, 200] : [900, 600]
  const alt = tamano === 'mini' ? '' : t('foto.alt', { nombre })
  const textoCredito = t('foto.credito', { autor: foto.autor, licencia: foto.licencia })
  return (
    <figure className={`foto ${tamano}${credito ? ' con-credito' : ''}`}>
      <img src={rutaFoto(id, tamano)} alt={alt} width={ancho} height={alto} loading="lazy" decoding="async" />
      {ampliable && (
        <>
          <button type="button" className="foto-ampliar" onClick={() => ventana.current?.showModal()} aria-label={t('foto.ampliar', { nombre })}>
            <Icono nombre="expandir" />
          </button>
          <dialog ref={ventana} className="foto-ventana" aria-label={alt} onClick={(e) => { if (e.target === ventana.current) ventana.current.close() }}>
            <img className="foto-ampliada" src={rutaFoto(id, tamano)} alt={alt} width={ancho} height={alto} />
            <button type="button" className="foto-cerrar" onClick={() => ventana.current?.close()} aria-label={t('foto.cerrar')}>
              <Icono nombre="cerrar" />
            </button>
          </dialog>
        </>
      )}
      {credito && (
        <figcaption>
          <a href={foto.pagina} target="_blank" rel="noreferrer"><Icono nombre="camara" />{textoCredito}</a>
        </figcaption>
      )}
    </figure>
  )
}

export default Foto
