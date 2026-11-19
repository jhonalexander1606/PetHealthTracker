import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getMascotas, getMascotasPorUsuario, deleteMascota } from '../services/MascotaService'
import { getEventos } from '../services/EventoService'
import { esDueno, getUsuarioActual } from '../services/AuthService'
import { estadoGeneral } from '../utils/fechas'
import { exportarCSV } from '../utils/exportar'
import { confirmarEliminacion, exito, mensajeError } from '../utils/notificar'
import useTabla from '../hooks/useTabla'
import Paginacion from './comunes/Paginacion'
import ColumnaOrdenable from './comunes/ColumnaOrdenable'
import EstadoDosis from './comunes/EstadoDosis'
import Cargando from './comunes/Cargando'
import Vacio from './comunes/Vacio'

export const ICONO_ESPECIE = { Perro: 'fa-dog', Gato: 'fa-cat', Ave: 'fa-dove', Conejo: 'fa-carrot' }
export const iconoEspecie = (especie) => ICONO_ESPECIE[especie] || 'fa-paw'

/**
 * Lista de mascotas (CRUD de David - HU006).
 *
 * - Un DUENO solo ve sus mascotas (GET /api/mascotas/usuario/{id}).
 * - Se piden mascotas y eventos EN PARALELO (Promise.all) para calcular el
 *   estado sanitario de cada mascota.
 * - Buscador, filtros, ordenamiento, paginacion, exportar a Excel y dos
 *   vistas: tabla o tarjetas.
 */
