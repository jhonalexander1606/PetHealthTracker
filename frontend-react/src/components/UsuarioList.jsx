import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { getUsuarios, getUsuarioByCedula, deleteUsuario } from '../services/UsuarioService'
import { getMascotas } from '../services/MascotaService'
import { getUsuarioActual } from '../services/AuthService'
import { exportarCSV } from '../utils/exportar'
import { confirmarEliminacion, exito, mensajeError } from '../utils/notificar'
import useTabla from '../hooks/useTabla'
import Paginacion from './comunes/Paginacion'
import ColumnaOrdenable from './comunes/ColumnaOrdenable'
import Cargando from './comunes/Cargando'
import Vacio from './comunes/Vacio'

/**
 * Lista de usuarios (HU002, HU003, HU005) - CRUD de Jhon.
 *
 * - useEffect carga usuarios y mascotas en paralelo (para mostrar cuantas
 *   mascotas tiene cada dueno).
 * - Busqueda instantanea en la tabla + busqueda exacta por cedula contra el
 *   backend (GET /api/usuarios/cedula/{n}, HU003).
 * - Filtro por rol, orden por columnas, paginacion y exportar a Excel.
 * - Solo ADMIN ve los botones de crear, editar y eliminar (el backend
 *   tambien lo exige con 403).
 */
