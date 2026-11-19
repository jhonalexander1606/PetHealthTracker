/** Esqueleto animado mientras llegan los datos del backend. */
const Cargando = ({ filas = 5, texto = 'Cargando...' }) => (
  <div className="esqueleto" aria-busy="true" aria-label={texto}>
    {Array.from({ length: filas }).map((_, i) => (
      <div key={i} className="esqueleto-fila" style={{ width: `${95 - (i % 3) * 12}%` }} />
    ))}
    <p className="text-muted small text-center mt-2 mb-0">
      <i className="fas fa-spinner fa-spin me-1"></i> {texto}
    </p>
  </div>
)

export default Cargando
