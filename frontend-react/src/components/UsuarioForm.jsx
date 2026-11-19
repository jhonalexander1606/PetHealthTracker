import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getUsuarioById, saveUsuario, updateUsuario } from '../services/UsuarioService'
import { getTiposDocumento } from '../services/TipoDocumentoService'
import { getUsuarioActual } from '../services/AuthService'
import { exito, mensajeError } from '../utils/notificar'
import CampoPassword from './comunes/CampoPassword'

const ROLES = [
  { valor: 'DUENO', texto: 'Dueno de mascota', icono: 'fa-house-user', desc: 'Gestiona sus propias mascotas y su historial.' },
  { valor: 'VETERINARIO', texto: 'Veterinario', icono: 'fa-user-doctor', desc: 'Consulta todas las mascotas y registra atenciones.' },
  { valor: 'ADMIN', texto: 'Administrador', icono: 'fa-user-shield', desc: 'Acceso total, incluida la gestion de usuarios.' }
]

/** Mismas reglas que valida el backend (UsuarioService.validarDatos). */
const validar = (u, esEdicion) => {
  const e = {}
  if (!u.tipoDocumento.id) e.tipoDocumento = 'Seleccione el tipo de documento'
  if (!/^[0-9A-Za-z]{5,20}$/.test(u.numeroDocumento.trim())) e.numeroDocumento = 'Entre 5 y 20 caracteres, solo letras y numeros'
  if (u.nombreCompleto.trim().length < 3) e.nombreCompleto = 'Minimo 3 caracteres'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.email.trim())) e.email = 'Correo electronico no valido'
  if (u.telefono && !/^[0-9+ ()-]{7,20}$/.test(u.telefono)) e.telefono = 'Solo numeros, espacios y + ( ) -'
  if (!/^[A-Za-z0-9._]{4,30}$/.test(u.nombreUsuario.trim())) e.nombreUsuario = 'Entre 4 y 30 caracteres: letras, numeros, punto o guion bajo'
  if (!esEdicion && !u.password) e.password = 'La contrasena es obligatoria'
  else if (u.password && u.password.length < 6) e.password = 'Minimo 6 caracteres'
  if (u.password && u.password !== u.confirmacion) e.confirmacion = 'Las contrasenas no coinciden'
  return e
}

/**
 * Formulario de creacion / edicion de usuarios (HU002, HU004). Solo ADMIN.
 * Validacion en vivo, confirmacion de contrasena con medidor de fortaleza y
 * selector visual de rol. Los conflictos (usuario o documento repetido) los
 * detecta el backend y se muestran con su mensaje.
 */
