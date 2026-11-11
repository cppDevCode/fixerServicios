import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export const RegistroPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '', preguntaSecreta: '¿Nombre de tu primera mascota?', respuestaSecreta: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = 'http://localhost:3000/api/v1';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.code === 201) {
        alert('¡Registro exitoso! Ahora podés iniciar sesión.');
        navigate('/login');
      } else {
        setError(result.msg || 'Error al registrar');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-logo">Crear Cuenta</h1>
          <p className="auth-subtitle">Completá tus datos para registrarte en Fixer</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegistro} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input type="text" name="nombre" required onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input type="text" name="apellido" required onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" name="email" required onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" name="password" required onChange={handleChange} className="form-input" />
          </div>
          <hr className="form-divider" />
          <p className="form-section-title">Pregunta Secreta</p>
          <div className="form-group">
            <select name="preguntaSecreta" onChange={handleChange} className="form-select">
              <option value="¿Nombre de tu primera mascota?">¿Nombre de tu primera mascota?</option>
              <option value="¿Ciudad de nacimiento?">¿Ciudad de nacimiento?</option>
              <option value="¿Nombre de tu mejor amigo de la infancia?">¿Nombre de tu mejor amigo de la infancia?</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tu Respuesta Secreta</label>
            <input type="text" name="respuestaSecreta" required onChange={handleChange} className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login" className="auth-link-gray">¿Ya tenés cuenta? <span>Iniciá sesión</span></Link>
        </div>
      </div>
    </div>
  );
};