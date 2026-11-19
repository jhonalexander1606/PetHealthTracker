import { useMemo, useState, useEffect } from 'react'

/**
 * Hook personalizado para tablas: busqueda, filtros, ordenamiento y paginacion.
 *
 * Parametros:
 *   datos          -> arreglo completo que llego del backend
 *   camposBusqueda -> (fila) => [textos donde buscar]
 *   filtro         -> (fila) => true/false (filtros adicionales de la pantalla)
 *   ordenInicial   -> { campo: (fila) => valor, clave: 'nombre', asc: true }
 *
 * Devuelve las filas de la pagina actual y todo lo necesario para pintar
 * el buscador, los encabezados ordenables y el paginador.
 */
const useTabla = ({ datos, camposBusqueda, filtro, accesores = {}, ordenInicial, porPagina = 10 }) => {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState(ordenInicial || { clave: null, asc: true })
  const [pagina, setPagina] = useState(1)
  const [tamano, setTamano] = useState(porPagina)

  const normalizar = (t) =>
    String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda.trim())
    let res = datos.filter((fila) => (filtro ? filtro(fila) : true))
    if (q) {
      res = res.filter((fila) => camposBusqueda(fila).some((c) => normalizar(c).includes(q)))
    }
    if (orden.clave) {
      const obtener = accesores[orden.clave] || ((f) => f[orden.clave])
      res = [...res].sort((a, b) => {
        const va = obtener(a)
        const vb = obtener(b)
        let c
        if (typeof va === 'number' && typeof vb === 'number') c = va - vb
        else c = normalizar(va).localeCompare(normalizar(vb), 'es', { numeric: true })
        return orden.asc ? c : -c
      })
    }
    return res
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, busqueda, orden, filtro])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / tamano))

  // Si cambia la busqueda, el filtro o el orden, volver a la primera pagina
  useEffect(() => { setPagina(1) }, [busqueda, filtro, tamano, orden])
  useEffect(() => { if (pagina > totalPaginas) setPagina(totalPaginas) }, [pagina, totalPaginas])

  const inicio = (pagina - 1) * tamano
  const filasPagina = filtradas.slice(inicio, inicio + tamano)

  const ordenarPor = (clave) =>
    setOrden((o) => ({ clave, asc: o.clave === clave ? !o.asc : true }))

  return {
    busqueda, setBusqueda,
    orden, ordenarPor,
    pagina, setPagina, totalPaginas,
    tamano, setTamano,
    filtradas, filasPagina,
    desde: filtradas.length === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + tamano, filtradas.length)
  }
}

export default useTabla
