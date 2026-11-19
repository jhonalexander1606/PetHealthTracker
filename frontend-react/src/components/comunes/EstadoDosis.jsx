import { textoRelativo } from '../../utils/fechas'

/**
 * Insignia de color con el estado sanitario de una dosis o de una mascota.
 */
const CONFIG = {
  VENCIDA: { clase: 'estado-vencida', icono: 'fa-circle-exclamation', texto: 'Vencida' },
  PROXIMA: { clase: 'estado-proxima', icono: 'fa-clock', texto: 'Proxima' },
  AL_DIA: { clase: 'estado-aldia', icono: 'fa-circle-check', texto: 'Al dia' },
  RENOVADO: { clase: 'estado-neutro', icono: 'fa-rotate', texto: 'Renovado' },
  SIN_REFUERZO: { clase: 'estado-neutro', icono: 'fa-minus', texto: 'Sin refuerzo' },
  SIN_REGISTROS: { clase: 'estado-neutro', icono: 'fa-file-circle-question', texto: 'Sin registros' }
}

const EstadoDosis = ({ estado, dias, mostrarDias = false }) => {
  const c = CONFIG[estado] || CONFIG.SIN_REFUERZO
  return (
    <span className={`estado-badge ${c.clase}`}>
      <i className={`fas ${c.icono} me-1`}></i>
      {c.texto}
      {mostrarDias && dias !== null && dias !== undefined && (estado === 'VENCIDA' || estado === 'PROXIMA') && (
        <span className="ms-1 fw-normal">({textoRelativo(dias)})</span>
      )}
    </span>
  )
}

export default EstadoDosis
