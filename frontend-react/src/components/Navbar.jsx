import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { cerrarSesion, getUsuarioActual, tieneRol } from '../services/AuthService'
import { getResumen } from '../services/DashboardService'
import { aplicarTema, temaGuardado } from '../utils/tema'
import { formatearFecha, textoRelativo } from '../utils/fechas'
import useClickFuera from '../hooks/useClickFuera'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8094'

/**
 * Barra de navegacion comun a todas las paginas privadas.
 *  - Menu adaptado al rol (los duenos no ven la gestion de usuarios).
 *  - Campana de alertas de vacunacion (se actualiza al cambiar de pagina).
 *  - Cambio de tema claro / oscuro.
 *  - Menu del usuario: perfil, API y cerrar sesion.
 *  - Menu colapsable en celulares (controlado con estado de React).
 */
const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = getUsuarioActual()

  const [abierto, setAbierto] = useState(false)       // menu movil
  const [menu, setMenu] = useState(null)              // 'alertas' | 'usuario' | null
  const [alertas, setAlertas] = useState([])
  const [tema, setTema] = useState(temaGuardado())

  const refAlertas = useRef(null)
  const refUsuario = useRef(null)
  const cerrarMenus = useCallback(() => setMenu(null), [])
  useClickFuera(refAlertas, menu === 'alertas' ? cerrarMenus : () => {})
  useClickFuera(refUsuario, menu === 'usuario' ? cerrarMenus : () => {})

  // Recargar alertas cada vez que se navega (ej. despues de registrar una vacuna)
  useEffect(() => {
    setAbierto(false)
    setMenu(null)
    getResumen()
      .then((r) => setAlertas(r.data?.alertas || []))
      .catch(() => setAlertas([]))
  }, [location.pathname])

  const cambiarTema = () => {
    const nuevo = tema === 'dark' ? 'light' : 'dark'
    aplicarTema(nuevo)
    setTema(nuevo)
  }

  const handleLogout = () => {
    setMenu(null)
    Swal.fire({
      title: 'Cerrar sesion?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a085'
    }).then((result) => {
      if (result.isConfirmed) {
        cerrarSesion()
        navigate('/login')
      }
    })
  }

  const vencidas = alertas.filter((a) => a.estado === 'VENCIDA').length
  const iniciales = (usuario?.nombreCompleto || '?')
    .split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  return (
    <nav className="navbar navbar-expand-lg navbar-pet no-print">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-heart-pulse me-2"></i>
          PetHealth Tracker
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <i className={`fas ${abierto ? 'fa-xmark' : 'fa-bars'} text-white`}></i>
        </button>

        <div className={`collapse navbar-collapse ${abierto ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                <i className="fas fa-gauge-high me-1"></i> Panel
              </NavLink>
            </li>
            {tieneRol('ADMIN', 'VETERINARIO') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/usuarios">
                  <i className="fas fa-users me-1"></i> Usuarios
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink className="nav-link" to="/mascotas">
                <i className="fas fa-paw me-1"></i> {tieneRol('DUENO') ? 'Mis Mascotas' : 'Mascotas'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/eventos">
                <i className="fas fa-notes-medical me-1"></i> Historial Medico
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/calendario">
                <i className="fas fa-calendar-days me-1"></i> Calendario
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 nav-acciones">
            {/* Tema */}
            <button className="btn-icono" onClick={cambiarTema} title="Cambiar tema" aria-label="Cambiar tema">
              <i className={`fas ${tema === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {/* Alertas */}
            <div className="position-relative" ref={refAlertas}>
              <button
                className="btn-icono"
                onClick={() => setMenu(menu === 'alertas' ? null : 'alertas')}
                title="Alertas de vacunacion"
                aria-label={`Alertas de vacunacion: ${alertas.length}`}
              >
                <i className="fas fa-bell"></i>
                {alertas.length > 0 && (
                  <span className={`contador ${vencidas > 0 ? 'rojo' : ''}`}>{alertas.length}</span>
                )}
              </button>
              {menu === 'alertas' && (
                <div className="desplegable desplegable-alertas">
                  <div className="desplegable-titulo">
                    <i className="fas fa-syringe me-1"></i> Dosis vencidas y proximas (30 dias)
                  </div>
                  {alertas.length === 0 ? (
                    <div className="p-3 text-center text-muted small">
                      <i className="fas fa-circle-check text-success d-block fs-3 mb-1"></i>
                      Todo al dia. No hay dosis pendientes.
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0 lista-alertas">
                      {alertas.slice(0, 8).map((a) => (
                        <li key={a.idEvento}>
                          <button onClick={() => navigate(`/mascotas/${a.idMascota}/pasaporte`)}>
                            <span className={`punto ${a.estado === 'VENCIDA' ? 'rojo' : 'naranja'}`} />
                            <span className="flex-grow-1 text-start">
                              <strong>{a.mascota}</strong> &middot; {a.tipoEvento.toLowerCase()}
                              <small className="d-block text-muted">
                                {a.estado === 'VENCIDA' ? 'Vencio ' : 'Vence '}
                                {textoRelativo(a.diasRestantes)} ({formatearFecha(a.fechaProximaDosis)})
                              </small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to="/" className="desplegable-pie">Ver panel completo</Link>
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="position-relative" ref={refUsuario}>
              <button
                className="btn-usuario"
                onClick={() => setMenu(menu === 'usuario' ? null : 'usuario')}
                aria-label="Menu de usuario"
              >
                <span className="avatar">{iniciales}</span>
                <span className="d-none d-xl-inline text-start lh-sm">
                  <span className="d-block small fw-semibold">{usuario?.nombreCompleto}</span>
                  <span className={`role-badge role-${usuario?.rol}`}>{usuario?.rol}</span>
                </span>
                <i className="fas fa-chevron-down small"></i>
              </button>
              {menu === 'usuario' && (
                <div className="desplegable desplegable-usuario">
                  <div className="desplegable-titulo">
                    {usuario?.nombreCompleto}
                    <small className="d-block text-muted">@{usuario?.nombreUsuario}</small>
                  </div>
                  <Link className="desplegable-item" to="/perfil">
                    <i className="fas fa-id-badge"></i> Mi perfil
                  </Link>
                  <a className="desplegable-item" href={`${API_URL}/swagger-ui.html`} target="_blank" rel="noreferrer">
                    <i className="fas fa-code"></i> Documentacion API
                  </a>
                  <button className="desplegable-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-right-from-bracket"></i> Cerrar sesion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
