import { Navigate } from 'react-router-dom'
import { getUsuarioActual } from '../../services/AuthService'

/**
 * Protege una ruta por rol. Si el usuario no tiene uno de los roles
 * permitidos, lo devuelve al inicio. (El backend igual lo bloquearia con
 * 403; esto evita mostrar pantallas que no puede usar.)
 */
const RequiereRol = ({ roles, children }) => {
  const usuario = getUsuarioActual()
  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default RequiereRol
