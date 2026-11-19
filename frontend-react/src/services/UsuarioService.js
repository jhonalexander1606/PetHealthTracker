import api from './axiosInstance'

// Endpoint base de usuarios
const API_URL = '/api/usuarios'

// ========== CRUD de Usuarios (siguiendo el patron del profe) ==========

export const getUsuarios = () =>
  api.get(`${API_URL}/list`)

export const getUsuarioById = (id) =>
  api.get(`${API_URL}/${id}`)

export const getUsuarioByCedula = (numeroDocumento) =>
  api.get(`${API_URL}/cedula/${numeroDocumento}`)

export const saveUsuario = (usuario) =>
  api.post(`${API_URL}/save`, usuario)

export const updateUsuario = (id, usuario) =>
  api.put(`${API_URL}/update/${id}`, usuario)

export const deleteUsuario = (id) =>
  api.delete(`${API_URL}/delete/${id}`)
