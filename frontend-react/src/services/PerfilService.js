import api from './axiosInstance'

// "Mi perfil": el backend identifica al usuario por el token JWT
const API_URL = '/api/perfil'

export const getPerfil = () => api.get(API_URL)

export const updatePerfil = (datos) => api.put(API_URL, datos)

export const cambiarPassword = (passwordActual, passwordNueva) =>
  api.put(`${API_URL}/password`, { passwordActual, passwordNueva })
