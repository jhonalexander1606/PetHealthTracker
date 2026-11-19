import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { cerrarSesion } from '../../services/AuthService'
import { tiempoRestante } from '../../utils/jwt'

const AVISO_MS = 5 * 60 * 1000 // avisar 5 minutos antes

/**
 * Revisa cada 15 segundos cuanto le queda al token JWT.
 *  - 5 minutos antes de vencer: avisa al usuario.
 *  - Al vencer: cierra la sesion y lo lleva al login (en vez de esperar a
 *    que una peticion falle con 401).
 */
const VigilanteSesion = () => {
  const navigate = useNavigate()
  const avisado = useRef(false)

  useEffect(() => {
    const revisar = () => {
      const restante = tiempoRestante(localStorage.getItem('token'))
      if (restante === null) return
      if (restante <= 0) {
        cerrarSesion()
        Swal.fire('Sesion expirada', 'Por seguridad, inicie sesion nuevamente.', 'info')
        navigate('/login', { replace: true })
      } else if (restante <= AVISO_MS && !avisado.current) {
        avisado.current = true
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: `Su sesion vence en ${Math.ceil(restante / 60000)} minutos`,
          text: 'Guarde los cambios pendientes.',
          showConfirmButton: false,
          timer: 8000
        })
      }
    }
    revisar()
    const intervalo = setInterval(revisar, 15000)
    return () => clearInterval(intervalo)
  }, [navigate])

  return null
}

export default VigilanteSesion
