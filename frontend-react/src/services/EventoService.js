import api from './axiosInstance'

// Endpoint base de eventos medicos
const API_URL = '/api/eventos'

export const getEventos = () =>
  api.get(`${API_URL}/list`)

export const getEventoById = (id) =>
  api.get(`${API_URL}/${id}`)

export const getEventosPorMascota = (idMascota) =>
  api.get(`${API_URL}/mascota/${idMascota}`)

export const saveEvento = (evento) =>
  api.post(`${API_URL}/save`, evento)

export const updateEvento = (id, evento) =>
  api.put(`${API_URL}/update/${id}`, evento)

export const deleteEvento = (id) =>
  api.delete(`${API_URL}/delete/${id}`)
