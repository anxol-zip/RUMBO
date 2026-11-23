import { useState } from 'react'
import { useCuenta } from '../../cuenta/contexto.js'
import { useIdioma } from '../../i18n/contexto.js'
import Esqueleto from '../Esqueleto.jsx'
import Icono from '../Icono.jsx'

// Moderación: las reseñas que los turistas denunciaron. "Por revisar" son las que siguen a la vista;
// "Ocultas", las que ya se quitaron de la ficha (su autor las sigue viendo y se pueden restaurar).
// Los datos los trae useDenuncias desde el panel; aquí solo se pintan y se ocultan o restauran.
function ResenasDenunciadas({ estado, grupos, recargar, cambiar, puntos }) {
  const { idioma, t } = useIdioma()
  const { avisar } = useCuenta()
  const [filtro, setFiltro] = useState('visible')
  const [guardando, setGuardando] = useState(null)
  const lugar = (id) => puntos.find((p) => p.id === id)?.nombre ?? t('tablero.lugarN', { n: id })
  const fecha = (iso) => new Date(iso).toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short' })

  async function aplicar(resena, nuevo) {
    setGuardando(resena.id)
    const correcto = await cambiar(resena, nuevo)
    setGuardando(null)
    avisar(!correcto ? 'error.servidor' : nuevo === 'oculta' ? 'panel.resenaOculta' : 'panel.resenaRestaurada')
  }

  if (estado === 'cargando') return <Esqueleto tipo="resenas" />
  if (estado === 'error') {
    return <div className="tablero-vacio"><p role="alert">{t('tablero.moderacionError')}</p>
      <button type="button" className="boton" onClick={recargar}>{t('error.reintentar')}</button></div>
  }

  const cuantas = { visible: grupos.filter((g) => g.resena.estado === 'visible').length, oculta: grupos.filter((g) => g.resena.estado === 'oculta').length }
  const lista = grupos.filter((g) => g.resena.estado === filtro)
  return (
    <>
      <div className="segmentado" role="group" aria-label={t('tablero.moderacionFiltro')}>
        {['visible', 'oculta'].map((f) => (
          <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
            {t(`tablero.moderacion.${f}`)} <span className="perfil-contador">{cuantas[f]}</span>
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <p className="tablero-vacio">{t(filtro === 'visible' ? 'tablero.moderacionVacia' : 'tablero.moderacionSinOcultas')}</p>
      )}
      {lista.length > 0 && (
        <ul className="denuncias">
          {lista.map(({ resena, motivos, ultima }) => (
            <li key={resena.id} className={`denuncia${resena.estado === 'oculta' ? ' oculta' : ''}`}>
              <div className="denuncia-cabeza">
                <div>
                  <p className="denuncia-lugar">{lugar(resena.punto_id)}</p>
                  <p className="denuncia-meta">
                    <span className="estrellas-dibujo" aria-hidden="true">{'★'.repeat(resena.estrellas)}<span>{'★'.repeat(5 - resena.estrellas)}</span></span>
                    <span className="oculto-accesible">{t('resena.deCinco', { n: resena.estrellas })}</span>
                    <span>{resena.autor}</span>
                    {resena.creada_en && <span>{fecha(resena.creada_en)}</span>}
                  </p>
                </div>
                <p className="denuncia-cuenta"><Icono nombre="info" />{t(motivos.length === 1 ? 'tablero.unaDenuncia' : 'tablero.denuncias', { n: motivos.length })}</p>
              </div>
              {resena.texto ? <blockquote className="denuncia-texto">{resena.texto}</blockquote>
                : <p className="tablero-ayuda">{t('tablero.sinTexto')}</p>}
              <div className="denuncia-motivos">
                <span className="tablero-ayuda">{t('tablero.motivos', { fecha: fecha(ultima) })}</span>
                {motivos.map((m, i) => <span key={i} className="insignia">{m}</span>)}
              </div>
              <div className="denuncia-acciones">
                {resena.estado === 'visible'
                  ? <button type="button" className="boton peligro" disabled={guardando === resena.id} onClick={() => aplicar(resena, 'oculta')}>{t('tablero.ocultar')}</button>
                  : <button type="button" className="boton" disabled={guardando === resena.id} onClick={() => aplicar(resena, 'visible')}>{t('tablero.restaurar')}</button>}
                <p className="tablero-ayuda">{t(resena.estado === 'visible' ? 'tablero.ocultarAyuda' : 'tablero.restaurarAyuda')}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ResenasDenunciadas
