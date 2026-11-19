import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Swal from 'sweetalert2'

import { getMascotaById } from '../services/MascotaService'
import { getEventosPorMascota, deleteEvento } from '../services/EventoService'
import { calcularEstados, estadoGeneral, formatearFecha, hoyTexto } from '../utils/fechas'
import { confirmarEliminacion, exito, mensajeError } from '../utils/notificar'
import { iconoEspecie } from './MascotaList'
import EstadoDosis from './comunes/EstadoDosis'
import Cargando from './comunes/Cargando'

const TEXTO_ESTADO = {
  VENCIDA: 'Tiene dosis vencidas',
  PROXIMA: 'Tiene dosis proximas a vencer',
  AL_DIA: 'Esquema sanitario al dia',
  SIN_REGISTROS: 'Sin registros medicos'
}

/**
 * Pasaporte Sanitario Digital de una mascota (objetivo principal del proyecto).
 *
 * Reune en una sola pagina:
 *  - Ficha de la mascota y del dueno.
 *  - Estado sanitario general y estado de cada vacuna / desparasitacion.
 *  - Linea de tiempo con todo el historial medico (RF-06).
 *  - Codigo QR que abre este mismo pasaporte (para llevarlo en el collar o
 *    mostrarlo en la veterinaria).
 *  - Boton para imprimir o guardar como PDF.
 *
 * Hace dos peticiones en paralelo: GET /api/mascotas/{id} y
 * GET /api/eventos/mascota/{id}.
 */
