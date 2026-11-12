import { createContext, useContext } from 'react'

// Cuenta del turista (feature 002). El proveedor está en Cuenta.jsx.
export const Contexto = createContext(null)
export const useCuenta = () => useContext(Contexto)
