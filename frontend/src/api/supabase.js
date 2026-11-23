import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para las cuentas (feature 002): login con Microsoft, gustos, Favoritos y reseñas
// van directo a Supabase; las reglas las pone la base (RLS). Sin las variables de frontend/.env.local
// queda en null y la app funciona como antes, sin cuentas.
const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Cómo llegó la página, leído antes de que supabase-js limpie la URL: con ?code= se vuelve de
// Microsoft con sesión; con error, el inicio de sesión se canceló o falló (FR-007).
const consulta = new URLSearchParams(window.location.search)
const fragmento = new URLSearchParams(window.location.hash.slice(1))
export const regreso = {
  conSesion: consulta.has('code'),
  conError: consulta.has('error') || consulta.has('error_description') || fragmento.has('error'),
}

export const supabase = url && clave
  ? createClient(url, clave, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null

// Token de la sesión actual, para el panel (Authorization: Bearer …). null sin sesión.
export async function tokenActual() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

// Qué aviso mostrar según lo que respondió la base (contracts/supabase-datos.md).
export function claveDeError(error) {
  const mensaje = error?.message ?? ''
  if (mensaje.includes('RN_R1')) return 'error.limiteResenas'
  if (mensaje.includes('RN_R2') || error?.code === '42501') return 'error.sin_permiso'
  if (error?.code === '23514') return 'error.resenaInvalida'
  return 'error.servidor'
}
