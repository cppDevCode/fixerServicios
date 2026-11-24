import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export const RecuperarPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [preguntaSecreta, setPreguntaSecreta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = '/api/v1';

  const handleBuscarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/pregunta-secreta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setPreguntaSecreta(result.data.preguntaSecreta);
        setStep(2);
      } else {
        setError(result.msg || 'No se encontró el usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, respuesta }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setStep(3);
      } else {
        setError(result.msg || 'Respuesta incorrecta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nuevaPassword }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSuccess('¡Contraseña actualizada! Redirigiendo...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.msg || 'Error al actualizar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Recuperar Contraseña</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleBuscarPregunta} className="auth-form">
            <p className="form-section-title">
              Paso 1: Ingresá tu email.
            </p>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Buscando...' : 'Buscar Pregunta'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleValidarRespuesta} className="auth-form">
            <p className="form-section-title">
              Paso 2: Respondé tu pregunta secreta.
            </p>

            <p
              className="form-label"
              style={{ color: '#1E293B', fontWeight: 600 }}
            >
              {preguntaSecreta}
            </p>

            <div className="form-group">
              <label className="form-label">Tu Respuesta</label>
              <input
                type="text"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Validando...' : 'Validar Respuesta'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCambiarPassword} className="auth-form">
            <p className="form-section-title">
              Paso 3: Nueva contraseña.
            </p>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>

              <div className="password-input-wrapper">
                <input
                  type={mostrarNuevaPassword ? 'text' : 'password'}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                  className="password-toggle"
                  aria-label={
                    mostrarNuevaPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  aria-pressed={mostrarNuevaPassword}
                >
                  {mostrarNuevaPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>

              <div className="password-input-wrapper">
                <input
                  type={mostrarConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfirmPassword(!mostrarConfirmPassword)
                  }
                  className="password-toggle"
                  aria-label={
                    mostrarConfirmPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  aria-pressed={mostrarConfirmPassword}
                >
                  {mostrarConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login" className="auth-link-gray">
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};
