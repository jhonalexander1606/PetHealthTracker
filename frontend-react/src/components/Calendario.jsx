import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getEventos } from '../services/EventoService'
import { esDueno, getUsuarioActual } from '../services/AuthService'
import { aTexto, calcularEstados, capitalizar, formatearFecha, hoyTexto } from '../utils/fechas'
import { mensajeError } from '../utils/notificar'
import { iconoTipo } from './Pasaporte'
import Cargando from './comunes/Cargando'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

/**
 * Calendario de vacunacion y atenciones.
 *
 * Construye una cuadricula mensual con dos tipos de marcas:
 *  - Atenciones realizadas (fecha de aplicacion de cada evento).
 *  - Dosis programadas (fecha de proxima dosis vigente, no renovada),
 *    en rojo si ya se vencio.
 * Al hacer clic en un dia se ve el detalle a la derecha.
 */
const Calendario = () => {
  const navigate = useNavigate()
  const usuario = getUsuarioActual()
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mes, setMes] = useState(() => { const h = new Date(); return new Date(h.getFullYear(), h.getMonth(), 1) })
  const [diaSel, setDiaSel] = useState(hoyTexto())

  useEffect(() => {
    getEventos()
      .then((r) => setEventos(esDueno() ? r.data.filter((e) => e.mascota?.usuario?.id === usuario.idUsuario) : r.data))
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudieron cargar los eventos'), 'error'))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Indice: "AAAA-MM-DD" -> lista de marcas de ese dia
  const marcasPorDia = useMemo(() => {
    const estados = calcularEstados(eventos)
    const indice = {}
    const agregar = (fecha, marca) => { (indice[fecha] = indice[fecha] || []).push(marca) }
    eventos.forEach((e) => {
      agregar(e.fechaAplicacion, { tipo: 'aplicado', evento: e })
      const est = estados[e.id]?.estado
      if (e.fechaProximaDosis && est !== 'RENOVADO') {
        agregar(e.fechaProximaDosis, { tipo: est === 'VENCIDA' ? 'vencida' : 'programada', evento: e })
      }
    })
    return indice
  }, [eventos])

  // Celdas del mes (empieza en lunes)
  const celdas = useMemo(() => {
    const primero = new Date(mes)
    const desplazamiento = (primero.getDay() + 6) % 7
    const inicio = new Date(primero)
    inicio.setDate(primero.getDate() - desplazamiento)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      return d
    })
  }, [mes])

  const cambiarMes = (delta) => setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  const irAHoy = () => {
    const h = new Date()
    setMes(new Date(h.getFullYear(), h.getMonth(), 1))
    setDiaSel(hoyTexto())
  }

  const tituloMes = capitalizar(mes.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))
  const hoy = hoyTexto()
  const marcasDia = marcasPorDia[diaSel] || []

  // Proximas dosis programadas desde hoy (para la lista inferior)
  const proximas = useMemo(
    () => Object.entries(marcasPorDia)
      .filter(([f]) => f >= hoy)
      .flatMap(([f, ms]) => ms.filter((m) => m.tipo === 'programada').map((m) => ({ fecha: f, ...m })))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 6),
    [marcasPorDia, hoy]
  )

  if (cargando) return <div className="section-card"><Cargando texto="Armando el calendario..." /></div>

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="section-card mb-0 h-100">
          <div className="calendario-cabecera">
            <h2 className="section-title mb-0">
              <i className="fas fa-calendar-days"></i> {tituloMes}
            </h2>
            <div className="btn-group">
              <button className="btn btn-outline-secondary" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary" onClick={irAHoy}>Hoy</button>
              <button className="btn btn-outline-secondary" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendario-leyenda">
            <span><i className="punto verde" /> Atencion realizada</span>
            <span><i className="punto naranja" /> Dosis programada</span>
            <span><i className="punto rojo" /> Dosis vencida</span>
          </div>

          <div className="calendario" role="grid">
            {DIAS_SEMANA.map((d) => <div key={d} className="cal-dia-semana">{d}</div>)}
            {celdas.map((d) => {
              const f = aTexto(d)
              const marcas = marcasPorDia[f] || []
              const fueraDeMes = d.getMonth() !== mes.getMonth()
              const tipos = new Set(marcas.map((m) => m.tipo))
              return (
                <button
                  key={f}
                  role="gridcell"
                  className={`cal-celda ${fueraDeMes ? 'fuera' : ''} ${f === hoy ? 'hoy' : ''} ${f === diaSel ? 'seleccionada' : ''}`}
                  onClick={() => setDiaSel(f)}
                  aria-label={`${formatearFecha(f)}: ${marcas.length} evento(s)`}
                >
                  <span className="cal-numero">{d.getDate()}</span>
                  {marcas.length > 0 && (
                    <span className="cal-marcas">
                      {tipos.has('aplicado') && <i className="punto verde" />}
                      {tipos.has('programada') && <i className="punto naranja" />}
                      {tipos.has('vencida') && <i className="punto rojo" />}
                      {marcas.length > 1 && <small>{marcas.length}</small>}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="section-card mb-3">
          <h3 className="h6 fw-bold mb-3">
            {capitalizar(formatearFecha(diaSel, { weekday: 'long', day: 'numeric', month: 'long' }))}
          </h3>
          {marcasDia.length === 0 ? (
            <p className="text-muted small mb-2">No hay eventos este dia.</p>
          ) : (
            <ul className="list-unstyled mb-2 detalle-dia">
              {marcasDia.map((m, i) => (
                <li key={i} className={`marca-${m.tipo}`}>
                  <i className={`fas ${iconoTipo(m.evento.tipoEvento)}`}></i>
                  <div>
                    <Link to={`/mascotas/${m.evento.mascota?.id}/pasaporte`} className="fw-semibold">
                      {m.evento.mascota?.nombre}
                    </Link>
                    <div className="small text-capitalize">{m.evento.tipoEvento.toLowerCase()}</div>
                    <div className="small text-muted">
                      {m.tipo === 'aplicado' ? `Aplicado${m.evento.veterinario ? ' por ' + m.evento.veterinario : ''}`
                        : m.tipo === 'vencida' ? 'Dosis vencida sin aplicar' : 'Dosis programada'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {diaSel <= hoy && (
            <button className="btn btn-sm btn-pet w-100" onClick={() => navigate('/eventos/crear')}>
              <i className="fas fa-plus me-1"></i> Registrar evento
            </button>
          )}
        </div>

        <div className="section-card mb-0">
          <h3 className="h6 fw-bold mb-3"><i className="fas fa-syringe me-1 text-pet"></i> Proximas dosis</h3>
          {proximas.length === 0 ? (
            <p className="text-muted small mb-0">No hay dosis programadas.</p>
          ) : (
            <ul className="list-unstyled mb-0 proximas-lista">
              {proximas.map((p, i) => (
                <li key={i}>
                  <button className="btn btn-link p-0 text-start text-decoration-none" onClick={() => {
                    const f = new Date(p.fecha + 'T00:00:00')
                    setMes(new Date(f.getFullYear(), f.getMonth(), 1))
                    setDiaSel(p.fecha)
                  }}>
                    <span className="fecha-mini">{formatearFecha(p.fecha, { day: 'numeric', month: 'short' })}</span>
                  </button>
                  <span className="small">
                    <strong>{p.evento.mascota?.nombre}</strong> &middot; {p.evento.tipoEvento.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calendario
