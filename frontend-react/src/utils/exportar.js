/**
 * Exporta una lista de objetos a un archivo CSV que Excel abre directamente.
 *
 * columnas: [{ titulo: 'Nombre', valor: (fila) => fila.nombre }, ...]
 * Se usa ";" como separador y BOM UTF-8 para que Excel en espanol lo abra
 * con las columnas y tildes correctas.
 */
export const exportarCSV = (nombreArchivo, columnas, filas) => {
  const escapar = (v) => {
    const texto = v === null || v === undefined ? '' : String(v)
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }
  const encabezado = columnas.map((c) => escapar(c.titulo)).join(';')
  const cuerpo = filas.map((f) => columnas.map((c) => escapar(c.valor(f))).join(';'))
  const contenido = '﻿' + [encabezado, ...cuerpo].join('\r\n')

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  const fecha = new Date().toISOString().substring(0, 10)
  enlace.href = url
  enlace.download = `${nombreArchivo}_${fecha}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
