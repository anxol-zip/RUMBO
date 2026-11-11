import { useCallback, useEffect, useMemo, useState } from 'react'
import { regreso, supabase } from '../api/supabase.js'
import { Contexto } from './contexto.js'

// Cuenta del turista (feature 002): sesión de Supabase (Microsoft), perfil (nombre, rol, gustos) y
// Favoritos. Todo es opcional: sin sesión, o sin Supabase configurado (disponible = false), la app
// funciona igual que antes. Las reglas (quién ve y cambia qué) las hace cumplir la base con RLS.
const PENDIENTE = 'rumbo:pendiente'   // lo que la persona quiso hacer antes de iniciar sesión (FR-020)
const SIN_PERFIL = { nombre: '', rol: 'turista', gustos: [] }

function guardarPendiente(pendiente) {
  try { sessionStorage.setItem(PENDIENTE, JSON.stringify(pendiente)) } catch { /* sin almacenamiento */ }
}
function tomarPendiente() {
  try {
    const pendiente = JSON.parse(sessionStorage.getItem(PENDIENTE))
    sessionStorage.removeItem(PENDIENTE)
    return pendiente
  } catch { return null }
}

export function ProveedorCuenta({ children }) {
  const [sesion, setSesion] = useState(null)
  const [lista, setLista] = useState(supabase === null)     // ya se sabe si hay sesión guardada
  const [datos, setDatos] = useState(null)                  // { uid, perfil, favoritos } de la persona
  // { id, clave }: lo lee la región aria-live de App. Si Microsoft regresó con error, empieza con ese aviso (FR-007).
  const [aviso, setAviso] = useState(() => (supabase && regreso.conError ? { id: 0, clave: 'error.login' } : null))
  const [pidiendoEntrar, setPidiendoEntrar] = useState(false)
  const avisar = useCallback((clave) => setAviso({ id: Date.now(), clave }), [])

  useEffect(() => {
    if (!aviso) return undefined
    const id = setTimeout(() => setAviso(null), 6000)
    return () => clearTimeout(id)
  }, [aviso])

  useEffect(() => {
    if (!supabase) return undefined
    if (regreso.conError) window.history.replaceState(null, '', window.location.pathname)   // quita el error de la URL
    // También avisa cuando la sesión cambia en otra pestaña o se renueva sola.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => { setSesion(nueva); setLista(true) })
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = sesion?.user.id ?? null
  const mios = datos?.uid === uid ? datos : null

  useEffect(() => {
    if (!uid) return undefined
    let vigente = true
    Promise.all([
      supabase.from('perfil').select('nombre, rol, gustos').maybeSingle(),
      supabase.from('favorito').select('punto_id'),
    ]).then(([perfil, favs]) => {
      if (!vigente) return
      const favoritos = new Set((favs.data ?? []).map((f) => f.punto_id))
      const pendiente = tomarPendiente()
      if (pendiente?.tipo === 'favorito' && !favoritos.has(pendiente.puntoId)) {
        favoritos.add(pendiente.puntoId)
        supabase.from('favorito').upsert({ punto_id: pendiente.puntoId }, { onConflict: 'usuario_id,punto_id', ignoreDuplicates: true })
          .then(({ error }) => avisar(error ? 'error.servidor' : 'favorito.agregado'))
      } else if (regreso.conSesion) {
        avisar('cuenta.iniciada')
      }
      regreso.conSesion = false
      setDatos({ uid, perfil: perfil.data ?? SIN_PERFIL, favoritos })
    })
    return () => { vigente = false }
  }, [uid, avisar])

  const pedirEntrar = useCallback(() => setPidiendoEntrar(true), [])
  const cancelarEntrar = useCallback(() => setPidiendoEntrar(false), [])

  // Página completa, sin ventanas emergentes; al terminar, Microsoft regresa a esta misma pantalla.
  const entrar = useCallback(() => supabase?.auth.signInWithOAuth({
    provider: 'azure',
    options: { scopes: 'email profile', redirectTo: window.location.origin + window.location.pathname },
  }), [])

  const salir = useCallback(async () => {
    await supabase.auth.signOut()
    avisar('cuenta.cerrada')
  }, [avisar])

  const borrarCuenta = useCallback(async () => {
    const { error } = await supabase.rpc('borrar_mi_cuenta')
    if (error) { avisar('error.servidor'); return false }
    await supabase.auth.signOut({ scope: 'local' })
    avisar('cuenta.borrada')
    return true
  }, [avisar])

  const guardarGustos = useCallback(async (gustos) => {
    if (!uid) return
    const { error } = await supabase.from('perfil').update({ gustos }).eq('id', uid)
    if (!error) setDatos((d) => (d?.uid === uid ? { ...d, perfil: { ...d.perfil, gustos } } : d))
  }, [uid])

  const alternarFavorito = useCallback(async (puntoId) => {
    if (!uid) {                       // sin sesión: se recuerda y se completa al volver (FR-020)
      guardarPendiente({ tipo: 'favorito', puntoId })
      setPidiendoEntrar(true)
      return
    }
    const estaba = mios?.favoritos.has(puntoId) ?? false
    const poner = (dentro) => setDatos((d) => {
      if (d?.uid !== uid) return d
      const favoritos = new Set(d.favoritos)
      if (dentro) favoritos.add(puntoId); else favoritos.delete(puntoId)
      return { ...d, favoritos }
    })
    poner(!estaba)                    // se ve al instante; si la base lo rechaza, se regresa
    const { error } = estaba
      ? await supabase.from('favorito').delete().eq('punto_id', puntoId)
      : await supabase.from('favorito').upsert({ punto_id: puntoId }, { onConflict: 'usuario_id,punto_id', ignoreDuplicates: true })
    if (error) { poner(estaba); avisar('error.servidor') } else avisar(estaba ? 'favorito.quitado' : 'favorito.agregado')
  }, [uid, mios, avisar])

  const valor = useMemo(() => ({
    disponible: supabase !== null,
    cargando: !lista || (uid !== null && mios === null),
    sesion, usuario: sesion?.user ?? null,
    perfil: mios?.perfil ?? null,
    favoritos: mios?.favoritos ?? null,
    aviso, avisar, pidiendoEntrar, pedirEntrar, cancelarEntrar,
    entrar, salir, borrarCuenta, guardarGustos, alternarFavorito,
  }), [lista, uid, mios, sesion, aviso, avisar, pidiendoEntrar, pedirEntrar, cancelarEntrar, entrar, salir, borrarCuenta, guardarGustos, alternarFavorito])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
