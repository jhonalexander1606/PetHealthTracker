/**
 * Encabezado de tabla que ordena al hacer clic (asc / desc).
 */
const ColumnaOrdenable = ({ tabla, clave, children, className }) => {
  const activa = tabla.orden.clave === clave
  const icono = !activa ? 'fa-sort' : tabla.orden.asc ? 'fa-sort-up' : 'fa-sort-down'
  return (
    <th
      className={`th-ordenable ${activa ? 'activa' : ''} ${className || ''}`}
      onClick={() => tabla.ordenarPor(clave)}
      aria-sort={activa ? (tabla.orden.asc ? 'ascending' : 'descending') : 'none'}
    >
      {children} <i className={`fas ${icono} ms-1`}></i>
    </th>
  )
}

export default ColumnaOrdenable