const Pasaporte = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mascota, setMascota] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    setCargando(true)
    Promise.all([getMascotaById(id), getEventosPorMascota(id)])
      .then(([rMascota, rEventos]) => {
        setMascota(rMascota.data?.Mascota)
        setEventos(rEventos.data?.Eventos || [])
      })
      .catch((e) => {
        Swal.fire('Error', mensajeError(e, 'No se pudo cargar el pasaporte'), 'error')
        navigate('/mascotas')
      })
      .finally(() => setCargando(false))
  }, [id, navigate])

  const estados = useMemo(() => calcularEstados(eventos), [eventos])
  const general = estadoGeneral(eventos)

  // Ultimo registro de cada vacuna / desparasitacion (tabla "Plan preventivo")
  const preventivos = useMemo(
    () => eventos.filter((e) => estados[e.id] && estados[e.id].estado !== 'RENOVADO' && e.fechaProximaDosis),
    [eventos, estados]
  )

  const tipos = [...new Set(eventos.map((e) => e.tipoEvento))]
  const historial = tipo ? eventos.filter((e) => e.tipoEvento === tipo) : eventos

  const eliminar = async (evento) => {
    if (!(await confirmarEliminacion(`Se eliminara el registro de ${evento.tipoEvento.toLowerCase()}.`))) return
    deleteEvento(evento.id)
      .then(() => {
        setEventos((lista) => lista.filter((e) => e.id !== evento.id))
        exito('Evento eliminado')
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudo eliminar'), 'error'))
  }

  const copiarEnlace = () => {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => exito('Enlace copiado'))
      .catch(() => Swal.fire('Enlace del pasaporte', window.location.href, 'info'))
  }

  if (cargando) return <div className="section-card"><Cargando texto="Cargando pasaporte..." /></div>
  if (!mascota) return null

  const dueno = mascota.usuario || {}

  return (
    <div className="pasaporte-pagina">
      {/* Barra de acciones (no se imprime) */}
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3 no-print">
        <Link to="/mascotas" className="btn btn-link px-0">
          <i className="fas fa-arrow-left me-1"></i> Volver a mascotas
        </Link>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-pet" onClick={() => navigate(`/eventos/crear?mascota=${mascota.id}`)}>
            <i className="fas fa-plus me-1"></i> Registrar evento
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate(`/mascotas/editar/${mascota.id}`)}>
            <i className="fas fa-edit me-1"></i> Editar ficha
          </button>
          <button className="btn btn-outline-secondary" onClick={copiarEnlace}>
            <i className="fas fa-link me-1"></i> Copiar enlace
          </button>
          <button className="btn btn-dark" onClick={() => window.print()}>
            <i className="fas fa-print me-1"></i> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Documento del pasaporte */}
      <article className="pasaporte">
        <header className="pasaporte-cabecera">
          <div>
            <div className="pasaporte-sello"><i className="fas fa-heart-pulse"></i> PetHealth Tracker</div>
            <h1>Pasaporte Sanitario Digital</h1>
            <p className="mb-0">Documento N.&ordm; PHT-{String(mascota.id).padStart(6, '0')} &middot; Emitido el {formatearFecha(hoyTexto())}</p>
          </div>
          <div className="pasaporte-qr" title="Escanee para abrir este pasaporte">
            <QRCodeSVG value={window.location.href} size={92} level="M" bgColor="#ffffff" fgColor="#0d3b2e" />
            <small>Escanear</small>
          </div>
        </header>

        <section className="pasaporte-ficha">
          <div className={`pasaporte-foto especie-${(mascota.especie || '').toLowerCase()}`}>
            <i className={`fas ${iconoEspecie(mascota.especie)}`}></i>
          </div>
          <div className="pasaporte-datos">
            <h2>{mascota.nombre}</h2>
            <dl>
              <div><dt>Especie</dt><dd>{mascota.especie}</dd></div>
              <div><dt>Raza</dt><dd>{mascota.raza || '-'}</dd></div>
              <div><dt>Sexo</dt><dd>{mascota.sexo || '-'}</dd></div>
              <div><dt>Edad</dt><dd>{mascota.edad} {mascota.edad === 1 ? 'ano' : 'anos'}</dd></div>
              <div><dt>Peso</dt><dd>{mascota.peso ? `${mascota.peso} kg` : '-'}</dd></div>
              <div><dt>Color</dt><dd>{mascota.color || '-'}</dd></div>
            </dl>
          </div>
          <div className="pasaporte-dueno">
            <h3><i className="fas fa-user"></i> Responsable</h3>
            <p className="fw-semibold mb-1">{dueno.nombreCompleto || '-'}</p>
            <p className="small mb-1">{dueno.tipoDocumento?.tipo || 'Doc.'} {dueno.numeroDocumento}</p>
            {dueno.telefono && <p className="small mb-1"><i className="fas fa-phone me-1"></i>{dueno.telefono}</p>}
            {dueno.email && <p className="small mb-0"><i className="fas fa-envelope me-1"></i>{dueno.email}</p>}
          </div>
        </section>

        <section className={`pasaporte-estado estado-general-${general}`}>
          <i className={`fas ${general === 'AL_DIA' ? 'fa-shield-heart' : general === 'VENCIDA' ? 'fa-triangle-exclamation' : general === 'PROXIMA' ? 'fa-clock' : 'fa-circle-info'}`}></i>
          <div>
            <strong>{TEXTO_ESTADO[general]}</strong>
            <div className="small">{eventos.length} evento(s) medico(s) registrado(s)</div>
          </div>
        </section>

        {preventivos.length > 0 && (
          <section className="pasaporte-seccion">
            <h3><i className="fas fa-syringe"></i> Plan preventivo (vacunas y desparasitacion)</h3>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr><th>Tipo</th><th>Ultima aplicacion</th><th>Proxima dosis</th><th>Estado</th><th className="no-print"></th></tr>
                </thead>
                <tbody>
                  {preventivos.map((e) => (
                    <tr key={e.id}>
                      <td className="text-capitalize">{e.tipoEvento.toLowerCase()}</td>
                      <td>{formatearFecha(e.fechaAplicacion)}</td>
                      <td>{formatearFecha(e.fechaProximaDosis)}</td>
                      <td><EstadoDosis estado={estados[e.id].estado} dias={estados[e.id].dias} mostrarDias /></td>
                      <td className="no-print text-end">
                        {(estados[e.id].estado === 'VENCIDA' || estados[e.id].estado === 'PROXIMA') && (
                          <button className="btn btn-sm btn-pet"
                                  onClick={() => navigate(`/eventos/crear?mascota=${mascota.id}&tipo=${encodeURIComponent(e.tipoEvento)}`)}>
                            <i className="fas fa-syringe me-1"></i> Aplicar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="pasaporte-seccion">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h3 className="mb-0"><i className="fas fa-clock-rotate-left"></i> Historial medico</h3>
            {tipos.length > 1 && (
              <select className="form-select form-select-sm w-auto no-print" value={tipo}
                      onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar historial">
                <option value="">Todos los tipos</option>
                {tipos.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
              </select>
            )}
          </div>

          {historial.length === 0 ? (
            <p className="text-muted mt-3 mb-0">
              Aun no hay eventos medicos. <Link to={`/eventos/crear?mascota=${mascota.id}`} className="no-print">Registrar el primero</Link>
            </p>
          ) : (
            <ol className="linea-tiempo">
              {historial.map((e) => (
                <li key={e.id} className={`lt-${claseTipo(e.tipoEvento)}`}>
                  <div className="lt-marca"><i className={`fas ${iconoTipo(e.tipoEvento)}`}></i></div>
                  <div className="lt-contenido">
                    <div className="d-flex justify-content-between flex-wrap gap-1">
                      <strong className="text-capitalize">{e.tipoEvento.toLowerCase()}</strong>
                      <span className="text-muted small">{formatearFecha(e.fechaAplicacion, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {(e.veterinariaClinica || e.veterinario) && (
                      <div className="small text-muted">
                        <i className="fas fa-hospital me-1"></i>
                        {[e.veterinariaClinica, e.veterinario].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    {e.notasDiagnostico && <p className="mb-1 mt-1">{e.notasDiagnostico}</p>}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
                      <span className="small">
                        {e.fechaProximaDosis && (
                          <>
                            <i className="fas fa-bell text-warning me-1"></i>
                            Proxima dosis: {formatearFecha(e.fechaProximaDosis)}{' '}
                            <EstadoDosis estado={estados[e.id].estado} />
                          </>
                        )}
                      </span>
                      <span className="no-print d-flex gap-1">
                        <button className="btn btn-sm btn-outline-warning" title="Editar"
                                onClick={() => navigate(`/eventos/editar/${e.id}`)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => eliminar(e)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="pasaporte-pie">
          Generado por PetHealth Tracker &middot; UIS &middot; Entornos de Programacion 2026-II &middot; Grupo 02
        </footer>
      </article>
    </div>
  )
}

export const claseTipo = (tipo = '') => {
  if (tipo.includes('VACUNA')) return 'vacuna'
  if (tipo.includes('DESPARASITACION')) return 'desparasitacion'
  if (tipo.includes('CONSULTA')) return 'consulta'
  if (tipo.includes('CIRUGIA') || tipo.includes('ESTERILIZACION')) return 'cirugia'
  return 'otro'
}

export const iconoTipo = (tipo = '') => {
  const c = claseTipo(tipo)
  return { vacuna: 'fa-syringe', desparasitacion: 'fa-pills', consulta: 'fa-stethoscope', cirugia: 'fa-kit-medical', otro: 'fa-notes-medical' }[c]
}

export default Pasaporte