const UsuarioList = () => {
  const navigate = useNavigate()
  const usuarioActual = getUsuarioActual()
  const esAdmin = usuarioActual?.rol === 'ADMIN'

  const [usuarios, setUsuarios] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [rol, setRol] = useState('')
  const [cedula, setCedula] = useState('')
  const [resultadoCedula, setResultadoCedula] = useState(null)

  const cargar = () => {
    setCargando(true)
    Promise.all([getUsuarios(), getMascotas()])
      .then(([rUsuarios, rMascotas]) => {
        setUsuarios(rUsuarios.data)
        setMascotas(rMascotas.data)
      })
      .catch((e) => Swal.fire('Error', mensajeError(e, 'No se pudieron cargar los usuarios'), 'error'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const mascotasPorUsuario = useMemo(() => {
    const conteo = {}
    mascotas.forEach((m) => { conteo[m.usuario?.id] = (conteo[m.usuario?.id] || 0) + 1 })
    return conteo
  }, [mascotas])

  const conteoRoles = useMemo(() => {
    const c = { ADMIN: 0, VETERINARIO: 0, DUENO: 0 }
    usuarios.forEach((u) => { c[u.rol] = (c[u.rol] || 0) + 1 })
    return c
  }, [usuarios])

  const filtro = useCallback(
    (u) => (!rol || u.rol === rol) && (!resultadoCedula || u.id === resultadoCedula),
    [rol, resultadoCedula]
  )

  const tabla = useTabla({
    datos: usuarios,
    filtro,
    camposBusqueda: (u) => [u.nombreCompleto, u.email, u.nombreUsuario, u.numeroDocumento, u.telefono],
    accesores: { mascotas: (u) => mascotasPorUsuario[u.id] || 0 },
    ordenInicial: { clave: 'nombreCompleto', asc: true }
  })

  // Busqueda exacta por cedula en el backend (HU003)
  const buscarPorCedula = () => {
    const valor = cedula.trim()
    if (!valor) { setResultadoCedula(null); return }
    getUsuarioByCedula(valor)
      .then((r) => {
        const u = r.data?.Usuario
        if (u) {
          setResultadoCedula(u.id)
          exito(`Encontrado: ${u.nombreCompleto}`)
        }
      })
      .catch(() => {
        setResultadoCedula(null)
        Swal.fire('Sin resultados', `No existe un usuario con documento ${valor}`, 'info')
      })
  }

  const limpiarCedula = () => { setCedula(''); setResultadoCedula(null) }

  const eliminarUsuario = async (u) => {
    const ok = await confirmarEliminacion(`Se eliminara la cuenta de ${u.nombreCompleto} (@${u.nombreUsuario}).`)
    if (!ok) return
    deleteUsuario(u.id)
      .then(() => {
        setUsuarios((lista) => lista.filter((x) => x.id !== u.id))
        exito('Usuario eliminado')
      })
      .catch((err) => Swal.fire('No se pudo eliminar', mensajeError(err, 'Error al eliminar el usuario'), 'error'))
  }

  const exportar = () =>
    exportarCSV('usuarios', [
      { titulo: 'ID', valor: (u) => u.id },
      { titulo: 'Tipo documento', valor: (u) => u.tipoDocumento?.tipo },
      { titulo: 'Documento', valor: (u) => u.numeroDocumento },
      { titulo: 'Nombre completo', valor: (u) => u.nombreCompleto },
      { titulo: 'Email', valor: (u) => u.email },
      { titulo: 'Telefono', valor: (u) => u.telefono },
      { titulo: 'Usuario', valor: (u) => u.nombreUsuario },
      { titulo: 'Rol', valor: (u) => u.rol },
      { titulo: 'Mascotas', valor: (u) => mascotasPorUsuario[u.id] || 0 }
    ], tabla.filtradas)

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fas fa-users"></i> Gestion de Usuarios
          </h2>
          <p className="section-subtitle">
            Duenos de mascotas, veterinarios y administradores (CRUD a cargo de Jhon)
          </p>
        </div>
        {esAdmin && (
          <button className="btn btn-pet" onClick={() => navigate('/usuarios/crear')}>
            <i className="fas fa-user-plus me-1"></i> Nuevo Usuario
          </button>
        )}
      </div>

      {!esAdmin && (
        <div className="alert alert-info small py-2">
          <i className="fas fa-lock me-1"></i>
          Vista de solo lectura: unicamente los administradores pueden crear, editar o eliminar usuarios.
        </div>
      )}

      <div className="chips mb-3">
        <button className={`chip ${rol === '' ? 'activo' : ''}`} onClick={() => setRol('')}>
          Todos <span>{usuarios.length}</span>
        </button>
        <button className={`chip ${rol === 'ADMIN' ? 'activo' : ''}`} onClick={() => setRol('ADMIN')}>
          <i className="fas fa-user-shield"></i> Administradores <span>{conteoRoles.ADMIN}</span>
        </button>
        <button className={`chip ${rol === 'VETERINARIO' ? 'activo' : ''}`} onClick={() => setRol('VETERINARIO')}>
          <i className="fas fa-user-doctor"></i> Veterinarios <span>{conteoRoles.VETERINARIO}</span>
        </button>
        <button className={`chip ${rol === 'DUENO' ? 'activo' : ''}`} onClick={() => setRol('DUENO')}>
          <i className="fas fa-house-user"></i> Duenos <span>{conteoRoles.DUENO}</span>
        </button>
      </div>

      <div className="barra-herramientas">
        <div className="input-group buscador">
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input type="search" className="form-control" placeholder="Filtrar por nombre, correo, usuario..."
                 value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        </div>
        <div className="input-group" style={{ maxWidth: 290 }}>
          <input type="text" className="form-control" placeholder="Cedula exacta (servidor)"
                 value={cedula} onChange={(e) => setCedula(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && buscarPorCedula()} inputMode="numeric" />
          {resultadoCedula ? (
            <button className="btn btn-outline-secondary" onClick={limpiarCedula} title="Quitar busqueda">
              <i className="fas fa-xmark"></i>
            </button>
          ) : (
            <button className="btn btn-outline-secondary" onClick={buscarPorCedula} title="Buscar en el servidor">
              <i className="fas fa-id-card"></i>
            </button>
          )}
        </div>
        <button className="btn btn-outline-success ms-auto" onClick={exportar} disabled={tabla.filtradas.length === 0}>
          <i className="fas fa-file-excel me-1"></i> Exportar
        </button>
      </div>

      {cargando ? (
        <Cargando texto="Cargando usuarios..." />
      ) : tabla.filtradas.length === 0 ? (
        <Vacio icono="fa-user-slash" titulo="No hay usuarios para mostrar" />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <ColumnaOrdenable tabla={tabla} clave="nombreCompleto">Usuario</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="numeroDocumento">Documento</ColumnaOrdenable>
                  <th>Contacto</th>
                  <ColumnaOrdenable tabla={tabla} clave="rol">Rol</ColumnaOrdenable>
                  <ColumnaOrdenable tabla={tabla} clave="mascotas">Mascotas</ColumnaOrdenable>
                  {esAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {tabla.filasPagina.map((u) => (
                  <tr key={u.id} className={u.id === usuarioActual?.idUsuario ? 'fila-propia' : ''}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`avatar avatar-sm role-${u.rol}`}>
                          {u.nombreCompleto.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                        </span>
                        <span>
                          <strong>{u.nombreCompleto}</strong>
                          {u.id === usuarioActual?.idUsuario && <span className="badge text-bg-secondary ms-1">Tu</span>}
                          <small className="d-block text-muted">@{u.nombreUsuario}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted d-block">{u.tipoDocumento?.tipo}</small>
                      {u.numeroDocumento}
                    </td>
                    <td className="small">
                      <a href={`mailto:${u.email}`}>{u.email}</a>
                      <span className="d-block text-muted">{u.telefono || '-'}</span>
                    </td>
                    <td><span className={`role-badge role-${u.rol}`}>{u.rol}</span></td>
                    <td>
                      <span className="badge rounded-pill text-bg-light border">
                        <i className="fas fa-paw me-1 text-pet"></i>{mascotasPorUsuario[u.id] || 0}
                      </span>
                    </td>
                    {esAdmin && (
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-warning" title="Editar"
                                  onClick={() => navigate(`/usuarios/editar/${u.id}`)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" title="Eliminar"
                                  onClick={() => eliminarUsuario(u)}
                                  disabled={u.id === usuarioActual?.idUsuario}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion tabla={tabla} />
        </>
      )}
    </div>
  )
}

export default UsuarioList
