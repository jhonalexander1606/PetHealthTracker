import api from './axiosInstance'

// Endpoint base de mascotas
const API_URL = '/api/mascotas'

export const getMascotas = () =>
  api.get(`${API_URL}/list`)

export const getMascotaById = (id) =>
  api.get(`${API_URL}/${id}`)

export const getMascotasPorUsuario = (idUsuario) =>
  api.get(`${API_URL}/usuario/${idUsuario}`)

export const saveMascota = (mascota) =>
  api.post(`${API_URL}/save`, mascota)

export const updateMascota = (id, mascota) =>
  api.put(`${API_URL}/update/${id}`, mascota)

export const deleteMascota = (id) =>
  api.delete(`${API_URL}/delete/${id}`)
