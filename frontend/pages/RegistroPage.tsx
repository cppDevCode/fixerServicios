
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { Eye, EyeOff } from 'lucide-react';

export const RegistroPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    preguntaSecreta: '¿Nombre de tu primera mascota?',
    respuestaSecreta: '',
    esPrestador: false,
    especialidad: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = '/api/v1';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setFormData({ ...formData, [target.name]: value });
  };

    const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.code === 201) {
        if (result.data.prestador) {
          localStorage.setItem('prestadorId', result.data.prestador.id.toString());
        }
        
        setSuccess('¡Registro exitoso! Redirigiendo al inicio de sesión...');
        
        setTimeout(() => navigate('/login'), 2000);
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
    <div className="auth-container-registro">
      <div className="registro-wrapper">
        <div className="registro-formulario">
          <div className="auth-header" style={{ textAlign: 'left' }}>
            <h1 className="auth-logo" style={{ justifyContent: 'flex-start' }}>
              Fixer
            </h1>
            <h2 className="registro-titulo">Creá tu cuenta en Fixer</h2>

            <p className="auth-subtitle">
              Unite a la comunidad que más resuelve problemas del hogar.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleRegistro} className="auth-form">
            <div className="checkbox-prestador">
              <input
                type="checkbox"
                id="esPrestador"
                name="esPrestador"
                checked={formData.esPrestador}
                onChange={handleChange}
              />

              <label htmlFor="esPrestador">
                <strong>Quiero ofrecer servicios profesionales</strong>
                <span>
                  Soy un profesional de oficios (plomería, electricidad, gas,
                  etc.) y quiero captar nuevos clientes.
                </span>
              </label>
            </div>

            {formData.esPrestador && (
              <div className="form-group">
                <label className="form-label">Especialidad</label>

                <select
                  name="especialidad"
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccioná tu especialidad...</option>
                  <option value="Albañilería">Albañilería</option>
                  <option value="Carpintería">Carpintería</option>
                  <option value="Cerrajería">Cerrajería</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Gasista">Gasista</option>
                  <option value="Jardinería">Jardinería</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Plomería">Plomería</option>
                  <option value="Refrigeración">Refrigeración</option>
                </select>
              </div>
            )}

           
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej: Martina Gómez"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  required
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>

              <input
                type="email"
                name="email"
                required
                onChange={handleChange}
                className="form-input"
                placeholder="martina@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña segura</label>

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Pregunta secreta de recuperación
              </label>

              <select
                name="preguntaSecreta"
                onChange={handleChange}
                className="form-select"
              >
                <option value="¿Nombre de tu primera mascota?">
                  ¿Nombre de tu primera mascota?
                </option>
                <option value="¿Ciudad de nacimiento?">
                  ¿Ciudad de nacimiento?
                </option>
                <option value="¿Nombre de tu mejor amigo de la infancia?">
                  ¿Nombre de tu mejor amigo de la infancia?
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Respuesta secreta</label>

              <input
                type="text"
                name="respuestaSecreta"
                required
                onChange={handleChange}
                className="form-input"
                placeholder="Tu respuesta secreta (sensible a mayúsculas)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading
                ? 'Registrando...'
                : formData.esPrestador
                  ? 'Crear Cuenta de Prestador'
                  : 'Crear Cuenta de Cliente'}
            </button>
          </form>

          <div className="auth-links" style={{ textAlign: 'center' }}>
            <Link to="/login" className="auth-link-gray">
              ¿Ya tenés una cuenta? <span>Iniciar sesión</span>
            </Link>
          </div>
        </div>

        <div className="registro-imagen">
          <div className="registro-imagen-contenido">
            {formData.esPrestador ? (
              <>
                <h2>Hacé crecer tu negocio con Fixer</h2>
                <p>
                  Sumate a la red de profesionales más grande del país. Conseguí nuevos
                  clientes, gestioná tu agenda y hacé que tu trabajo hable por vos.
                </p>
              </>
            ) : (
              <>
                <h2>Tu casa en manos de personas de confianza.</h2>
                <p>
                  Despedite de la incertidumbre al buscar presupuestos y especialistas
                  para tu hogar.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
