import api from './axiosInstance'

// Endpoint base de tipos de documento
const API_URL = '/api/tipodocumento'

export const getTiposDocumento = () =>
  api.get(`${API_URL}/list`)

export const getTipoDocumentoById = (id) =>
  api.get(`${API_URL}/${id}`)
