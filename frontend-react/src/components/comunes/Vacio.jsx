/** Estado vacio con icono, mensaje y accion opcional. */
const Vacio = ({ icono = 'fa-inbox', titulo, texto, children }) => (
  <div className="empty-box">
    <div className="icon"><i className={`fas ${icono}`}></i></div>
    <p className="fw-semibold mb-1">{titulo}</p>
    {texto && <p className="small mb-3">{texto}</p>}
    {children}
  </div>
)

export default Vacio
