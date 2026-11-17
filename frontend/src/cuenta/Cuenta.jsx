import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { regreso, supabase } from '../api/supabase.js'
import { Contexto } from './contexto.js'
import { descartarPendiente, guardarPendiente, reanudarFavorito, tomarPendiente } from './pendiente.js'

// Cuenta del turista (feature 002): sesión de Supabase (Microsoft), perfil (nombre, rol, gustos) y
// Favoritos. Todo es opcional: sin sesión, o sin Supabase configurado (disponible = false), la app
// funciona igual que antes. Las reglas (quién ve y cambia qué) las hace cumplir la base con RLS.
const SIN_PERFIL = { nombre: '', rol: 'turista', gustos: [] }

export function ProveedorCuenta({ children }) {
  const [sesion, setSesion] = useState(null)
  const sesionActual = useRef(null)
  const [lista, setLista] = useState(supabase === null)     // ya se sabe si hay sesión guardada
  const [datos, setDatos] = useState(null)                  // { uid, perfil, favoritos } de la persona
  const [revision, setRevision] = useState(0)
  const recargarCuenta = useCallback(() => setRevision((n) => n + 1), [])
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
    if (regreso.conError) {
      descartarPendiente()
      window.history.replaceState(null, '', window.location.pathname)   // quita el error de la URL
    }
    // También avisa cuando la sesión cambia en otra pestaña o se renueva sola.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      sesionActual.current = nueva
      setSesion(nueva)
      setLista(true)
      if (nueva) {
        setPidiendoEntrar(false)
        // Un evento de la misma cuenta también puede traer un rol revocado o cambiado.
        // Invalidar el perfil anterior hasta volver a confirmarlo en la base.
        setRevision((n) => n + 1)
      }
      if (_evento === 'SIGNED_OUT') { descartarPendiente(); setDatos(null) }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = sesion?.user.id ?? null
  const mios = datos?.uid === uid && datos.revision === revision ? datos : null

  useEffect(() => {
    if (!uid) return undefined
    let vigente = true
    Promise.all([
      supabase.from('perfil').select('nombre, rol, gustos').eq('id', uid).maybeSingle(),
      supabase.from('favorito').select('punto_id').eq('usuario_id', uid),
    ]).then(async ([perfil, favs]) => {
      if (!vigente) return
      const conocidos = new Set((favs.data ?? []).map((f) => f.punto_id))
      if (favs.error) descartarPendiente()
      // Consumir solo después de cargar y comprobar que esta cuenta sigue vigente (StrictMode).
      const resultado = await reanudarFavorito(favs.error ? null : tomarPendiente(), conocidos,
        (puntoId) => supabase.from('favorito').upsert({ punto_id: puntoId }, { onConflict: 'usuario_id,punto_id', ignoreDuplicates: true }))
      if (!vigente) return
      if (perfil.error || favs.error || resultado.error) avisar('error.servidor')
      else if (resultado.agregado) avisar('favorito.agregado')
      else if (regreso.conSesion) {
        avisar('cuenta.iniciada')
      }
      regreso.conSesion = false
      setDatos({ uid, revision, perfil: perfil.data ?? SIN_PERFIL, favoritos: favs.error ? null : resultado.favoritos,
        error: Boolean(perfil.error || favs.error) })
    }).catch(() => {
      if (!vigente) return
      descartarPendiente()
      avisar('error.servidor')
      setDatos({ uid, revision, perfil: SIN_PERFIL, favoritos: null, error: true })
    })
    return () => { vigente = false }
  }, [uid, avisar, revision])

  const pedirEntrar = useCallback(() => {
    descartarPendiente()             // Cuenta u "Opinar" no reanudan un favorito anterior.
    if (!supabase) { avisar('error.login'); return }
    setPidiendoEntrar(true)
  }, [avisar])
  const cancelarEntrar = useCallback(() => {
    descartarPendiente()
    setPidiendoEntrar(false)
  }, [])

  // Página completa, sin ventanas emergentes; al terminar, Microsoft regresa a esta misma pantalla.
  const entrar = useCallback(async () => {
    try {
      if (!supabase) throw new Error('Sin Supabase')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: { scopes: 'email profile', redirectTo: window.location.origin + window.location.pathname },
      })
      if (!error) return
    } catch { /* el aviso también cubre fallos de red y configuración */ }
    descartarPendiente()
    setPidiendoEntrar(false)
    avisar('error.login')
  }, [avisar])

  const salir = useCallback(async () => {
    if (!uid || sesionActual.current?.user.id !== uid) return false
    try {
      const { error } = await supabase.auth.signOut()
      if (sesionActual.current && sesionActual.current.user.id !== uid) return false
      if (error) throw error
      descartarPendiente()
      setSesion(null)
      setDatos(null)
      avisar('cuenta.cerrada')
      return true
    } catch {
      if (sesionActual.current?.user.id === uid) avisar('error.servidor')
      return false
    }
  }, [avisar, uid])

  const borrarCuenta = useCallback(async () => {
    if (!uid || sesionActual.current?.user.id !== uid) return false
    try {
      const { error } = await supabase.rpc('borrar_mi_cuenta')
      if (error) throw error
    } catch {
      if (sesionActual.current?.user.id === uid) avisar('error.servidor')
      return false
    }
    // El RPC pertenece a quien lo inició; una respuesta tardía no debe cerrar otra cuenta.
    if (sesionActual.current?.user.id !== uid) return false
    // La cuenta ya se borró: limpiar también la vista aunque falle la revocación del token local.
    try { await supabase.auth.signOut({ scope: 'local' }) } catch { /* cuenta eliminada */ }
    if (sesionActual.current && sesionActual.current.user.id !== uid) return false
    descartarPendiente()
    setSesion(null)
    setDatos(null)
    avisar('cuenta.borrada')
    return true
  }, [avisar, uid])

  const guardarGustos = useCallback(async (gustos) => {
    if (!uid) return
    const { error } = await supabase.from('perfil').update({ gustos }).eq('id', uid)
    if (!error) setDatos((d) => (d?.uid === uid ? { ...d, perfil: { ...d.perfil, gustos } } : d))
  }, [uid])

  const alternarFavorito = useCallback(async (puntoId) => {
    if (!supabase) { avisar('error.login'); return }
    if (!uid) {                       // sin sesión: se recuerda y se completa al volver (FR-020)
      guardarPendiente(puntoId)
      setPidiendoEntrar(true)
      return
    }
    if (!mios?.favoritos) { avisar('error.servidor'); return false }
    const estaba = mios?.favoritos.has(puntoId) ?? false
    const poner = (dentro) => setDatos((d) => {
      if (d?.uid !== uid || d.revision !== revision) return d
      const favoritos = new Set(d.favoritos)
      if (dentro) favoritos.add(puntoId); else favoritos.delete(puntoId)
      return { ...d, favoritos }
    })
    poner(!estaba)                    // se ve al instante; si la base lo rechaza, se regresa
    try {
      const { error } = estaba
        ? await supabase.from('favorito').delete().eq('punto_id', puntoId).eq('usuario_id', uid)
        : await supabase.from('favorito').upsert({ punto_id: puntoId }, { onConflict: 'usuario_id,punto_id', ignoreDuplicates: true })
      if (error) throw error
      avisar(estaba ? 'favorito.quitado' : 'favorito.agregado')
      return true
    } catch { poner(estaba); avisar('error.servidor'); return false }
  }, [uid, mios, avisar, revision])

  const valor = useMemo(() => ({
    disponible: supabase !== null,
    cargando: !lista || (uid !== null && mios === null),
    errorCuenta: mios?.error ?? false, recargarCuenta,
    sesion, usuario: sesion?.user ?? null,
    perfil: mios?.perfil ?? null,
    favoritos: mios?.favoritos ?? null,
    aviso, avisar, pidiendoEntrar, pedirEntrar, cancelarEntrar,
    entrar, salir, borrarCuenta, guardarGustos, alternarFavorito,
  }), [lista, uid, mios, sesion, aviso, avisar, pidiendoEntrar, pedirEntrar, cancelarEntrar, entrar, salir, borrarCuenta, guardarGustos, alternarFavorito, recargarCuenta])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
