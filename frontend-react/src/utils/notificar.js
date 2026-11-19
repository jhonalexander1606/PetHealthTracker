import Swal from 'sweetalert2'

/**
 * Notificaciones tipo "toast" (esquina superior derecha, no bloquean la
 * pantalla). Se usan para confirmar acciones exitosas; los errores y las
 * confirmaciones de borrado siguen usando la alerta modal de SweetAlert2.
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export const exito = (titulo) => Toast.fire({ icon: 'success', title: titulo })
export const info = (titulo) => Toast.fire({ icon: 'info', title: titulo })
export const aviso = (titulo) => Toast.fire({ icon: 'warning', title: titulo })

/** Mensaje de error del backend ({Mensaje}) o un texto por defecto. */
export const mensajeError = (error, porDefecto) =>
  error?.response?.data?.Mensaje ||
  (error?.code === 'ERR_NETWORK' ? 'No hay conexion con el servidor (backend apagado?)' : porDefecto)

/** Confirmacion de eliminacion estandar de la aplicacion. */
export const confirmarEliminacion = (texto) =>
  Swal.fire({
    title: 'Esta seguro?',
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e74c3c',
    reverseButtons: true,
    focusCancel: true
  }).then((r) => r.isConfirmed)
