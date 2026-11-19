/**
 * Modo claro / oscuro.
 * Bootstrap 5.3 cambia todos sus colores con el atributo data-bs-theme en
 * <html>; nuestros estilos propios usan variables CSS que tambien cambian.
 * La preferencia se guarda en localStorage.
 */
const CLAVE = 'pethealth-tema'

export const temaGuardado = () => {
  try {
    const t = localStorage.getItem(CLAVE)
    if (t === 'dark' || t === 'light') return t
  } catch { /* almacenamiento no disponible */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const aplicarTema = (tema) => {
  document.documentElement.setAttribute('data-bs-theme', tema)
  try { localStorage.setItem(CLAVE, tema) } catch { /* ignorar */ }
}
