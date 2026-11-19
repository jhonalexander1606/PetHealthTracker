import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import { getPerfil, updatePerfil, cambiarPassword } from '../services/PerfilService'
import { getUsuarioActual } from '../services/AuthService'
import { leerToken, tiempoRestante, formatearDuracion } from '../utils/jwt'
import { exito, mensajeError } from '../utils/notificar'
import CampoPassword from './comunes/CampoPassword'
import Cargando from './comunes/Cargando'

const PERMISOS = [
  { accion: 'Ver panel, mascotas, historial y calendario', ADMIN: true, VETERINARIO: true, DUENO: 'Solo las suyas' },
  { accion: 'Registrar / editar mascotas y eventos medicos', ADMIN: true, VETERINARIO: true, DUENO: 'Solo las suyas' },
  { accion: 'Ver listado de usuarios', ADMIN: true, VETERINARIO: true, DUENO: false },
  { accion: 'Crear, editar y eliminar usuarios', ADMIN: true, VETERINARIO: false, DUENO: false },
  { accion: 'Editar mi perfil y cambiar mi contrasena', ADMIN: true, VETERINARIO: true, DUENO: true }
]

/**
 * "Mi perfil" (cualquier rol).
 *  - Datos de la cuenta (GET /api/perfil).
 *  - Edicion de nombre, correo y telefono (PUT /api/perfil).
 *  - Cambio de contrasena verificando la actual (PUT /api/perfil/password).
 *  - Informacion de la sesion leida del propio token JWT (emision, vencimiento
 *    y cuenta regresiva) y tabla de permisos por rol.
 */
