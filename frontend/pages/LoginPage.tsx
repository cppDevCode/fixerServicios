import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { guardarSesionUsuario } from '../services/sesion.service';
import { obtenerPrestadores } from '../services/prestador.service';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
        const usuario = result.data.usuario;

        if (usuario.rol === 'PRESTADOR') {
          let idPrestador = Number(usuario.prestadorId);

          if (!Number.isInteger(idPrestador) || idPrestador <= 0) {
            try {
              const respuestaPrestadores = await obtenerPrestadores({
                limit: 100,
                search: `${usuario.nombre} ${usuario.apellido ?? ''}`.trim(),
              });

              const prestadorEncontrado = respuestaPrestadores.datos.find(
                (p) =>
                  p.nombre.toLowerCase().trim() ===
                    String(usuario.nombre ?? '').toLowerCase().trim() &&
                  p.apellido.toLowerCase().trim() ===
                    String(usuario.apellido ?? '').toLowerCase().trim()
              );

              if (prestadorEncontrado) {
                idPrestador = prestadorEncontrado.id;
              }
            } catch {
              // Mantiene respaldo de prestadorId
            }
          }

          if (!Number.isInteger(idPrestador) || idPrestador <= 0) {
            idPrestador = Number(localStorage.getItem('prestadorId')) || 1;
          }

          const usuarioConFicha = {
            ...usuario,
            prestadorId: idPrestador,
          };

          guardarSesionUsuario(result.data.token, usuarioConFicha);
          navigate(`/prestadores/${idPrestador}`);
        } else if (usuario.rol === 'ADMIN') {
          guardarSesionUsuario(result.data.token, usuario);
          navigate('/prestadores');
        } else {
          guardarSesionUsuario(result.data.token, usuario);
          navigate('/');
        }
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
          <h2 className="registro-titulo">Iniciar Sesión</h2>
          <p className="auth-subtitle">
            Soluciones para tu hogar
          </p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nombre@mail.com"
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>

            <div className="password-input-wrapper">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="form-input"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="password-toggle"
                aria-label={
                  mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                aria-pressed={mostrarPassword}
              >
                {mostrarPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/recuperar-password" className="auth-link">
            ¿Olvidaste tu contraseña?
          </Link>

          <Link to="/registro" className="auth-link-gray">
            ¿No tenés cuenta? <span>Registrate</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
