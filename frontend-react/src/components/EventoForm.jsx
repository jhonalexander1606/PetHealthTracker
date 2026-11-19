import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getEventoById, saveEvento, updateEvento } from '../services/EventoService'
import { getMascotas, getMascotasPorUsuario } from '../services/MascotaService'
import { esDueno, getUsuarioActual } from '../services/AuthService'
import { DIAS_REFUERZO, aTexto, formatearFecha, hoyTexto, sumarDias } from '../utils/fechas'
import { exito, mensajeError } from '../utils/notificar'

const TIPOS = [
  { valor: 'VACUNA ANTIRRABICA', texto: 'Vacuna antirrabica' },
  { valor: 'VACUNA TRIPLE FELINA', texto: 'Vacuna triple felina' },
  { valor: 'VACUNA POLIVALENTE', texto: 'Vacuna polivalente' },
  { valor: 'DESPARASITACION', texto: 'Desparasitacion' },
  { valor: 'CONSULTA GENERAL', texto: 'Consulta general' },
  { valor: 'CIRUGIA', texto: 'Cirugia' },
  { valor: 'ESTERILIZACION', texto: 'Esterilizacion' },
  { valor: 'OTRO', texto: 'Otro' }
]

/** Mismas reglas que valida el backend (EventoMedicoService.validar). */
const validar = (e) => {
  const errores = {}
  if (!e.mascota.id) errores.mascota = 'Seleccione la mascota'
  if (!e.tipoEvento) errores.tipoEvento = 'Seleccione el tipo de evento'
  if (!e.fechaAplicacion) errores.fechaAplicacion = 'La fecha de aplicacion es obligatoria'
  else if (e.fechaAplicacion > hoyTexto()) errores.fechaAplicacion = 'No puede ser una fecha futura'
  if (e.fechaProximaDosis && e.fechaAplicacion && e.fechaProximaDosis <= e.fechaAplicacion) {
    errores.fechaProximaDosis = 'Debe ser posterior a la fecha de aplicacion'
  }
  return errores
}

/**
 * Formulario de creacion / edicion de eventos medicos (HU007).
 *
 * Mejoras de usabilidad:
 *  - Se puede abrir con la mascota y el tipo ya elegidos:
 *    /eventos/crear?mascota=3&tipo=VACUNA%20ANTIRRABICA (desde el pasaporte o las alertas).
 *  - Sugiere la fecha de proxima dosis segun el protocolo del tipo de evento
 *    (vacunas: 1 ano; desparasitacion: 3 meses).
 *  - Validacion de fechas en vivo, igual a la del backend.
 */