const MascotaList = () => {
  const navigate = useNavigate()
  const usuario = getUsuarioActual()
  const soloMias = esDueno()

  const [mascotas, setMascotas] = useState([])
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [especie, setEspecie] = useState('')
  const [estado, setEstado] = useState('')
  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem('vista-mascotas') || 'tabla' } catch { return 'tabla' }
  })

  const cargar = () => {
    setCargando(true)
    const pedirMascotas = soloMias
      ? getMascotasPorUsuario(usuario.idUsuario).then((r) => r.data?.Mascotas || [])
      : getMascotas().then((r) => r.data)
    Promise.all([pedirMascotas, getEventos().then((r) => r.data)])
      .then(([listaMascotas, listaEventos]) => {
        setMascotas(listaMascotas)
        setEventos(listaEventos)
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudieron cargar las mascotas'), 'error'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const cambiarVista = (v) => {
    setVista(v)
    try { localStorage.setItem('vista-mascotas', v) } catch { /* ignorar */ }
  }

  // Estado sanitario y cantidad de eventos por mascota
  const infoSalud = useMemo(() => {
    const info = {}
    mascotas.forEach((m) => {
      const propios = eventos.filter((e) => e.mascota?.id === m.id)
      info[m.id] = { estado: estadoGeneral(propios), total: propios.length }
    })
    return info
  }, [mascotas, eventos])

  const especies = useMemo(() => [...new Set(mascotas.map((m) => m.especie))].sort(), [mascotas])

  const filtro = useCallback(
    (m) => (!especie || m.especie === especie) && (!estado || infoSalud[m.id]?.estado === estado),
    [especie, estado, infoSalud]
  )

  const tabla = useTabla({
    datos: mascotas,
    filtro,
    camposBusqueda: (m) => [m.nombre, m.raza, m.color, m.usuario?.nombreCompleto, m.usuario?.numeroDocumento],
    accesores: {
      dueno: (m) => m.usuario?.nombreCompleto,
      salud: (m) => ['VENCIDA', 'PROXIMA', 'SIN_REGISTROS', 'AL_DIA'].indexOf(infoSalud[m.id]?.estado)
    },
    ordenInicial: { clave: 'nombre', asc: true },
    porPagina: 10
  })

  const eliminarMascota = async (m) => {
    const total = infoSalud[m.id]?.total || 0
    const ok = await confirmarEliminacion(
      total > 0
        ? `Se eliminara a ${m.nombre} y sus ${total} evento(s) medico(s). Esta accion no se puede deshacer.`
        : `Se eliminara a ${m.nombre}. Esta accion no se puede deshacer.`
    )
    if (!ok) return
    deleteMascota(m.id)
      .then((r) => {
        setMascotas((lista) => lista.filter((x) => x.id !== m.id))
        setEventos((lista) => lista.filter((e) => e.mascota?.id !== m.id))
        exito(r.data?.Mensaje || 'Mascota eliminada')
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudo eliminar la mascota'), 'error'))
  }

  const exportar = () =>
    exportarCSV('mascotas', [
      { titulo: 'ID', valor: (m) => m.id },
      { titulo: 'Nombre', valor: (m) => m.nombre },
      { titulo: 'Especie', valor: (m) => m.especie },
      { titulo: 'Raza', valor: (m) => m.raza },
      { titulo: 'Edad (anos)', valor: (m) => m.edad },
      { titulo: 'Sexo', valor: (m) => m.sexo },
      { titulo: 'Peso (kg)', valor: (m) => m.peso },
      { titulo: 'Color', valor: (m) => m.color },
      { titulo: 'Dueno', valor: (m) => m.usuario?.nombreCompleto },
      { titulo: 'Documento dueno', valor: (m) => m.usuario?.numeroDocumento },
      { titulo: 'Eventos medicos', valor: (m) => infoSalud[m.id]?.total },
      { titulo: 'Estado sanitario', valor: (m) => infoSalud[m.id]?.estado }
    ], tabla.filtradas)

  const acciones = (m) => (
    <div className="d-flex gap-1">
      <button className="btn btn-sm btn-info text-white" title="Pasaporte sanitario"
              onClick={() => navigate(`/mascotas/${m.id}/pasaporte`)}>
        <i className="fas fa-passport"></i>
      </button>
      <button className="btn btn-sm btn-warning" title="Editar"
              onClick={() => navigate(`/mascotas/editar/${m.id}`)}>
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" title="Eliminar" onClick={() => eliminarMascota(m)}>
        <i className="fas fa-trash"></i>
      </button>
    </div>
  )

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fas fa-paw"></i> {soloMias ? 'Mis Mascotas' : 'Gestion de Mascotas'}
          </h2>
          <p className="section-subtitle">
            Ficha sanitaria de perros, gatos y otras mascotas (CRUD a cargo de David)
          </p>
        </div>
        <button className="btn btn-pet" onClick={() => navigate('/mascotas/crear')}>
          <i className="fas fa-plus me-1"></i> Nueva Mascota
        </button>
      </div>

      {/* Barra de herramientas */}
      <div className="barra-herramientas">
        <div className="input-group buscador">
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre, raza, color o dueno..."
            value={tabla.busqueda}
            onChange={(e) => tabla.setBusqueda(e.target.value)}
          />
        </div>
        <select className="form-select filtro" value={especie} onChange={(e) => setEspecie(e.target.value)}
                aria-label="Filtrar por especie">
          <option value="">Todas las especies</option>
          {especies.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className="form-select filtro" value={estado} onChange={(e) => setEstado(e.target.value)}
                aria-label="Filtrar por estado sanitario">
          <option value="">Cualquier estado</option>
          <option value="VENCIDA">Con dosis vencidas</option>
          <option value="PROXIMA">Con dosis proximas</option>
          <option value="AL_DIA">Al dia</option>
          <option value="SIN_REGISTROS">Sin registros</option>
        </select>
        <div className="btn-group" role="group" aria-label="Tipo de vista">
          <button className={`btn btn-outline-secondary ${vista === 'tabla' ? 'active' : ''}`}
                  onClick={() => cambiarVista('tabla')} title="Vista de tabla">
            <i className="fas fa-table-list"></i>
          </button>
          <button className={`btn btn-outline-secondary ${vista === 'tarjetas' ? 'active' : ''}`}
                  onClick={() => cambiarVista('tarjetas')} title="Vista de tarjetas">
            <i className="fas fa-grip"></i>
          </button>
        </div>
        <button className="btn btn-outline-success" onClick={exportar} disabled={tabla.filtradas.length === 0}
                title="Exportar a Excel (CSV)">
          <i className="fas fa-file-excel me-1"></i> Exportar
        </button>
      </div>

      {cargando ? (
        <Cargando texto="Cargando mascotas..." />
      ) : mascotas.length === 0 ? (
        <Vacio icono="fa-paw" titulo="No hay mascotas registradas"
               texto="Registra la primera mascota para comenzar su pasaporte sanitario.">
          <button className="btn btn-pet" onClick={() => navigate('/mascotas/crear')}>
            <i className="fas fa-plus me-1"></i> Registrar mascota
          </button>
        </Vacio>
      ) : tabla.filtradas.length === 0 ? (
        <Vacio icono="fa-filter-circle-xmark" titulo="Ninguna mascota coincide con la busqueda" />
      ) : vista === 'tarjetas' ? (
        <>
          <div className="mascotas-grid">
            {tabla.filasPagina.map((m) => (
              <div key={m.id} className="mascota-card">
                <div className="mascota-card-top">
                  <div className={`mascota-avatar especie-${(m.especie || '').toLowerCase()}`}>
                    <i className={`fas ${iconoEspecie(m.especie)}`}></i>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h3 className="mascota-nombre text-truncate">{m.nombre}</h3>
                    <div className="small text-muted text-truncate">{m.especie} &middot; {m.raza || 'Sin raza'}</div>
                  </div>
                  <EstadoDosis estado={infoSalud[m.id]?.estado} />
                </div>
                <div className="mascota-datos">
                  <span><i className="fas fa-cake-candles"></i> {m.edad} {m.edad === 1 ? 'ano' : 'anos'}</span>
                  <span><i className={`fas ${m.sexo === 'Hembra' ? 'fa-venus' : m.sexo === 'Macho' ? 'fa-mars' : 'fa-genderless'}`}></i> {m.sexo || '-'}</span>
                  <span><i className="fas fa-weight-scale"></i> {m.peso ? `${m.peso} kg` : '-'}</span>
                  <span><i className="fas fa-notes-medical"></i> {infoSalud[m.id]?.total || 0} eventos</span>
                </div>
                <div className="mascota-card-pie">
                  <small className="text-muted text-truncate">
                    <i className="fas fa-user me-1"></i>{m.usuario?.nombreCompleto || '-'}
                  </small>
                  {acciones(m)}
                </div>
              </div>
            ))}
          </div>
          <Paginacion tabla={tabla} />
        </>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <ColumnaOrdenable tabla={tabla} clave="id">ID</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="nombre">Nombre</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="especie">Especie</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="edad">Edad</ColumnaOrdenable>
                  <th>Sexo</th>
                  <ColumnaOrdenable tabla={tabla} clave="peso">Peso</ColumnaOrdenable>
                  {!soloMias && <ColumnaOrdenable tabla={tabla} clave="dueno">Dueno</ColumnaOrdenable>}
                  <ColumnaOrdenable tabla={tabla} clave="salud">Estado sanitario</ColumnaOrdenable>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tabla.filasPagina.map((m) => (
                  <tr key={m.id}>
                    <td className="text-muted">{m.id}</td>
                    <td>
                      <strong>{m.nombre}</strong>
                      <small className="d-block text-muted">{m.raza || 'Sin raza'}</small>
                    </td>
                    <td>
                      <i className={`fas ${iconoEspecie(m.especie)} me-1 text-pet`}></i>
                      {m.especie}
                    </td>
                    <td>{m.edad} {m.edad === 1 ? 'ano' : 'anos'}</td>
                    <td>{m.sexo || '-'}</td>
                    <td>{m.peso ? `${Number(m.peso).toFixed(1)} kg` : '-'}</td>
                    {!soloMias && (
                      <td>
                        {m.usuario?.nombreCompleto || '-'}
                        <small className="d-block text-muted">{m.usuario?.numeroDocumento}</small>
                      </td>
                    )}
                    <td>
                      <EstadoDosis estado={infoSalud[m.id]?.estado} />
                      <small className="d-block text-muted">{infoSalud[m.id]?.total || 0} evento(s)</small>
                    </td>
                    <td>{acciones(m)}</td>
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

export default MascotaList
