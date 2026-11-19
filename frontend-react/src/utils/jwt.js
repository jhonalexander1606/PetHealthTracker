/**
 * Lectura del contenido (payload) del token JWT.
 *
 * Un JWT tiene 3 partes separadas por puntos: cabecera.payload.firma.
 * El payload es JSON codificado en Base64URL y NO esta cifrado (solo firmado),
 * por eso el frontend puede leerlo para saber cuando vence la sesion.
 * La firma solo la puede verificar el backend con su clave secreta.
 */
export const leerToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Milisegundos que le quedan al token (negativo si ya vencio, null si no se puede leer). */
export const tiempoRestante = (token) => {
  const datos = token ? leerToken(token) : null
  if (!datos?.exp) return null
  return datos.exp * 1000 - Date.now()
}

/** "7 h 59 min", "4 min 10 s" */
export const formatearDuracion = (ms) => {
  if (ms === null || ms <= 0) return 'vencida'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h} h ${m} min`
  return `${m} min ${s % 60} s`
}
