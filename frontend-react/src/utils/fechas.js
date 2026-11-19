/**
 * Utilidades de fechas y del estado sanitario de las dosis.
 *
 * Las fechas del backend llegan como texto "AAAA-MM-DD" (LocalDate de Java).
 * Se manejan como fechas locales (sin zona horaria) para que "2026-11-13"
 * no se convierta en el 12 de noviembre por la diferencia con UTC.
 */

/** Dias de anticipacion con que se avisa una proxima dosis. */
export const DIAS_ALERTA = 30

/** Convierte "AAAA-MM-DD" en Date local (medianoche). */
export const aFecha = (texto) => {
  if (!texto) return null
  const [a, m, d] = String(texto).substring(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d)
}

/** Fecha de hoy a medianoche. */
export const hoy = () => {
  const h = new Date()
  return new Date(h.getFullYear(), h.getMonth(), h.getDate())
}

/** Date -> "AAAA-MM-DD" (formato que espera el input date y el backend). */
export const aTexto = (fecha) => {
  const f = fecha instanceof Date ? fecha : aFecha(fecha)
  if (!f) return ''
  const mm = String(f.getMonth() + 1).padStart(2, '0')
  const dd = String(f.getDate()).padStart(2, '0')
  return `${f.getFullYear()}-${mm}-${dd}`
}

export const hoyTexto = () => aTexto(hoy())

export const sumarDias = (fecha, dias) => {
  const f = fecha instanceof Date ? new Date(fecha) : aFecha(fecha)
  f.setDate(f.getDate() + dias)
  return f
}

/** Dias desde hoy hasta la fecha (negativo si ya paso). */
export const diasHasta = (texto) => {
  const f = aFecha(texto)
  if (!f) return null
  return Math.round((f - hoy()) / 86400000)
}

/** "13 nov 2026" */
export const formatearFecha = (texto, opciones) => {
  const f = aFecha(texto)
  if (!f) return '-'
  return f.toLocaleDateString('es-CO', opciones || { year: 'numeric', month: 'short', day: 'numeric' })
}

/** "en 5 dias", "hace 3 dias", "hoy", "manana", "ayer" */
export const textoRelativo = (dias) => {
  if (dias === null || dias === undefined) return ''
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'manana'
  if (dias === -1) return 'ayer'
  return dias > 0 ? `en ${dias} dias` : `hace ${Math.abs(dias)} dias`
}

/**
 * Calcula el estado sanitario de cada evento medico.
 *
 * Para cada combinacion (mascota, tipo de evento) solo cuenta el evento MAS
 * RECIENTE; los anteriores quedan como RENOVADO (ya se volvio a aplicar).
 * Del mas reciente se mira la fecha de proxima dosis:
 *   - ya paso                       -> VENCIDA
 *   - dentro de los proximos 30 dias -> PROXIMA
 *   - mas adelante                   -> AL_DIA
 *   - sin proxima dosis              -> SIN_REFUERZO
 *
 * Es la misma regla que aplica el backend en /api/dashboard/resumen.
 * Devuelve un objeto { idEvento: { estado, dias } }.
 */
export const calcularEstados = (eventos) => {
  const ultimos = {}
  eventos.forEach((e) => {
    const clave = `${e.mascota?.id}|${e.tipoEvento}`
    const previo = ultimos[clave]
    if (!previo || esMasReciente(e, previo)) ultimos[clave] = e
  })

  const estados = {}
  eventos.forEach((e) => {
    const clave = `${e.mascota?.id}|${e.tipoEvento}`
    if (ultimos[clave].id !== e.id) {
      estados[e.id] = { estado: 'RENOVADO', dias: null }
      return
    }
    if (!e.fechaProximaDosis) {
      estados[e.id] = { estado: 'SIN_REFUERZO', dias: null }
      return
    }
    const dias = diasHasta(e.fechaProximaDosis)
    let estado = 'AL_DIA'
    if (dias < 0) estado = 'VENCIDA'
    else if (dias <= DIAS_ALERTA) estado = 'PROXIMA'
    estados[e.id] = { estado, dias }
  })
  return estados
}

const esMasReciente = (a, b) => {
  const c = (a.fechaAplicacion || '').localeCompare(b.fechaAplicacion || '')
  return c !== 0 ? c > 0 : a.id > b.id
}

/** Estado general de una mascota segun el peor estado de sus eventos. */
export const estadoGeneral = (eventosMascota) => {
  const estados = Object.values(calcularEstados(eventosMascota)).map((x) => x.estado)
  if (estados.includes('VENCIDA')) return 'VENCIDA'
  if (estados.includes('PROXIMA')) return 'PROXIMA'
  if (eventosMascota.length === 0) return 'SIN_REGISTROS'
  return 'AL_DIA'
}

/**
 * Sugerencia de proxima dosis segun el tipo de evento (protocolos usuales):
 * vacunas anuales, desparasitacion trimestral.
 */
export const DIAS_REFUERZO = {
  'VACUNA ANTIRRABICA': 365,
  'VACUNA TRIPLE FELINA': 365,
  'VACUNA POLIVALENTE': 365,
  DESPARASITACION: 90
}

/** "noviembre de 2026" -> "Noviembre de 2026" (solo la primera letra). */
export const capitalizar = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)
