// frontend/pages/RegistroPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const RegistroPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    preguntaSecreta: '¿Nombre de tu primera mascota?',
    respuestaSecreta: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/v1';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          preguntaSecreta: formData.preguntaSecreta,
          respuestaSecreta: formData.respuestaSecreta,
        }),
      });

      const result = await response.json();

      if (result.code === 201) {
        alert('¡Registro exitoso! Ahora podés iniciar sesión.');
        navigate('/login');
      } else {
        setError(result.msg || 'Error al registrar el usuario');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '2rem 0' }}>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px', border: '1px solid #E2E8F0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#3B82F6', fontSize: '1.75rem', margin: 0 }}>Crear Cuenta</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.5rem' }}>Completá tus datos para registrarte en Fixer</p>
        </div>

        {error && <div style={{ color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Nombre</label>
              <input type="text" name="nombre" required onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Apellido</label>
              <input type="text" name="apellido" required onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Correo Electrónico</label>
            <input type="email" name="email" required onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Contraseña</label>
            <input type="password" name="password" required onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #E2E8F0', margin: '0.5rem 0' }} />
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Pregunta Secreta (para recuperar tu cuenta)</p>

          <div>
            <select name="preguntaSecreta" onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
              <option value="¿Nombre de tu primera mascota?">¿Nombre de tu primera mascota?</option>
              <option value="¿Ciudad de nacimiento?">¿Ciudad de nacimiento?</option>
              <option value="¿Nombre de tu mejor amigo de la infancia?">¿Nombre de tu mejor amigo de la infancia?</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Tu Respuesta Secreta</label>
            <input type="text" name="respuestaSecreta" required onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: loading ? '#94A3B8' : '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', marginTop: '1rem' }}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#64748B', fontSize: '0.9rem', textDecoration: 'none' }}>
            ¿Ya tenés cuenta? <span style={{ color: '#3B82F6', fontWeight: '600' }}>Iniciá sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
};