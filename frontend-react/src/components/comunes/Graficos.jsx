/**
 * Graficas hechas solo con SVG/CSS (sin librerias externas).
 *  - BarrasHorizontales: cantidad por categoria (ej. eventos por tipo)
 *  - Dona: proporcion por categoria (ej. mascotas por especie)
 *  - Columnas: serie en el tiempo (ej. eventos por mes)
 */

export const PALETA = ['#16a085', '#3498db', '#e67e22', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c', '#34495e']

export const BarrasHorizontales = ({ datos }) => {
  const entradas = Object.entries(datos || {})
  if (entradas.length === 0) return <p className="text-muted small mb-0">Sin datos para mostrar.</p>
  const max = Math.max(...entradas.map(([, v]) => v))
  return (
    <div className="barras-h">
      {entradas.map(([etiqueta, valor], i) => (
        <div key={etiqueta} className="barra-fila" title={`${etiqueta}: ${valor}`}>
          <span className="barra-etiqueta">{etiqueta.toLowerCase()}</span>
          <div className="barra-pista">
            <div
              className="barra-relleno"
              style={{ width: `${(valor / max) * 100}%`, background: PALETA[i % PALETA.length] }}
            />
          </div>
          <span className="barra-valor">{valor}</span>
        </div>
      ))}
    </div>
  )
}

export const Dona = ({ datos }) => {
  const entradas = Object.entries(datos || {})
  const total = entradas.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return <p className="text-muted small mb-0">Sin datos para mostrar.</p>

  const radio = 15.9155 // circunferencia = 100 -> cada % es 1 unidad de trazo
  let acumulado = 0
  return (
    <div className="dona-contenedor">
      <svg viewBox="0 0 42 42" className="dona" role="img" aria-label="Distribucion por especie">
        <circle cx="21" cy="21" r={radio} fill="transparent" stroke="var(--pet-border)" strokeWidth="6" />
        {entradas.map(([etiqueta, valor], i) => {
          const porcentaje = (valor / total) * 100
          const segmento = (
            <circle
              key={etiqueta}
              cx="21" cy="21" r={radio}
              fill="transparent"
              stroke={PALETA[i % PALETA.length]}
              strokeWidth="6"
              strokeDasharray={`${porcentaje} ${100 - porcentaje}`}
              strokeDashoffset={25 - acumulado}
            >
              <title>{`${etiqueta}: ${valor} (${porcentaje.toFixed(0)}%)`}</title>
            </circle>
          )
          acumulado += porcentaje
          return segmento
        })}
        <text x="21" y="20.5" textAnchor="middle" className="dona-total">{total}</text>
        <text x="21" y="25.5" textAnchor="middle" className="dona-sub">mascotas</text>
      </svg>
      <ul className="leyenda">
        {entradas.map(([etiqueta, valor], i) => (
          <li key={etiqueta}>
            <span className="leyenda-color" style={{ background: PALETA[i % PALETA.length] }} />
            {etiqueta} <strong className="ms-auto">{valor}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const Columnas = ({ datos }) => {
  if (!datos || datos.length === 0) return <p className="text-muted small mb-0">Sin datos para mostrar.</p>
  const max = Math.max(1, ...datos.map((d) => d.total))
  return (
    <div className="columnas">
      {datos.map((d) => {
        const [anio, mes] = d.mes.split('-').map(Number)
        return (
          <div key={d.mes} className="columna" title={`${MESES[mes - 1]} ${anio}: ${d.total} evento(s)`}>
            <span className="columna-valor">{d.total}</span>
            <div className="columna-pista">
              <div className="columna-relleno" style={{ height: `${(d.total / max) * 100}%` }} />
            </div>
            <span className="columna-etiqueta">{MESES[mes - 1]}</span>
          </div>
        )
      })}
    </div>
  )
}