const EventoForm = () => {
  const { id } = useParams()
  const [params] = useSearchParams()
  const esEdicion = !!id
  const navigate = useNavigate()
  const usuario = getUsuarioActual()

  const [evento, setEvento] = useState({
    mascota: { id: params.get('mascota') ? parseInt(params.get('mascota')) : '' },
    tipoEvento: params.get('tipo') || '',
    fechaAplicacion: esEdicion ? '' : hoyTexto(),
    fechaProximaDosis: '',
    veterinariaClinica: '',
    veterinario: '',
    notasDiagnostico: ''
  })
  const [mascotas, setMascotas] = useState([])
  const [tocados, setTocados] = useState({})
  const [proximaManual, setProximaManual] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const pedir = esDueno()
      ? getMascotasPorUsuario(usuario.idUsuario).then((r) => r.data?.Mascotas || [])
      : getMascotas().then((r) => r.data)
    pedir
      .then((lista) => setMascotas([...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))))
      .catch((err) => console.error('Error cargando mascotas:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!esEdicion) return
    getEventoById(id)
      .then((response) => {
        const e = response.data?.EventoMedico
        if (e) {
          setEvento({
            mascota: { id: e.mascota?.id || '' },
            tipoEvento: e.tipoEvento || '',
            fechaAplicacion: e.fechaAplicacion || '',
            fechaProximaDosis: e.fechaProximaDosis || '',
            veterinariaClinica: e.veterinariaClinica || '',
            veterinario: e.veterinario || '',
            notasDiagnostico: e.notasDiagnostico || ''
          })
        }
      })
      .catch((e) => {
        Swal.fire('Error', mensajeError(e, 'No se pudo cargar el evento'), 'error')
        navigate('/eventos')
      })
  }, [id, esEdicion, navigate])

  // Sugerencia automatica de la proxima dosis (solo si el usuario no la escribio a mano)
  const sugerencia = (tipo, aplicacion) =>
    DIAS_REFUERZO[tipo] && aplicacion ? aTexto(sumarDias(aplicacion, DIAS_REFUERZO[tipo])) : ''

  useEffect(() => {
    if (proximaManual) return
    setEvento((ev) => ({ ...ev, fechaProximaDosis: sugerencia(ev.tipoEvento, ev.fechaAplicacion) }))
  }, [evento.tipoEvento, evento.fechaAplicacion, proximaManual])

  const errores = validar(evento)
  const invalido = (campo) => tocados[campo] && errores[campo]
  const clase = (campo, base = 'form-control') => `${base} ${invalido(campo) ? 'is-invalid' : ''}`

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'idMascota') {
      setEvento({ ...evento, mascota: { id: parseInt(value) || '' } })
    } else {
      if (name === 'fechaProximaDosis') setProximaManual(true)
      setEvento({ ...evento, [name]: value })
    }
  }

  const handleBlur = (e) => {
    const campo = e.target.name === 'idMascota' ? 'mascota' : e.target.name
    setTocados({ ...tocados, [campo]: true })
  }

  const usarSugerencia = () => {
    setProximaManual(false)
    setEvento({ ...evento, fechaProximaDosis: sugerencia(evento.tipoEvento, evento.fechaAplicacion) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(errores).length > 0) {
      setTocados({ mascota: true, tipoEvento: true, fechaAplicacion: true, fechaProximaDosis: true })
      Swal.fire('Revise el formulario', Object.values(errores).join('<br>'), 'warning')
      return
    }

    const payload = { ...evento, fechaProximaDosis: evento.fechaProximaDosis || null }
    setGuardando(true)
    const promesa = esEdicion ? updateEvento(id, payload) : saveEvento(payload)
    promesa
      .then(() => {
        exito(esEdicion ? 'Evento actualizado' : 'Evento registrado en el historial')
        // Si se abrio desde el pasaporte o una alerta, volver a la mascota
        navigate(params.get('mascota') ? `/mascotas/${evento.mascota.id}/pasaporte` : '/eventos')
      })
      .catch((err) => Swal.fire('Error', mensajeError(err, 'No se pudo guardar el evento'), 'error'))
      .finally(() => setGuardando(false))
  }

  const mascotaElegida = mascotas.find((m) => m.id === evento.mascota.id)
  const sugerida = sugerencia(evento.tipoEvento, evento.fechaAplicacion)

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fas fa-notes-medical"></i>
            {esEdicion ? ' Editar Evento Medico' : ' Nuevo Evento Medico'}
          </h2>
          <p className="section-subtitle">
            Vacuna, consulta, desparasitacion o cualquier evento clinico (HU007)
          </p>
        </div>
      </div>

      <form className="form-pet" onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="idMascota">Mascota <span className="required">*</span></label>
            <select id="idMascota" name="idMascota" className={clase('mascota', 'form-select')}
                    value={evento.mascota.id} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Seleccione...</option>
              {mascotas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.especie}){m.usuario ? ` - ${m.usuario.nombreCompleto}` : ''}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{errores.mascota}</div>
            {mascotaElegida && (
              <div className="form-text">
                {mascotaElegida.raza || 'Sin raza'} &middot; {mascotaElegida.edad} {mascotaElegida.edad === 1 ? 'ano' : 'anos'}
                {mascotaElegida.peso ? ` · ${mascotaElegida.peso} kg` : ''}
              </div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="tipoEvento">Tipo de Evento <span className="required">*</span></label>
            <select id="tipoEvento" name="tipoEvento" className={clase('tipoEvento', 'form-select')}
                    value={evento.tipoEvento} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Seleccione...</option>
              {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
            </select>
            <div className="invalid-feedback">{errores.tipoEvento}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="fechaAplicacion">Fecha de Aplicacion <span className="required">*</span></label>
            <input id="fechaAplicacion" type="date" name="fechaAplicacion" className={clase('fechaAplicacion')}
                   value={evento.fechaAplicacion} max={hoyTexto()} onChange={handleChange} onBlur={handleBlur} />
            <div className="invalid-feedback">{errores.fechaAplicacion}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="fechaProximaDosis">
              Fecha de Proxima Dosis
              {!proximaManual && evento.fechaProximaDosis && (
                <span className="badge text-bg-info ms-2 fw-normal">sugerida</span>
              )}
            </label>
            <input id="fechaProximaDosis" type="date" name="fechaProximaDosis" className={clase('fechaProximaDosis')}
                   value={evento.fechaProximaDosis} min={evento.fechaAplicacion || undefined}
                   onChange={handleChange} onBlur={handleBlur} />
            <div className="invalid-feedback">{errores.fechaProximaDosis}</div>
            <div className="form-text">
              {sugerida && evento.fechaProximaDosis !== sugerida ? (
                <button type="button" className="btn btn-link btn-sm p-0" onClick={usarSugerencia}>
                  <i className="fas fa-wand-magic-sparkles me-1"></i>
                  Usar fecha recomendada: {formatearFecha(sugerida)}
                </button>
              ) : sugerida ? (
                <>Recomendado para {evento.tipoEvento.toLowerCase()}: refuerzo a los {DIAS_REFUERZO[evento.tipoEvento]} dias.</>
              ) : (
                'Opcional. Se usa para las alertas y el calendario de vacunacion.'
              )}
              {evento.fechaProximaDosis && (
                <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-danger"
                        onClick={() => { setProximaManual(true); setEvento({ ...evento, fechaProximaDosis: '' }) }}>
                  Quitar
                </button>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="veterinariaClinica">Veterinaria / Clinica</label>
            <input id="veterinariaClinica" type="text" name="veterinariaClinica" className="form-control"
                   value={evento.veterinariaClinica} onChange={handleChange} maxLength={200}
                   list="clinicas" placeholder="Ej: VetCare Bucaramanga" />
            <datalist id="clinicas">
              <option value="VetCare Bucaramanga" />
              <option value="Clinica Mascotas UIS" />
              <option value="Hospital Veterinario Cabecera" />
            </datalist>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="veterinario">Veterinario</label>
            <input id="veterinario" type="text" name="veterinario" className="form-control"
                   value={evento.veterinario} onChange={handleChange} maxLength={150} placeholder="Ej: Dra. Ana Suarez" />
          </div>

          <div className="col-md-12">
            <label className="form-label" htmlFor="notasDiagnostico">Notas / Diagnostico</label>
            <textarea id="notasDiagnostico" name="notasDiagnostico" className="form-control" rows={3}
                      value={evento.notasDiagnostico} onChange={handleChange} maxLength={2000}
                      placeholder="Observaciones del veterinario, medicamento, lote de la vacuna..." />
            <div className="form-text text-end">{evento.notasDiagnostico.length}/2000</div>
          </div>
        </div>

        <hr className="mt-2" />
        <div className="d-flex gap-2">
          {/* onMouseDown evita que el campo enfocado pierda el foco antes del clic:
              si no, el mensaje de error que aparece al salir del campo desplaza
              el boton y el clic se pierde. */}
          <button type="submit" className="btn btn-pet" disabled={guardando}
                  onMouseDown={(e) => e.preventDefault()}>
            {guardando
              ? <><i className="fas fa-spinner fa-spin me-1"></i> Guardando...</>
              : <><i className="fas fa-save me-1"></i> {esEdicion ? 'Guardar cambios' : 'Registrar evento'}</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-xmark me-1"></i> Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventoForm
