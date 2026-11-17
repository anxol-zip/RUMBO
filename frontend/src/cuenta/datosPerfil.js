import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/cliente.js'
import { supabase } from '../api/supabase.js'

// Datos del panel de perfil. Todo sale de lo que ya existe: las reseñas propias las deja leer la
// política RLS "leer reseñas" (usuario_id = auth.uid(), incluidas las ocultas) y el color de cada
// Favorito sale del semáforo público. No hay endpoints nuevos.

const CAMPOS = 'id, punto_id, estrellas, accesible, texto, estado, utiles, creada_en, editada_en'

// Mis reseñas, de la más reciente a la más vieja. estado: 'cargando' | 'listo' | 'error'.
export function useMisResenas(uid) {
  const [revision, setRevision] = useState(0)
  const [respuesta, setRespuesta] = useState(null)        // { clave, lista, error }
  const clave = `${uid}|${revision}`

  useEffect(() => {
    if (!uid || !supabase) return undefined
    let vigente = true
    supabase.from('resena').select(CAMPOS).eq('usuario_id', uid).order('creada_en', { ascending: false })
      .then(({ data, error }) => { if (vigente) setRespuesta({ clave, lista: data ?? [], error: Boolean(error) }) })
      .catch(() => { if (vigente) setRespuesta({ clave, lista: [], error: true }) })
    return () => { vigente = false }
  }, [uid, clave])

  const recargar = useCallback(() => setRevision((n) => n + 1), [])
  const actual = respuesta?.clave === clave ? respuesta : null
  return {
    estado: !actual ? 'cargando' : actual.error ? 'error' : 'listo',
    lista: actual?.lista ?? [],
    recargar,
  }
}

// Color de cada lugar ahora mismo ({ id: punto del semáforo }). Si falla, el panel muestra los
// Favoritos sin su estado: es un dato de apoyo, no un error que bloquee.
export function useSemaforoAhora(activo) {
  const [puntos, setPuntos] = useState(null)
  useEffect(() => {
    if (!activo) return undefined
    let vigente = true
    api.obtenerSemaforo()
      .then((datos) => { if (vigente) setPuntos(new Map(datos.puntos.map((p) => [p.id, p]))) })
      .catch(() => { if (vigente) setPuntos(new Map()) })
    return () => { vigente = false }
  }, [activo])
  return puntos
}
