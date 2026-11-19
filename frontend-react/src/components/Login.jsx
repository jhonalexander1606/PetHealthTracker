import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { login, guardarSesion, estaAutenticado } from '../services/AuthService'
import { exito, mensajeError } from '../utils/notificar'

const CLAVE_RECORDAR = 'pethealth-recordar-usuario'

// Cuentas de prueba del script SQL (para la demostracion en clase)
const DEMOS = [
  { usuario: 'admininicial', clave: 'admin123456', rol: 'ADMIN', icono: 'fa-user-shield' },
  { usuario: 'davidmunoz', clave: '123456', rol: 'VETERINARIO', icono: 'fa-user-doctor' },
  { usuario: 'jhoncalderon', clave: '123456', rol: 'DUENO', icono: 'fa-house-user' }
]

/**
 * Pantalla de inicio de sesion (HU001).
 * Consume POST /api/auth/login del backend Spring Boot y guarda el JWT.
 * Incluye: mostrar/ocultar contrasena, "recordar usuario" y accesos de
 * demostracion por rol.
 */
const Login = () => {
  const navigate = useNavigate()

  const recordado = (() => { try { return localStorage.getItem(CLAVE_RECORDAR) || '' } catch { return '' } })()
  const [credenciales, setCredenciales] = useState({ nombreUsuario: recordado, password: '' })
  const [recordar, setRecordar] = useState(!!recordado)
  const [verClave, setVerClave] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Si ya hay sesion activa, saltar directo al panel
  useEffect(() => {
    if (estaAutenticado()) navigate('/')
  }, [navigate])

  const handleChange = (e) => {
    setError('')
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value })
  }

  const ingresar = async (datos) => {
    if (!datos.nombreUsuario || !datos.password) {
      setError('Ingrese usuario y contrasena')
      return
    }
    setCargando(true)
    try {
      const respuesta = await login(datos)
      guardarSesion(respuesta.data)
      try {
        if (recordar) localStorage.setItem(CLAVE_RECORDAR, datos.nombreUsuario)
        else localStorage.removeItem(CLAVE_RECORDAR)
      } catch { /* ignorar */ }
      exito(`Bienvenido, ${respuesta.data.nombreCompleto.split(' ')[0]}`)
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) setError('Usuario o contrasena incorrectos')
      else Swal.fire('Error de acceso', mensajeError(err, 'No se pudo iniciar sesion'), 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    ingresar(credenciales)
  }

  const usarDemo = (d) => {
    const datos = { nombreUsuario: d.usuario, password: d.clave }
    setCredenciales(datos)
    ingresar(datos)
  }

  return (
    <div className="login-page">
      <div className="login-contenedor">
        <section className="login-hero">
          <div className="login-brand"><i className="fas fa-heart-pulse"></i></div>
          <h1>PetHealth Tracker</h1>
          <p className="lead">Pasaporte Sanitario Digital y control del historial medico de tus mascotas.</p>
          <ul className="login-beneficios">
            <li><i className="fas fa-passport"></i> Pasaporte con codigo QR e impresion en PDF</li>
            <li><i className="fas fa-bell"></i> Alertas de vacunas vencidas y proximas</li>
            <li><i className="fas fa-calendar-days"></i> Calendario de vacunacion</li>
            <li><i className="fas fa-shield-halved"></i> Acceso seguro con JWT y roles</li>
          </ul>
        </section>

        <section className="login-card">
          <h2 className="login-title">Iniciar sesion</h2>
          <p className="login-subtitle">Ingrese con su usuario del sistema</p>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="fas fa-circle-exclamation me-1"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3 text-start">
              <label className="form-label" htmlFor="nombreUsuario">
                <i className="fas fa-user me-1"></i> Usuario
              </label>
              <input id="nombreUsuario" type="text" name="nombreUsuario" className="form-control"
                     value={credenciales.nombreUsuario} onChange={handleChange}
                     autoComplete="username" autoFocus={!recordado} disabled={cargando} />
            </div>

            <div className="mb-2 text-start">
              <label className="form-label" htmlFor="password">
                <i className="fas fa-lock me-1"></i> Contrasena
              </label>
              <div className="input-group">
                <input id="password" type={verClave ? 'text' : 'password'} name="password" className="form-control"
                       value={credenciales.password} onChange={handleChange}
                       autoComplete="current-password" autoFocus={!!recordado} disabled={cargando} />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setVerClave(!verClave)}
                        aria-label={verClave ? 'Ocultar contrasena' : 'Mostrar contrasena'} tabIndex={-1}>
                  <i className={`fas ${verClave ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-check text-start mb-3">
              <input id="recordar" type="checkbox" className="form-check-input" checked={recordar}
                     onChange={(e) => setRecordar(e.target.checked)} />
              <label className="form-check-label small" htmlFor="recordar">Recordar mi usuario</label>
            </div>

            <button type="submit" className="btn btn-pet w-100 py-2" disabled={cargando}>
              {cargando
                ? <><i className="fas fa-spinner fa-spin me-1"></i> Ingresando...</>
                : <><i className="fas fa-right-to-bracket me-1"></i> Ingresar</>}
            </button>
          </form>

          <div className="login-demos">
            <p className="small text-muted mb-2">Acceso rapido de demostracion</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              {DEMOS.map((d) => (
                <button key={d.usuario} type="button" className={`btn btn-sm demo-btn role-borde-${d.rol}`}
                        onClick={() => usarDemo(d)} disabled={cargando} title={`${d.usuario} / ${d.clave}`}>
                  <i className={`fas ${d.icono} me-1`}></i>{d.rol}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <p className="login-pie">
        Universidad Industrial de Santander &middot; Entornos de Programacion 2026-II &middot; Grupo 02
      </p>
    </div>
  )
}

export default Login
