import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getMascotaById, saveMascota, updateMascota } from '../services/MascotaService'
import { getUsuarios } from '../services/UsuarioService'
import { esDueno, getUsuarioActual } from '../services/AuthService'
import { exito, mensajeError } from '../utils/notificar'
import { iconoEspecie } from './MascotaList'

const VACIA = {
  usuario: { id: '' },
  nombre: '',
  especie: '',
  raza: '',
  edad: '',
  sexo: '',
  peso: '',
  color: ''
}

/** Mismas reglas que valida el backend (MascotaService.validar). */
const validar = (m) => {
  const errores = {}
  if (!m.usuario.id) errores.usuario = 'Seleccione el dueno'
  if (!m.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  if (!m.especie) errores.especie = 'Seleccione la especie'
  if (m.edad === '' || m.edad < 0 || m.edad > 40) errores.edad = 'Edad entre 0 y 40 anos'
  if (m.peso !== '' && (Number(m.peso) <= 0 || Number(m.peso) > 200)) errores.peso = 'Peso entre 0.01 y 200 kg'
  return errores
}

/**
 * Formulario de creacion / edicion de mascotas (HU006).
 * - Validacion en vivo (los campos se marcan en rojo al salir de ellos).
 * - Un DUENO solo puede registrar mascotas a su propio nombre.
 * - Al crear, lleva directamente al pasaporte sanitario de la nueva mascota.
 */
const MascotaForm = () => {
  const { id } = useParams()
  const esEdicion = !!id
  const navigate = useNavigate()
  const usuarioActual = getUsuarioActual()
  const soloMias = esDueno()

  const [mascota, setMascota] = useState(
    soloMias ? { ...VACIA, usuario: { id: usuarioActual.idUsuario } } : VACIA
  )
  const [usuarios, setUsuarios] = useState([])
  const [tocados, setTocados] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(esEdicion)

  useEffect(() => {
    getUsuarios()
      .then((response) => setUsuarios(response.data))
      .catch((err) => console.error('Error cargando usuarios:', err))
  }, [])

  useEffect(() => {
    if (!esEdicion) return
    getMascotaById(id)
      .then((response) => {
        const m = response.data?.Mascota
        if (m) {
          setMascota({
            usuario: { id: m.usuario?.id || '' },
            nombre: m.nombre || '',
            especie: m.especie || '',
            raza: m.raza || '',
            edad: m.edad ?? '',
            sexo: m.sexo || '',
            peso: m.peso ?? '',
            color: m.color || ''
          })
        }
      })
      .catch((e) => {
        Swal.fire('Error', mensajeError(e, 'No se pudo cargar la mascota'), 'error')
        navigate('/mascotas')
      })
      .finally(() => setCargando(false))
  }, [id, esEdicion, navigate])

  const errores = validar(mascota)
  const invalido = (campo) => tocados[campo] && errores[campo]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'idUsuario') {
      setMascota({ ...mascota, usuario: { id: parseInt(value) || '' } })
    } else {
      setMascota({ ...mascota, [name]: value })
    }
  }

  const handleBlur = (e) => {
    const campo = e.target.name === 'idUsuario' ? 'usuario' : e.target.name
    setTocados({ ...tocados, [campo]: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(errores).length > 0) {
      setTocados({ usuario: true, nombre: true, especie: true, edad: true, peso: true })
      Swal.fire('Revise el formulario', Object.values(errores).join('<br>'), 'warning')
      return
    }

    const payload = {
      ...mascota,
      nombre: mascota.nombre.trim(),
      edad: parseInt(mascota.edad),
      peso: mascota.peso === '' ? null : parseFloat(mascota.peso)
    }

    setGuardando(true)
    const promesa = esEdicion ? updateMascota(id, payload) : saveMascota(payload)
    promesa
      .then((r) => {
        exito(esEdicion ? 'Mascota actualizada' : `${payload.nombre} fue registrada`)
        const nueva = r.data?.Mascota
        navigate(!esEdicion && nueva?.id ? `/mascotas/${nueva.id}/pasaporte` : '/mascotas')
      })
      .catch((err) => Swal.fire('Error', mensajeError(err, 'No se pudo guardar la mascota'), 'error'))
      .finally(() => setGuardando(false))
  }

  const clase = (campo, base = 'form-control') => `${base} ${invalido(campo) ? 'is-invalid' : ''}`

  if (cargando) {
    return <div className="section-card"><p className="text-muted mb-0"><i className="fas fa-spinner fa-spin me-1"></i> Cargando mascota...</p></div>
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className={`fas ${iconoEspecie(mascota.especie)}`}></i>
            {esEdicion ? ` Editar a ${mascota.nombre || 'la mascota'}` : ' Nueva Mascota'}
          </h2>
          <p className="section-subtitle">Ficha sanitaria basica (HU006). Los campos con * son obligatorios.</p>
        </div>
      </div>

      <form className="form-pet" onSubmit={handleSubmit} noValidate>
        <h3 className="form-seccion"><i className="fas fa-user"></i> Dueno</h3>
        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="idUsuario">Dueno (Usuario) <span className="required">*</span></label>
            <select
              id="idUsuario"
              name="idUsuario"
              className={clase('usuario', 'form-select')}
              value={mascota.usuario.id}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={soloMias}
            >
              <option value="">Seleccione...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombreCompleto} ({u.numeroDocumento})
                </option>
              ))}
            </select>
            {soloMias && <div className="form-text">Como dueno, la mascota queda registrada a tu nombre.</div>}
            <div className="invalid-feedback">{errores.usuario}</div>
          </div>
        </div>

        <h3 className="form-seccion"><i className="fas fa-paw"></i> Datos de la mascota</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="nombre">Nombre <span className="required">*</span></label>
            <input id="nombre" type="text" name="nombre" className={clase('nombre')}
                   value={mascota.nombre} onChange={handleChange} onBlur={handleBlur} maxLength={100}
                   placeholder="Ej: Rocky" />
            <div className="invalid-feedback">{errores.nombre}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Especie <span className="required">*</span></label>
            <div className={`selector-especie ${invalido('especie') ? 'is-invalid' : ''}`} role="radiogroup">
              {['Perro', 'Gato', 'Ave', 'Conejo', 'Otro'].map((esp) => (
                <button
                  type="button"
                  key={esp}
                  role="radio"
                  aria-checked={mascota.especie === esp}
                  className={`opcion-especie ${mascota.especie === esp ? 'activa' : ''}`}
                  onClick={() => { setMascota({ ...mascota, especie: esp }); setTocados({ ...tocados, especie: true }) }}
                >
                  <i className={`fas ${iconoEspecie(esp)}`}></i>
                  <span>{esp}</span>
                </button>
              ))}
            </div>
            {invalido('especie') && <div className="text-danger small mt-1">{errores.especie}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="raza">Raza</label>
            <input id="raza" type="text" name="raza" className="form-control" value={mascota.raza}
                   onChange={handleChange} maxLength={100} placeholder="Ej: Labrador" />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="color">Color</label>
            <input id="color" type="text" name="color" className="form-control" value={mascota.color}
                   onChange={handleChange} maxLength={50} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="sexo">Sexo</label>
            <select id="sexo" name="sexo" className="form-select" value={mascota.sexo} onChange={handleChange}>
              <option value="">Sin especificar</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="edad">Edad (anos) <span className="required">*</span></label>
            <input id="edad" type="number" name="edad" className={clase('edad')} value={mascota.edad}
                   onChange={handleChange} onBlur={handleBlur} min={0} max={40} />
            <div className="invalid-feedback">{errores.edad}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="peso">Peso</label>
            <div className="input-group has-validation">
              <input id="peso" type="number" step="0.01" name="peso" className={clase('peso')}
                     value={mascota.peso} onChange={handleChange} onBlur={handleBlur} min={0} max={200} />
              <span className="input-group-text">kg</span>
              <div className="invalid-feedback">{errores.peso}</div>
            </div>
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
              : <><i className="fas fa-save me-1"></i> {esEdicion ? 'Guardar cambios' : 'Registrar mascota'}</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-xmark me-1"></i> Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default MascotaForm
