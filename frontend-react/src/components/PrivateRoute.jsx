import { Navigate } from 'react-router-dom'
import { estaAutenticado } from '../services/AuthService'

/**
 * Componente que envuelve las rutas privadas.
 * Si no hay token JWT en localStorage, redirige al login.
 */
const PrivateRoute = ({ children }) => {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default PrivateRoute
