import axios from 'axios'

// URL base del backend Spring Boot (se lee de .env).
// Si VITE_API_URL esta vacia, las peticiones van al mismo servidor de Vite
// ("/api/...") y el proxy de vite.config.js las reenvia a localhost:8094.
// Asi la app funciona igual en local y publicada con un tunel (Cloudflare).
const API_URL = import.meta.env.VITE_API_URL ?? ''

// Instancia de Axios con la URL base ya configurada.
// Todos los services la reusan para no repetir la URL en cada peticion.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// INTERCEPTOR DE PETICIONES:
// Antes de cada llamada, si hay un token JWT guardado en localStorage,
// lo agrega automaticamente en la cabecera "Authorization: Bearer <token>".
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// INTERCEPTOR DE RESPUESTAS:
// Si el backend responde 401 (token invalido o vencido), cerramos la sesion
// y redirigimos al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      // Solo redirigir si no estamos ya en /login para evitar loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