const UsuarioForm = () => {
  const { id } = useParams()
  const esEdicion = !!id
  const navigate = useNavigate()
  const actual = getUsuarioActual()
  const editandoseASiMismo = esEdicion && Number(id) === actual?.idUsuario

  const [usuario, setUsuario] = useState({
    tipoDocumento: { id: 1 },
    numeroDocumento: '',
    nombreCompleto: '',
    email: '',
    telefono: '',
    nombreUsuario: '',
    password: '',
    confirmacion: '',
    rol: 'DUENO'
  })
  const [tiposDoc, setTiposDoc] = useState([])
  const [tocados, setTocados] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    getTiposDocumento()
      .then((response) => setTiposDoc(response.data))
      .catch((err) => console.error('Error cargando tipos de documento:', err))
  }, [])

  useEffect(() => {
    if (!esEdicion) return
    getUsuarioById(id)
      .then((response) => {
        const u = response.data?.Usuario
        if (u) {
          setUsuario({
            tipoDocumento: { id: u.tipoDocumento?.id || '' },
            numeroDocumento: u.numeroDocumento || '',
            nombreCompleto: u.nombreCompleto || '',
            email: u.email || '',
            telefono: u.telefono || '',
            nombreUsuario: u.nombreUsuario || '',
            password: '',
            confirmacion: '',
            rol: u.rol || 'DUENO'
          })
        }
      })
      .catch((e) => {
        Swal.fire('Error', mensajeError(e, 'No se pudo cargar el usuario'), 'error')
        navigate('/usuarios')
      })
  }, [id, esEdicion, navigate])

  const errores = validar(usuario, esEdicion)
  const invalido = (c) => (tocados[c] ? errores[c] : undefined)
  const clase = (c, base = 'form-control') => `${base} ${invalido(c) ? 'is-invalid' : ''}`

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'idTipoDocumento') {
      setUsuario({ ...usuario, tipoDocumento: { id: parseInt(value) || '' } })
    } else {
      setUsuario({ ...usuario, [name]: value })
    }
  }
  const handleBlur = (e) => {
    const campo = e.target.name === 'idTipoDocumento' ? 'tipoDocumento' : e.target.name
    setTocados({ ...tocados, [campo]: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(errores).length > 0) {
      setTocados(Object.fromEntries(Object.keys(errores).map((k) => [k, true])))
      Swal.fire('Revise el formulario', Object.values(errores).join('<br>'), 'warning')
      return
    }

    const { confirmacion, ...payload } = usuario
    payload.numeroDocumento = payload.numeroDocumento.trim()
    payload.nombreUsuario = payload.nombreUsuario.trim()
    payload.email = payload.email.trim()
    if (esEdicion && !payload.password) delete payload.password

    setGuardando(true)
    const promesa = esEdicion ? updateUsuario(id, payload) : saveUsuario(payload)
    promesa
      .then(() => {
        exito(esEdicion ? 'Usuario actualizado' : `Usuario ${payload.nombreUsuario} creado`)
        navigate('/usuarios')
      })
      .catch((err) => Swal.fire('No se pudo guardar', mensajeError(err, 'Error al guardar el usuario'), 'error'))
      .finally(() => setGuardando(false))
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className={`fas ${esEdicion ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
            {esEdicion ? ' Editar Usuario' : ' Nuevo Usuario'}
          </h2>
          <p className="section-subtitle">
            {esEdicion ? 'Modifique los datos del usuario' : 'Complete los datos del nuevo usuario'}
          </p>
        </div>
      </div>

      <form className="form-pet" onSubmit={handleSubmit} noValidate>
        <h3 className="form-seccion"><i className="fas fa-id-card"></i> Identificacion</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="idTipoDocumento">Tipo de Documento <span className="required">*</span></label>
            <select id="idTipoDocumento" name="idTipoDocumento" className={clase('tipoDocumento', 'form-select')}
                    value={usuario.tipoDocumento.id} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Seleccione...</option>
              {tiposDoc.map((t) => <option key={t.id} value={t.id}>{t.tipo}</option>)}
            </select>
            <div className="invalid-feedback">{errores.tipoDocumento}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="numeroDocumento">Numero de Documento <span className="required">*</span></label>
            <input id="numeroDocumento" type="text" name="numeroDocumento" className={clase('numeroDocumento')}
                   value={usuario.numeroDocumento} onChange={handleChange} onBlur={handleBlur} maxLength={20}
                   inputMode="numeric" />
            <div className="invalid-feedback">{errores.numeroDocumento}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="nombreCompleto">Nombre Completo <span className="required">*</span></label>
            <input id="nombreCompleto" type="text" name="nombreCompleto" className={clase('nombreCompleto')}
                   value={usuario.nombreCompleto} onChange={handleChange} onBlur={handleBlur} maxLength={255} />
            <div className="invalid-feedback">{errores.nombreCompleto}</div>
          </div>
        </div>

        <h3 className="form-seccion"><i className="fas fa-address-book"></i> Contacto</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="email">Email <span className="required">*</span></label>
            <input id="email" type="email" name="email" className={clase('email')} value={usuario.email}
                   onChange={handleChange} onBlur={handleBlur} placeholder="nombre@correo.com" />
            <div className="invalid-feedback">{errores.email}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="telefono">Telefono</label>
            <input id="telefono" type="tel" name="telefono" className={clase('telefono')} value={usuario.telefono}
                   onChange={handleChange} onBlur={handleBlur} maxLength={20} placeholder="3001234567" />
            <div className="invalid-feedback">{errores.telefono}</div>
          </div>
        </div>

        <h3 className="form-seccion"><i className="fas fa-key"></i> Acceso al sistema</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="nombreUsuario">Nombre de Usuario <span className="required">*</span></label>
            <div className="input-group has-validation">
              <span className="input-group-text">@</span>
              <input id="nombreUsuario" type="text" name="nombreUsuario" className={clase('nombreUsuario')}
                     value={usuario.nombreUsuario} onChange={handleChange} onBlur={handleBlur} maxLength={30}
                     autoComplete="off" />
              <div className="invalid-feedback">{errores.nombreUsuario}</div>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="password">
              Contrasena {!esEdicion && <span className="required">*</span>}
            </label>
            <CampoPassword id="password" name="password" value={usuario.password} onChange={handleChange}
                           onBlur={handleBlur} invalido={invalido('password')} medidor
                           placeholder={esEdicion ? 'Dejar vacia para no cambiarla' : 'Minimo 6 caracteres'} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="confirmacion">Confirmar contrasena</label>
            <CampoPassword id="confirmacion" name="confirmacion" value={usuario.confirmacion} onChange={handleChange}
                           onBlur={handleBlur} invalido={invalido('confirmacion')} disabled={!usuario.password} />
          </div>

          <div className="col-12">
            <label className="form-label">Rol <span className="required">*</span></label>
            <div className="selector-rol" role="radiogroup">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.valor}
                  role="radio"
                  aria-checked={usuario.rol === r.valor}
                  className={`opcion-rol ${usuario.rol === r.valor ? 'activa' : ''}`}
                  onClick={() => setUsuario({ ...usuario, rol: r.valor })}
                  disabled={editandoseASiMismo && r.valor !== 'ADMIN'}
                >
                  <i className={`fas ${r.icono}`}></i>
                  <span className="fw-semibold">{r.texto}</span>
                  <small>{r.desc}</small>
                </button>
              ))}
            </div>
            {editandoseASiMismo && (
              <div className="form-text">No puede quitarse a si mismo el rol de administrador.</div>
            )}
          </div>
        </div>

        <hr className="mt-4" />
        <div className="d-flex gap-2">
          {/* onMouseDown evita que el campo enfocado pierda el foco antes del clic:
              si no, el mensaje de error que aparece al salir del campo desplaza
              el boton y el clic se pierde. */}
          <button type="submit" className="btn btn-pet" disabled={guardando}
                  onMouseDown={(e) => e.preventDefault()}>
            {guardando
              ? <><i className="fas fa-spinner fa-spin me-1"></i> Guardando...</>
              : <><i className="fas fa-save me-1"></i> {esEdicion ? 'Guardar cambios' : 'Crear usuario'}</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/usuarios')}>
            <i className="fas fa-xmark me-1"></i> Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default UsuarioForm
