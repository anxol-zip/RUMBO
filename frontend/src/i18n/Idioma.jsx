import { useEffect, useMemo, useState } from 'react'
import { Contexto, crearT } from './contexto.js'

// Idioma de la interfaz (español o inglés). Se recuerda en este navegador; la primera vez
// se toma del idioma del celular, para que un turista extranjero vea inglés desde el inicio.
const CLAVE = 'rumbo:idioma'

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'es' || guardado === 'en') return guardado
  } catch { /* sin almacenamiento (ventana privada): se usa el del navegador */ }
  return (navigator.language ?? 'es').toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function ProveedorIdioma({ children }) {
  const [idioma, setIdioma] = useState(idiomaInicial)
  useEffect(() => {
    document.documentElement.lang = idioma
    try { localStorage.setItem(CLAVE, idioma) } catch { /* sin almacenamiento */ }
  }, [idioma])
  const valor = useMemo(() => ({ idioma, setIdioma, t: crearT(idioma) }), [idioma])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
