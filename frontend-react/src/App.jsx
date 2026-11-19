import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './components/Login'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import RequiereRol from './components/comunes/RequiereRol'

import Dashboard from './components/Dashboard'
import UsuarioList from './components/UsuarioList'
import UsuarioForm from './components/UsuarioForm'
import MascotaList from './components/MascotaList'
import MascotaForm from './components/MascotaForm'
import Pasaporte from './components/Pasaporte'
import EventoList from './components/EventoList'
import EventoForm from './components/EventoForm'
import Calendario from './components/Calendario'
import Perfil from './components/Perfil'
import NoEncontrado from './components/NoEncontrado'

/**
 * Componente raiz: define las rutas de la aplicacion con React Router DOM.
 *
 * - /login es publica.
 * - Todas las demas cuelgan de una ruta "padre" protegida por PrivateRoute
 *   que pinta el Layout (navbar + pie); cada hija se dibuja en su <Outlet />.
 * - Las pantallas de usuarios ademas se protegen por rol con RequiereRol.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta publica */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas (requieren token JWT) */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />

          {/* --- Usuarios (CRUD de Jhon) --- */}
          <Route path="/usuarios" element={<RequiereRol roles={['ADMIN', 'VETERINARIO']}><UsuarioList /></RequiereRol>} />
          <Route path="/usuarios/crear" element={<RequiereRol roles={['ADMIN']}><UsuarioForm /></RequiereRol>} />
          <Route path="/usuarios/editar/:id" element={<RequiereRol roles={['ADMIN']}><UsuarioForm /></RequiereRol>} />

          {/* --- Mascotas (CRUD de David) --- */}
          <Route path="/mascotas" element={<MascotaList />} />
          <Route path="/mascotas/crear" element={<MascotaForm />} />
          <Route path="/mascotas/editar/:id" element={<MascotaForm />} />
          <Route path="/mascotas/:id/pasaporte" element={<Pasaporte />} />

          {/* --- Eventos Medicos (CRUD de Juan Diego) --- */}
          <Route path="/eventos" element={<EventoList />} />
          <Route path="/eventos/crear" element={<EventoForm />} />
          <Route path="/eventos/editar/:id" element={<EventoForm />} />

          {/* --- Funciones adicionales --- */}
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* Cualquier otra ruta */}
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
