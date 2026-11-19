import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getEventos, deleteEvento } from '../services/EventoService'
import { esDueno, getUsuarioActual } from '../services/AuthService'
import { calcularEstados, formatearFecha } from '../utils/fechas'
import { exportarCSV } from '../utils/exportar'
import { confirmarEliminacion, exito, mensajeError } from '../utils/notificar'
import useTabla from '../hooks/useTabla'
import Paginacion from './comunes/Paginacion'
import ColumnaOrdenable from './comunes/ColumnaOrdenable'
import EstadoDosis from './comunes/EstadoDosis'
import Cargando from './comunes/Cargando'
import Vacio from './comunes/Vacio'
import { claseTipo, iconoTipo } from './Pasaporte'

/**
 * Historial medico general (CRUD de Juan Diego - HU007, RF-06).
 *
 * - Llega ordenado del mas reciente al mas antiguo desde el backend.
 * - Columna de estado de la dosis (vencida / proxima / al dia / renovada).
 * - Filtros por tipo, estado y rango de fechas; el filtro de estado se
 *   puede abrir desde el dashboard con /eventos?estado=VENCIDA.
 * - Un DUENO solo ve los eventos de sus mascotas.
 */
const EventoList = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const usuario = getUsuarioActual()
  const soloMios = esDueno()

  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState(params.get('estado') || '')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  useEffect(() => {
    setCargando(true)
    getEventos()
      .then((r) => {
        const lista = soloMios
          ? r.data.filter((e) => e.mascota?.usuario?.id === usuario.idUsuario)
          : r.data
        setEventos(lista)
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudieron cargar los eventos'), 'error'))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const estados = useMemo(() => calcularEstados(eventos), [eventos])
  const tipos = useMemo(() => [...new Set(eventos.map((e) => e.tipoEvento))].sort(), [eventos])

  const cambiarEstado = (valor) => {
    setEstado(valor)
    if (valor) setParams({ estado: valor }, { replace: true })
    else setParams({}, { replace: true })
  }

  const filtro = useCallback(
    (e) =>
      (!tipo || e.tipoEvento === tipo) &&
      (!estado || estados[e.id]?.estado === estado) &&
      (!desde || e.fechaAplicacion >= desde) &&
      (!hasta || e.fechaAplicacion <= hasta),
    [tipo, estado, desde, hasta, estados]
  )

  const tabla = useTabla({
    datos: eventos,
    filtro,
    camposBusqueda: (e) => [e.mascota?.nombre, e.tipoEvento, e.veterinariaClinica, e.veterinario,
      e.notasDiagnostico, e.mascota?.usuario?.nombreCompleto],
    accesores: {
      mascota: (e) => e.mascota?.nombre,
      proxima: (e) => e.fechaProximaDosis || '9999'
    },
    ordenInicial: { clave: 'fechaAplicacion', asc: false },
    porPagina: 10
  })

  const hayFiltros = tipo || estado || desde || hasta || tabla.busqueda
  const limpiarFiltros = () => {
    setTipo(''); cambiarEstado(''); setDesde(''); setHasta(''); tabla.setBusqueda('')
  }

  const conteo = useMemo(() => {
    const c = { VENCIDA: 0, PROXIMA: 0 }
    Object.values(estados).forEach((x) => { if (c[x.estado] !== undefined) c[x.estado]++ })
    return c
  }, [estados])

  const eliminarEvento = async (evento) => {
    const ok = await confirmarEliminacion(
      `Se eliminara el registro de ${evento.tipoEvento.toLowerCase()} de ${evento.mascota?.nombre}.`
    )
    if (!ok) return
    deleteEvento(evento.id)
      .then(() => {
        setEventos((lista) => lista.filter((e) => e.id !== evento.id))
        exito('Evento medico eliminado')
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudo eliminar el evento'), 'error'))
  }

  const exportar = () =>
    exportarCSV('historial_medico', [
      { titulo: 'ID', valor: (e) => e.id },
      { titulo: 'Mascota', valor: (e) => e.mascota?.nombre },
      { titulo: 'Especie', valor: (e) => e.mascota?.especie },
      { titulo: 'Dueno', valor: (e) => e.mascota?.usuario?.nombreCompleto },
      { titulo: 'Tipo de evento', valor: (e) => e.tipoEvento },
      { titulo: 'Fecha de aplicacion', valor: (e) => e.fechaAplicacion },
      { titulo: 'Veterinaria / Clinica', valor: (e) => e.veterinariaClinica },
      { titulo: 'Veterinario', valor: (e) => e.veterinario },
      { titulo: 'Proxima dosis', valor: (e) => e.fechaProximaDosis },
      { titulo: 'Estado', valor: (e) => estados[e.id]?.estado },
      { titulo: 'Notas / Diagnostico', valor: (e) => e.notasDiagnostico }
    ], tabla.filtradas)

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fas fa-notes-medical"></i> Historial Medico
          </h2>
          <p className="section-subtitle">
            Vacunas, consultas y desparasitaciones (CRUD a cargo de Juan Diego)
          </p>
        </div>
        <button className="btn btn-pet" onClick={() => navigate('/eventos/crear')}>
          <i className="fas fa-plus me-1"></i> Nuevo Evento
        </button>
      </div>

      {/* Accesos rapidos por estado */}
      <div className="chips mb-3">
        <button className={`chip ${estado === '' ? 'activo' : ''}`} onClick={() => cambiarEstado('')}>
          Todos <span>{eventos.length}</span>
        </button>
        <button className={`chip chip-rojo ${estado === 'VENCIDA' ? 'activo' : ''}`} onClick={() => cambiarEstado('VENCIDA')}>
          <i className="fas fa-circle-exclamation"></i> Vencidas <span>{conteo.VENCIDA}</span>
        </button>
        <button className={`chip chip-naranja ${estado === 'PROXIMA' ? 'activo' : ''}`} onClick={() => cambiarEstado('PROXIMA')}>
          <i className="fas fa-clock"></i> Proximas 30 dias <span>{conteo.PROXIMA}</span>
        </button>
      </div>

      <div className="barra-herramientas">
        <div className="input-group buscador">
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input type="search" className="form-control" placeholder="Buscar mascota, veterinario, notas..."
                 value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        </div>
        <select className="form-select filtro" value={tipo} onChange={(e) => setTipo(e.target.value)}
                aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
        </select>
        <select className="form-select filtro" value={estado} onChange={(e) => cambiarEstado(e.target.value)}
                aria-label="Filtrar por estado">
          <option value="">Cualquier estado</option>
          <option value="VENCIDA">Vencida</option>
          <option value="PROXIMA">Proxima</option>
          <option value="AL_DIA">Al dia</option>
          <option value="RENOVADO">Renovado</option>
          <option value="SIN_REFUERZO">Sin refuerzo</option>
        </select>
        <div className="rango-fechas">
          <input type="date" className="form-control" value={desde} max={hasta || undefined}
                 onChange={(e) => setDesde(e.target.value)} aria-label="Desde" title="Aplicados desde" />
          <span className="text-muted">a</span>
          <input type="date" className="form-control" value={hasta} min={desde || undefined}
                 onChange={(e) => setHasta(e.target.value)} aria-label="Hasta" title="Aplicados hasta" />
        </div>
        {hayFiltros && (
          <button className="btn btn-link text-decoration-none" onClick={limpiarFiltros}>
            <i className="fas fa-xmark me-1"></i> Limpiar
          </button>
        )}
        <button className="btn btn-outline-success ms-auto" onClick={exportar}
                disabled={tabla.filtradas.length === 0} title="Exportar a Excel (CSV)">
          <i className="fas fa-file-excel me-1"></i> Exportar
        </button>
      </div>

      {cargando ? (
        <Cargando texto="Cargando historial medico..." />
      ) : eventos.length === 0 ? (
        <Vacio icono="fa-notes-medical" titulo="No hay eventos medicos registrados">
          <button className="btn btn-pet" onClick={() => navigate('/eventos/crear')}>
            <i className="fas fa-plus me-1"></i> Registrar el primero
          </button>
        </Vacio>
      ) : tabla.filtradas.length === 0 ? (
        <Vacio icono="fa-filter-circle-xmark" titulo="Ningun evento coincide con los filtros">
          <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros}>Limpiar filtros</button>
        </Vacio>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <ColumnaOrdenable tabla={tabla} clave="fechaAplicacion">Fecha</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="mascota">Mascota</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="tipoEvento">Tipo</ColumnaOrdenable>
                  <th>Atendido por</th>
                  <ColumnaOrdenable tabla={tabla} clave="proxima">Proxima dosis</ColumnaOrdenable>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tabla.filasPagina.map((e) => (
                  <tr key={e.id}>
                    <td className="text-nowrap">{formatearFecha(e.fechaAplicacion)}</td>
                    <td>
                      {e.mascota ? (
                        <Link to={`/mascotas/${e.mascota.id}/pasaporte`} className="fw-semibold">
                          {e.mascota.nombre}
                        </Link>
                      ) : '-'}
                      <small className="d-block text-muted">{e.mascota?.especie}</small>
                    </td>
                    <td>
                      <span className={`badge-tipo badge-${claseTipo(e.tipoEvento)}`}>
                        <i className={`fas ${iconoTipo(e.tipoEvento)} me-1`}></i>{e.tipoEvento}
                      </span>
                    </td>
                    <td className="small">
                      {e.veterinario || '-'}
                      <span className="d-block text-muted">{e.veterinariaClinica}</span>
                    </td>
                    <td className="text-nowrap">{e.fechaProximaDosis ? formatearFecha(e.fechaProximaDosis) : '-'}</td>
                    <td><EstadoDosis estado={estados[e.id]?.estado} dias={estados[e.id]?.dias} mostrarDias /></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-warning" title="Editar"
                                onClick={() => navigate(`/eventos/editar/${e.id}`)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-danger" title="Eliminar" onClick={() => eliminarEvento(e)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion tabla={tabla} />
        </>
      )}
    </div>
  )
}

export default EventoList
