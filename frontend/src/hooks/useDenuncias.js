import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabase.js'
import { agruparDenuncias } from '../data/tablero.js'

// Moderación (feature 002, FR-029 a FR-031): las reseñas con denuncias, agrupadas. Vive en el panel y
// no en su pestaña, porque el resumen también avisa cuántas hay por revisar. El administrador solo
// oculta o restaura; la base no deja a nadie más (RLS + RN_R2).
// estado: 'cargando' | 'listo' | 'error'. cambiar(resena, 'oculta' | 'visible') → true si se guardó.
export function useDenuncias() {
  const [version, setVersion] = useState(0)
  const [respuesta, setRespuesta] = useState(null)      // { version, grupos, error }

  useEffect(() => {
    if (!supabase) return undefined
    let vigente = true
    supabase.from('resena_denuncia')
      .select('motivo, creada_en, resena:resena_id(id, punto_id, autor, estrellas, texto, estado, creada_en)')
      .then(({ data, error }) => { if (vigente) setRespuesta({ version, grupos: error ? [] : agruparDenuncias(data), error: Boolean(error) }) })
      .catch(() => { if (vigente) setRespuesta({ version, grupos: [], error: true }) })
    return () => { vigente = false }
  }, [version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const cambiar = useCallback(async (resena, estado) => {
    const { error } = await supabase.from('resena').update({ estado }).eq('id', resena.id)
    setVersion((v) => v + 1)
    return !error
  }, [])

  // Mientras recarga después de ocultar, se siguen mostrando los grupos anteriores (sin esqueleto).
  return {
    estado: !supabase ? 'listo' : !respuesta ? 'cargando' : respuesta.error ? 'error' : 'listo',
    grupos: respuesta?.grupos ?? [],
    recargar,
    cambiar,
  }
}