const Perfil = () => {
  const sesion = getUsuarioActual()
  const token = localStorage.getItem('token')
  const datosToken = leerToken(token) || {}

  const [perfil, setPerfil] = useState(null)
  const [totalMascotas, setTotalMascotas] = useState(0)
  const [form, setForm] = useState({ nombreCompleto: '', email: '', telefono: '' })
  const [claves, setClaves] = useState({ actual: '', nueva: '', confirmacion: '' })
  const [guardando, setGuardando] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const [restante, setRestante] = useState(tiempoRestante(token))

  useEffect(() => {
    getPerfil()
      .then((r) => {
        const u = r.data.Usuario
        setPerfil(u)
        setTotalMascotas(r.data.totalMascotas)
        setForm({ nombreCompleto: u.nombreCompleto || '', email: u.email || '', telefono: u.telefono || '' })
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudo cargar el perfil'), 'error'))
  }, [])

  // Cuenta regresiva de la sesion (cada segundo)
  useEffect(() => {
    const t = setInterval(() => setRestante(tiempoRestante(localStorage.getItem('token'))), 1000)
    return () => clearInterval(t)
  }, [])

  const guardarDatos = (e) => {
    e.preventDefault()
    setGuardando(true)
    updatePerfil(form)
      .then((r) => {
        const u = r.data.Usuario
        setPerfil(u)
        // Mantener el nombre actualizado en la barra superior
        localStorage.setItem('usuario', JSON.stringify({ ...sesion, nombreCompleto: u.nombreCompleto }))
        exito('Datos actualizados')
      })
      .catch((err) => Swal.fire('No se pudo guardar', mensajeError(err, 'Error al actualizar'), 'error'))
      .finally(() => setGuardando(false))
  }

  const guardarClave = (e) => {
    e.preventDefault()
    if (claves.nueva.length < 6) return Swal.fire('Contrasena muy corta', 'Use minimo 6 caracteres.', 'warning')
    if (claves.nueva !== claves.confirmacion) return Swal.fire('No coinciden', 'La confirmacion no coincide.', 'warning')
    setCambiando(true)
    cambiarPassword(claves.actual, claves.nueva)
      .then(() => {
        setClaves({ actual: '', nueva: '', confirmacion: '' })
        Swal.fire('Listo', 'Su contrasena fue actualizada. Usela en su proximo inicio de sesion.', 'success')
      })
      .catch((err) => Swal.fire('No se pudo cambiar', mensajeError(err, 'Error al cambiar la contrasena'), 'error'))
      .finally(() => setCambiando(false))
  }

  if (!perfil) return <div className="section-card"><Cargando texto="Cargando perfil..." /></div>

  const iniciales = perfil.nombreCompleto.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  const fechaHora = (seg) => (seg ? new Date(seg * 1000).toLocaleString('es-CO') : '-')
  const porcentajeSesion = datosToken.exp && datosToken.iat
    ? Math.max(0, Math.min(100, (restante / ((datosToken.exp - datosToken.iat) * 1000)) * 100))
    : 0
  const marca = (v) => v === true
    ? <i className="fas fa-check text-success"></i>
    : v === false ? <i className="fas fa-xmark text-danger"></i> : <small className="text-muted">{v}</small>

  return (
    <div className="row g-3">
      <div className="col-lg-4">
        <div className="section-card text-center mb-3">
          <div className={`avatar avatar-lg role-${perfil.rol} mx-auto mb-2`}>{iniciales}</div>
          <h2 className="h5 fw-bold mb-0">{perfil.nombreCompleto}</h2>
          <p className="text-muted mb-2">@{perfil.nombreUsuario}</p>
          <span className={`role-badge role-${perfil.rol}`}>{perfil.rol}</span>
          <hr />
          <div className="d-flex justify-content-around small">
            <div><div className="fs-4 fw-bold text-pet">{totalMascotas}</div>Mascotas</div>
            <div><div className="fs-6 fw-bold mt-2">{perfil.tipoDocumento?.tipo}</div>{perfil.numeroDocumento}</div>
          </div>
        </div>

        <div className="section-card mb-0">
          <h3 className="h6 fw-bold mb-3"><i className="fas fa-shield-halved me-1 text-pet"></i> Sesion actual (JWT)</h3>
          <dl className="datos-sesion small">
            <dt>Iniciada</dt><dd>{fechaHora(datosToken.iat)}</dd>
            <dt>Vence</dt><dd>{fechaHora(datosToken.exp)}</dd>
            <dt>Tiempo restante</dt><dd className="fw-semibold">{formatearDuracion(restante)}</dd>
          </dl>
          <div className="progress mb-2" style={{ height: 6 }} aria-label="Tiempo de sesion restante">
            <div className={`progress-bar ${porcentajeSesion < 10 ? 'bg-danger' : 'bg-success'}`}
                 style={{ width: `${porcentajeSesion}%` }} />
          </div>
          <p className="text-muted small mb-0">
            El token viaja en la cabecera <code>Authorization: Bearer</code> de cada peticion y lo firma
            el backend con HS256. Contiene: <code>{Object.keys(datosToken).join(', ')}</code>.
          </p>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="section-card mb-3">
          <h3 className="h6 fw-bold mb-3"><i className="fas fa-user-pen me-1 text-pet"></i> Datos de contacto</h3>
          <form className="form-pet" onSubmit={guardarDatos}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="pf-nombre">Nombre completo</label>
                <input id="pf-nombre" className="form-control" value={form.nombreCompleto} minLength={3} required
                       onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} />
              </div>
              <div className="col-md-7">
                <label className="form-label" htmlFor="pf-email">Correo electronico</label>
                <input id="pf-email" type="email" className="form-control" value={form.email} required
                       onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-5">
                <label className="form-label" htmlFor="pf-tel">Telefono</label>
                <input id="pf-tel" type="tel" className="form-control" value={form.telefono}
                       onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-pet mt-3" disabled={guardando}>
              {guardando ? <><i className="fas fa-spinner fa-spin me-1"></i> Guardando...</> : <><i className="fas fa-save me-1"></i> Guardar datos</>}
            </button>
          </form>
        </div>

        <div className="section-card mb-3">
          <h3 className="h6 fw-bold mb-3"><i className="fas fa-key me-1 text-pet"></i> Cambiar contrasena</h3>
          <form className="form-pet" onSubmit={guardarClave}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="pf-actual">Contrasena actual</label>
                <CampoPassword id="pf-actual" value={claves.actual} autoComplete="current-password"
                               onChange={(e) => setClaves({ ...claves, actual: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="pf-nueva">Nueva contrasena</label>
                <CampoPassword id="pf-nueva" value={claves.nueva} medidor
                               onChange={(e) => setClaves({ ...claves, nueva: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="pf-conf">Confirmar</label>
                <CampoPassword id="pf-conf" value={claves.confirmacion}
                               invalido={claves.confirmacion && claves.confirmacion !== claves.nueva ? 'No coincide' : undefined}
                               onChange={(e) => setClaves({ ...claves, confirmacion: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-outline-dark mt-3" disabled={cambiando || !claves.actual || !claves.nueva}>
              {cambiando ? <><i className="fas fa-spinner fa-spin me-1"></i> Cambiando...</> : <><i className="fas fa-lock me-1"></i> Cambiar contrasena</>}
            </button>
          </form>
        </div>

        <div className="section-card mb-0">
          <h3 className="h6 fw-bold mb-3"><i className="fas fa-user-lock me-1 text-pet"></i> Permisos por rol</h3>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0 tabla-permisos">
              <thead>
                <tr>
                  <th>Accion</th>
                  {['ADMIN', 'VETERINARIO', 'DUENO'].map((r) => (
                    <th key={r} className={`text-center ${r === perfil.rol ? 'rol-actual' : ''}`}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISOS.map((p) => (
                  <tr key={p.accion}>
                    <td className="small">{p.accion}</td>
                    {['ADMIN', 'VETERINARIO', 'DUENO'].map((r) => (
                      <td key={r} className={`text-center ${r === perfil.rol ? 'rol-actual' : ''}`}>{marca(p[r])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
