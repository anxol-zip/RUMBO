import { useCallback, useEffect, useMemo, useState } from 'react'
import { COLORES, CONTRASTES, Contexto, TAMANOS, VOCES } from './contexto.js'

// Preferencias para ver mejor: tamaño de letra, colores del semáforo, contraste y velocidad de la
// voz. Se recuerdan en este dispositivo, sin cuenta (igual que el idioma). Las visuales se aplican
// como atributos de <html> (data-letra, data-colores y data-contraste) y el CSS hace el resto.
const CLAVE = 'rumbo:preferencias'
// La guía de primer uso se abre una sola vez; después, desde "Ver mejor".
const CLAVE_GUIA = 'rumbo:guia-vista'
// Si el sistema ya pide más contraste (prefers-contrast), la app arranca en contraste alto.
const pideContraste = () => window.matchMedia?.('(prefers-contrast: more)').matches
const INICIALES = { letra: 'normal', colores: 'habituales', contraste: 'normal', voz: 'normal' }

function leerGuardadas() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE)) ?? {}
    return {
      letra: TAMANOS.includes(guardadas.letra) ? guardadas.letra : INICIALES.letra,
      colores: COLORES.includes(guardadas.colores) ? guardadas.colores : INICIALES.colores,
      contraste: CONTRASTES.includes(guardadas.contraste) ? guardadas.contraste : (pideContraste() ? 'alto' : 'normal'),
      voz: VOCES.includes(guardadas.voz) ? guardadas.voz : INICIALES.voz,
    }
  } catch {
    return { ...INICIALES, contraste: pideContraste() ? 'alto' : 'normal' }   // sin almacenamiento o dato dañado
  }
}

function guiaPendiente() {
  try { return localStorage.getItem(CLAVE_GUIA) === null } catch { return true }
}

function aplicar({ letra, colores, contraste }) {
  document.documentElement.dataset.letra = letra
  document.documentElement.dataset.colores = colores
  document.documentElement.dataset.contraste = contraste
}

export function ProveedorPreferencias({ children }) {
  // Se aplican desde el primer render, para que la página no aparezca un instante con letra normal.
  const [preferencias, setPreferencias] = useState(() => {
    const guardadas = leerGuardadas()
    aplicar(guardadas)
    return guardadas
  })

  useEffect(() => {
    aplicar(preferencias)
    try { localStorage.setItem(CLAVE, JSON.stringify(preferencias)) } catch { /* sin almacenamiento */ }
  }, [preferencias])

  const [guiaAbierta, setGuiaAbierta] = useState(guiaPendiente)
  const abrirGuia = useCallback(() => setGuiaAbierta(true), [])
  const cerrarGuia = useCallback(() => {
    setGuiaAbierta(false)
    try { localStorage.setItem(CLAVE_GUIA, '1') } catch { /* sin almacenamiento */ }
  }, [])

  const valor = useMemo(() => ({
    ...preferencias,
    setLetra: (letra) => setPreferencias((p) => ({ ...p, letra })),
    setColores: (colores) => setPreferencias((p) => ({ ...p, colores })),
    setContraste: (contraste) => setPreferencias((p) => ({ ...p, contraste })),
    setVoz: (voz) => setPreferencias((p) => ({ ...p, voz })),
    guiaAbierta,
    abrirGuia,
    cerrarGuia,
  }), [preferencias, guiaAbierta, abrirGuia, cerrarGuia])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
