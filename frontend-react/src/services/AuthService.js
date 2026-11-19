import api from './axiosInstance'

// Endpoint base de autenticacion
const AUTH_URL = '/api/auth'

/**
 * Inicia sesion contra el backend Spring Boot.
 * El backend responde con { token, idUsuario, nombreUsuario, nombreCompleto, rol }
 * y a partir de ese momento todas las peticiones llevan el JWT en la cabecera.
 */
export const login = (credenciales) =>
  api.post(`${AUTH_URL}/login`, credenciales)

/**
 * Guarda el usuario y el token en localStorage (sesion persistente).
 */
export const guardarSesion = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('usuario', JSON.stringify({
    idUsuario: data.idUsuario,
    nombreUsuario: data.nombreUsuario,
    nombreCompleto: data.nombreCompleto,
    rol: data.rol
  }))
}

/**
 * Elimina la sesion (logout).
 */
export const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

/**
 * Devuelve el usuario actual (o null si no hay sesion).
 */
export const getUsuarioActual = () => {
  const raw = localStorage.getItem('usuario')
  return raw ? JSON.parse(raw) : null
}

/**
 * Indica si hay un usuario autenticado.
 */
export const estaAutenticado = () => {
  return !!localStorage.getItem('token')
}

/**
 * Indica si el usuario logueado tiene alguno de los roles indicados.
 * Ej: tieneRol('ADMIN', 'VETERINARIO')
 */
export const tieneRol = (...roles) => {
  const usuario = getUsuarioActual()
  return !!usuario && roles.includes(usuario.rol)
}

/** Los duenos solo ven sus propias mascotas e historial (RNF-03). */
export const esDueno = () => getUsuarioActual()?.rol === 'DUENO'
