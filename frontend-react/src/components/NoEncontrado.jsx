import { Link } from 'react-router-dom'

/** Pagina 404 para rutas que no existen. */
const NoEncontrado = () => (
  <div className="section-card text-center py-5">
    <div className="display-1 fw-bold text-pet">404</div>
    <h2 className="h4 mb-2"><i className="fas fa-dog me-2"></i>Esta pagina se escapo a pasear</h2>
    <p className="text-muted mb-4">La direccion que busca no existe o fue movida.</p>
    <Link to="/" className="btn btn-pet"><i className="fas fa-house me-1"></i> Volver al panel</Link>
  </div>
)

export default NoEncontrado
