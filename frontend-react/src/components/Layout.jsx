import { Outlet } from 'react-router-dom'

import Navbar from './Navbar'
import VigilanteSesion from './comunes/VigilanteSesion'

/**
 * Plantilla comun de las paginas privadas: barra de navegacion arriba,
 * contenido de la ruta actual (<Outlet />) y pie de pagina.
 */
const Layout = () => (
  <>
    <VigilanteSesion />
    <Navbar />
    <main className="page-container">
      <Outlet />
    </main>
    <footer className="pie no-print">
      Universidad Industrial de Santander &middot; Entornos de Programacion 2026-II &middot; Grupo 02
    </footer>
  </>
)

export default Layout
