import { useIdioma } from '../i18n/contexto.js'

function Lineas({ cantidad = 3 }) {
  return <div className="esqueleto-lineas">{Array.from({ length: cantidad }, (_, i) =>
    <span key={i} className={`esqueleto-bloque esqueleto-linea${i === cantidad - 1 ? ' corta' : ''}`} />)}</div>
}

function Filas({ cantidad = 3, foto = false }) {
  return <div className="esqueleto-filas">{Array.from({ length: cantidad }, (_, i) =>
    <div key={i} className={`esqueleto-fila${foto ? ' con-miniatura' : ''}`}>
      {foto && <span className="esqueleto-bloque esqueleto-miniatura" />}
      <Lineas cantidad={foto ? 3 : 2} />
    </div>)}</div>
}

function Ficha() {
  return <>
    <div className="esqueleto-ficha-principal">
      <span className="esqueleto-bloque esqueleto-linea corta" />
      <span className="esqueleto-bloque esqueleto-titulo" />
      <span className="esqueleto-bloque esqueleto-etiqueta" />
      <span className="esqueleto-bloque esqueleto-conclusion" />
      <span className="esqueleto-bloque esqueleto-foto" />
      <Lineas />
    </div>
    <div className="esqueleto-ficha-datos">
      <div className="esqueleto-tarjeta"><Lineas /></div>
      <div className="esqueleto-tarjeta"><Lineas cantidad={4} /></div>
    </div>
  </>
}

function Formas({ tipo }) {
  if (tipo === 'inicio') return <>
    <div className="esqueleto-portada"><div><span className="esqueleto-bloque esqueleto-titulo" /><Lineas cantidad={2} />
      <div className="esqueleto-postales">{[0, 1, 2].map((i) => <span key={i} className="esqueleto-bloque" />)}</div>
    </div></div>
    <div className="esqueleto-formulario">{[0, 1, 2].map((i) => <div key={i} className="esqueleto-pregunta"><Lineas cantidad={2} />
      <div className="esqueleto-opciones">{[0, 1, 2, 3].map((j) => <span key={j} className="esqueleto-bloque" />)}</div>
    </div>)}</div>
  </>
  if (tipo === 'ficha') return <Ficha />
  if (tipo === 'lista') return <Filas foto />
  if (tipo === 'favoritos') return <Filas />
  if (tipo === 'resenas') return <><span className="esqueleto-bloque esqueleto-resumen" /><Filas cantidad={2} /></>
  if (tipo === 'masResenas') return <Filas cantidad={1} />
  if (tipo === 'panel') return <><span className="esqueleto-bloque esqueleto-titulo" /><div className="esqueleto-indicadores">
    {[0, 1, 2, 3].map((i) => <div key={i} className="esqueleto-tarjeta"><Lineas cantidad={2} /><span className="esqueleto-bloque esqueleto-cifra" /></div>)}
  </div><div className="esqueleto-graficas">{[0, 1].map((i) => <div key={i} className="esqueleto-tarjeta"><Lineas cantidad={2} /><span className="esqueleto-bloque esqueleto-grafica" /></div>)}</div></>
  if (tipo === 'semana') return <div className="esqueleto-semana">{Array.from({ length: 7 }, (_, i) =>
    <div key={i}>{Array.from({ length: 8 }, (_, j) => <span key={j} className="esqueleto-bloque" />)}</div>)}</div>
  if (tipo === 'recomendacion') return <><span className="esqueleto-bloque esqueleto-titulo" /><Lineas cantidad={2} /><div className="esqueleto-tarjeta"><span className="esqueleto-bloque esqueleto-foto" /><Lineas cantidad={4} /></div></>
  // Mientras se comprueba la sesión no se dibuja contenido del panel administrativo.
  return <Lineas cantidad={2} />
}

// El anuncio es hermano de la región ocupada, para que aria-busy no lo silencie.
// `anunciar=false` permite que una región padre mantenga su propio anuncio fuera de aria-busy.
function Esqueleto({ tipo = 'lista', anunciar = true }) {
  const { t } = useIdioma()
  const etiqueta = t(`carga.${tipo}`)
  return <div className={`carga-esqueleto carga-${tipo}`}>
    {anunciar && <p role="status" className="oculto-accesible">{etiqueta}</p>}
    <div aria-busy="true" aria-label={etiqueta}>
      <div className={`esqueleto esqueleto-${tipo}`} aria-hidden="true"><Formas tipo={tipo} /></div>
    </div>
  </div>
}

export default Esqueleto
