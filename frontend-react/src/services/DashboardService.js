import api from './axiosInstance'

// Estadisticas del panel principal (endpoint nuevo del backend)
export const getResumen = () => api.get('/api/dashboard/resumen')
