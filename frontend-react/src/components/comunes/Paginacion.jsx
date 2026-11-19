/**
 * Pie de tabla: "Mostrando 1-10 de 24", selector de filas por pagina y
 * botones de pagina. Recibe el objeto que devuelve el hook useTabla.
 */
const Paginacion = ({ tabla }) => {
  const { pagina, setPagina, totalPaginas, tamano, setTamano, desde, hasta, filtradas } = tabla

  // Ventana de maximo 5 numeros alrededor de la pagina actual
  const inicio = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
  const numeros = []
  for (let i = inicio; i <= Math.min(totalPaginas, inicio + 4); i++) numeros.push(i)

  return (
    <div className="tabla-pie">
      <div className="text-muted small">
        Mostrando <strong>{desde}</strong>–<strong>{hasta}</strong> de <strong>{filtradas.length}</strong>
        <select
          className="form-select form-select-sm d-inline-block ms-2"
          style={{ width: 'auto' }}
          value={tamano}
          onChange={(e) => setTamano(Number(e.target.value))}
          aria-label="Filas por pagina"
        >
          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} por pagina</option>)}
        </select>
      </div>

      <nav aria-label="Paginacion">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPagina(pagina - 1)} aria-label="Anterior">
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          {numeros.map((n) => (
            <li key={n} className={`page-item ${n === pagina ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPagina(n)}>{n}</button>
            </li>
          ))}
          <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPagina(pagina + 1)} aria-label="Siguiente">
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Paginacion
