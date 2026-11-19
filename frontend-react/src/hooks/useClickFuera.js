import { useEffect } from 'react'

/** Ejecuta "alSalir" cuando se hace clic fuera del elemento referenciado. */
const useClickFuera = (ref, alSalir) => {
  useEffect(() => {
    const manejar = (e) => {
      if (ref.current && !ref.current.contains(e.target)) alSalir()
    }
    document.addEventListener('mousedown', manejar)
    return () => document.removeEventListener('mousedown', manejar)
  }, [ref, alSalir])
}

export default useClickFuera
