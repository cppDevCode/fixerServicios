import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  guardarSesionUsuario,
  obtenerRutaInicioPorRol,
} from '../services/sesion.service';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = '/api/v1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.code === 200) {
        guardarSesionUsuario(result.data.token, result.data.usuario);
        navigate(obtenerRutaInicioPorRol(result.data.usuario));
      } else {
        setError(result.msg || 'Credenciales inválidas');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">🔧 Fixer</h1>
          <p className="auth-subtitle">Soluciones para tu hogar</p>
        </div>
        <h2 className="auth-title">Iniciar Sesión</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nombre@mail.com" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/recuperar-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
          <Link to="/registro" className="auth-link-gray">¿No tenés cuenta? <span>Registrate</span></Link>
        </div>
      </div>
    </div>
  );
};