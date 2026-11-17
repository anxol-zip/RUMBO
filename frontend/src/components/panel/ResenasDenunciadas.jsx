import { useEffect, useState } from 'react'
import { supabase } from '../../api/supabase.js'
import { useCuenta } from '../../cuenta/contexto.js'
import Esqueleto from '../Esqueleto.jsx'

// Moderación (feature 002, FR-029 a FR-031): reseñas con denuncias, primero las que tienen más.
// El administrador solo oculta o restaura; la base no deja a nadie más (RLS + RN_R2).
function ResenasDenunciadas({ puntos }) {
  const { avisar } = useCuenta()
  const [grupos, setGrupos] = useState(null)
  const [version, setVersion] = useState(0)
  const [errorCarga, setErrorCarga] = useState(null)

  useEffect(() => {
    let vigente = true
    supabase.from('resena_denuncia')
      .select('motivo, creada_en, resena:resena_id(id, punto_id, autor, estrellas, texto, estado)')
      .then(({ data, error }) => {
        if (!vigente) return
        if (error) throw error
        const porResena = new Map()
        for (const d of data ?? []) {
          if (!d.resena) continue
          if (!porResena.has(d.resena.id)) porResena.set(d.resena.id, { resena: d.resena, motivos: [] })
          porResena.get(d.resena.id).motivos.push(d.motivo)
        }
        setGrupos([...porResena.values()].sort((a, b) => b.motivos.length - a.motivos.length))
      })
      .catch(() => { if (vigente) setErrorCarga(version) })
    return () => { vigente = false }
  }, [version])

  async function cambiar(resena, estado) {
    const { error } = await supabase.from('resena').update({ estado }).eq('id', resena.id)
    avisar(error ? 'error.servidor' : estado === 'oculta' ? 'panel.resenaOculta' : 'panel.resenaRestaurada')
    setVersion((v) => v + 1)
  }

  const avisoError = errorCarga === version && <div><p role="alert">No se pudieron cargar las reseñas denunciadas.</p>
    <button type="button" className="boton-texto" onClick={() => setVersion((v) => v + 1)}>Reintentar</button></div>
  if (!grupos) return avisoError || <Esqueleto tipo="resenas" />
  if (grupos.length === 0) return <>{avisoError}<p className="secundario">No hay reseñas denunciadas.</p></>
  const lugar = (id) => puntos.find((p) => p.id === id)?.nombre ?? `Lugar ${id}`

  return (
    <>{avisoError}<ul className="lista-resenas">
      {grupos.map(({ resena, motivos }) => (
        <li key={resena.id} className="resena">
          <p><strong>{lugar(resena.punto_id)}</strong> · {resena.autor} · {resena.estrellas} de 5 estrellas
            {resena.estado === 'oculta' && <> · <span className="insignia">Oculta</span></>}</p>
          {resena.texto && <p className="resena-texto">{resena.texto}</p>}
          <p className="suave">{motivos.length === 1 ? '1 denuncia' : `${motivos.length} denuncias`}:</p>
          <ul className="secundario">{motivos.map((m, i) => <li key={i}>{m}</li>)}</ul>
          {resena.estado === 'visible'
            ? <button type="button" className="boton" onClick={() => cambiar(resena, 'oculta')}>Ocultar</button>
            : <button type="button" className="boton" onClick={() => cambiar(resena, 'visible')}>Restaurar</button>}
        </li>
      ))}
    </ul></>
  )
}

export default ResenasDenunciadas
