import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getResumen } from '../services/DashboardService'
import { getUsuarioActual, tieneRol } from '../services/AuthService'
import { capitalizar, formatearFecha, textoRelativo } from '../utils/fechas'
import { mensajeError } from '../utils/notificar'
import { BarrasHorizontales, Columnas, Dona } from './comunes/Graficos'
import Cargando from './comunes/Cargando'

/**
 * Panel principal (dashboard).
 *
 * Consume GET /api/dashboard/resumen, que el backend calcula segun el rol:
 * ADMIN y VETERINARIO ven todo el sistema; un DUENO solo sus mascotas.
 * Muestra indicadores, graficas, alertas de vacunacion y actividad reciente.
 */
const Dashboard = () => {
  const usuario = getUsuarioActual()
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState(null)

  const cargar = () => {
    setError(null)
    getResumen()
      .then((r) => setResumen(r.data))
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar el resumen')))
  }

  useEffect(() => { cargar() }, [])

  const saludo = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos dias'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const nombreCorto = (usuario?.nombreCompleto || '').split(' ')[0]
  const fechaHoy = capitalizar(new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }))

  // Mensaje de recordatorio para WhatsApp (numeros de Colombia, prefijo 57)
  const enlaceWhatsApp = (a) => {
    if (!a.telefonoDueno) return null
    const numero = a.telefonoDueno.replace(/\D/g, '')
    const destino = numero.length === 10 ? `57${numero}` : numero
    const verbo = a.estado === 'VENCIDA' ? 'vencio el' : 'vence el'
    const texto = `Hola ${a.dueno || ''}, le recordamos desde PetHealth Tracker que la dosis de ` +
      `${a.tipoEvento.toLowerCase()} de ${a.mascota} ${verbo} ${formatearFecha(a.fechaProximaDosis)}. ` +
      'Por favor agende su cita. Gracias!'
    return `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`
  }

  const t = resumen?.totales || {}
  const kpis = [
    tieneRol('DUENO')
      ? null
      : { icono: 'fa-users', etiqueta: 'Usuarios', valor: t.usuarios, color: 'kpi-azul', ruta: '/usuarios' },
    { icono: 'fa-paw', etiqueta: tieneRol('DUENO') ? 'Mis mascotas' : 'Mascotas', valor: t.mascotas, color: 'kpi-verde', ruta: '/mascotas' },
    { icono: 'fa-notes-medical', etiqueta: 'Eventos medicos', valor: t.eventos, color: 'kpi-morado', ruta: '/eventos',
      detalle: `${t.eventosUltimos30Dias ?? 0} en los ultimos 30 dias` },
    { icono: 'fa-syringe', etiqueta: 'Vacunas aplicadas', valor: t.vacunas, color: 'kpi-naranja', ruta: '/eventos' },
    { icono: 'fa-triangle-exclamation', etiqueta: 'Dosis vencidas', valor: t.alertasVencidas, color: 'kpi-rojo', ruta: '/eventos?estado=VENCIDA',
      detalle: `${t.alertasProximas ?? 0} proximas a vencer` }
  ].filter(Boolean)

  return (
    <>
      {/* Encabezado */}
      <div className="bienvenida">
        <div>
          <p className="bienvenida-fecha">{fechaHoy}</p>
          <h1 className="bienvenida-titulo">{saludo()}, {nombreCorto} <span aria-hidden>👋</span></h1>
          <p className="mb-0 opacity-75">
            {resumen?.alcance === 'PROPIO'
              ? 'Este es el estado de salud de tus mascotas.'
              : 'Resumen general del Pasaporte Sanitario Digital.'}
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light btn-sm fw-semibold" onClick={() => navigate('/eventos/crear')}>
            <i className="fas fa-plus me-1"></i> Registrar evento
          </button>
          <button className="btn btn-outline-light btn-sm fw-semibold" onClick={() => navigate('/mascotas/crear')}>
            <i className="fas fa-paw me-1"></i> Nueva mascota
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span><i className="fas fa-plug-circle-xmark me-2"></i>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargar}>Reintentar</button>
        </div>
      )}

      {!resumen && !error && <div className="section-card"><Cargando texto="Calculando estadisticas..." /></div>}

      {resumen && (
        <>
          {/* Indicadores */}
          <div className="kpi-grid">
            {kpis.map((k) => (
              <Link key={k.etiqueta} to={k.ruta} className={`kpi ${k.color}`}>
                <div className="kpi-icono"><i className={`fas ${k.icono}`}></i></div>
                <div>
                  <div className="kpi-valor">{k.valor ?? 0}</div>
                  <div className="kpi-etiqueta">{k.etiqueta}</div>
                  {k.detalle && <div className="kpi-detalle">{k.detalle}</div>}
                </div>
              </Link>
            ))}
          </div>

          <div className="row g-3">
            {/* Alertas */}
            <div className="col-lg-7">
              <div className="section-card h-100 mb-0">
                <div className="tarjeta-titulo">
                  <h2><i className="fas fa-bell"></i> Alertas de vacunacion</h2>
                  <span className="text-muted small">Vencidas y proximos {30} dias</span>
                </div>
                {resumen.alertas.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-shield-dog fs-1 text-success mb-2 d-block"></i>
                    Todas las mascotas tienen sus dosis al dia.
                  </div>
                ) : (
                  <ul className="list-unstyled mb-0 alertas-lista">
                    {resumen.alertas.map((a) => (
                      <li key={a.idEvento} className={`alerta-item ${a.estado === 'VENCIDA' ? 'vencida' : 'proxima'}`}>
                        <div className="alerta-dias">
                          <span className="numero">{Math.abs(a.diasRestantes)}</span>
                          <span className="unidad">{a.estado === 'VENCIDA' ? 'dias tarde' : 'dias'}</span>
                        </div>
                        <div className="flex-grow-1">
                          <Link to={`/mascotas/${a.idMascota}/pasaporte`} className="fw-semibold">
                            {a.mascota}
                          </Link>
                          <span className="text-muted small"> &middot; {a.especie}</span>
                          <div className="small">{a.tipoEvento.toLowerCase()}</div>
                          <div className="small text-muted">
                            {a.estado === 'VENCIDA' ? 'Vencio ' : 'Vence '}{textoRelativo(a.diasRestantes)}
                            {' '}({formatearFecha(a.fechaProximaDosis)}){a.dueno && <> &middot; {a.dueno}</>}
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <button
                            className="btn btn-sm btn-pet"
                            title="Registrar la dosis aplicada"
                            onClick={() => navigate(`/eventos/crear?mascota=${a.idMascota}&tipo=${encodeURIComponent(a.tipoEvento)}`)}
                          >
                            <i className="fas fa-syringe"></i>
                          </button>
                          {!tieneRol('DUENO') && enlaceWhatsApp(a) && (
                            <a className="btn btn-sm btn-success" href={enlaceWhatsApp(a)} target="_blank"
                               rel="noreferrer" title="Enviar recordatorio por WhatsApp">
                              <i className="fab fa-whatsapp"></i>
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Especies */}
            <div className="col-lg-5">
              <div className="section-card h-100 mb-0">
                <div className="tarjeta-titulo">
                  <h2><i className="fas fa-chart-pie"></i> Mascotas por especie</h2>
                </div>
                <Dona datos={resumen.mascotasPorEspecie} />
              </div>
            </div>

            {/* Eventos por mes */}
            <div className="col-lg-6">
              <div className="section-card h-100 mb-0">
                <div className="tarjeta-titulo">
                  <h2><i className="fas fa-chart-column"></i> Atenciones por mes</h2>
                  <span className="text-muted small">Ultimos 6 meses</span>
                </div>
                <Columnas datos={resumen.eventosPorMes} />
              </div>
            </div>

            {/* Eventos por tipo */}
            <div className="col-lg-6">
              <div className="section-card h-100 mb-0">
                <div className="tarjeta-titulo">
                  <h2><i className="fas fa-chart-bar"></i> Eventos por tipo</h2>
                </div>
                <BarrasHorizontales datos={resumen.eventosPorTipo} />
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="col-12">
              <div className="section-card mb-0">
                <div className="tarjeta-titulo">
                  <h2><i className="fas fa-clock-rotate-left"></i> Actividad reciente</h2>
                  <Link to="/eventos" className="small">Ver todo el historial</Link>
                </div>
                {resumen.actividadReciente.length === 0 ? (
                  <p className="text-muted small mb-0">Aun no hay eventos medicos registrados.</p>
                ) : (
                  <ul className="linea-tiempo compacta">
                    {resumen.actividadReciente.map((e) => (
                      <li key={e.id}>
                        <span className="lt-fecha">{formatearFecha(e.fechaAplicacion)}</span>
                        <span>
                          <strong>{e.mascota?.nombre}</strong> &middot; {e.tipoEvento.toLowerCase()}
                          {e.veterinario && <span className="text-muted small"> &middot; {e.veterinario}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Dashboard
