import { useState } from 'react'

/** Puntaje 0-4 de la fortaleza de una contrasena. */
export const fortaleza = (p) => {
  if (!p) return 0
  let puntos = 0
  if (p.length >= 6) puntos++
  if (p.length >= 10) puntos++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) puntos++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) puntos++
  else if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) puntos += 0.5
  return Math.min(4, Math.floor(puntos))
}

const NIVELES = [
  { texto: 'Muy debil', clase: 'bg-danger' },
  { texto: 'Debil', clase: 'bg-danger' },
  { texto: 'Aceptable', clase: 'bg-warning' },
  { texto: 'Buena', clase: 'bg-info' },
  { texto: 'Fuerte', clase: 'bg-success' }
]

/**
 * Campo de contrasena con boton para mostrar/ocultar y, opcionalmente,
 * medidor de fortaleza.
 */
const CampoPassword = ({ id, name, value, onChange, onBlur, invalido, medidor = false,
                         placeholder, autoComplete = 'new-password', disabled }) => {
  const [visible, setVisible] = useState(false)
  const nivel = fortaleza(value)
  return (
    <>
      <div className="input-group has-validation">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          name={name}
          className={`form-control ${invalido ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={100}
        />
        <button type="button" className="btn btn-outline-secondary" onClick={() => setVisible(!visible)}
                aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'} tabIndex={-1}>
          <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
        {invalido && <div className="invalid-feedback">{invalido}</div>}
      </div>
      {medidor && value && (
        <div className="medidor mt-1" aria-live="polite">
          <div className="progress" style={{ height: 5 }}>
            <div className={`progress-bar ${NIVELES[nivel].clase}`} style={{ width: `${(nivel + 1) * 20}%` }} />
          </div>
          <small className="text-muted">Seguridad: {NIVELES[nivel].texto}</small>
        </div>
      )}
    </>
  )
}

export default CampoPassword
