import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Estilos globales (siguen el orden del PDF del profe)
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles.css'

import { aplicarTema, temaGuardado } from './utils/tema'

// Aplicar el tema guardado (claro/oscuro) antes de pintar la aplicacion
aplicarTema(temaGuardado())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
