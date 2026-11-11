// frontend/pages/RecuperarPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const RecuperarPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [preguntaSecreta, setPreguntaSecreta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3000/api/v1';

  // PASO 1: Buscar la pregunta secreta por email
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
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Validar la respuesta secreta
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
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Cambiar la contraseña
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
        setSuccess('¡Contraseña actualizada! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.msg || 'Error al actualizar la contraseña');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', border: '1px solid #E2E8F0' }}>
        
        <h2 style={{ textAlign: 'center', color: '#1E293B', marginBottom: '1.5rem' }}>Recuperar Contraseña</h2>

        {error && <div style={{ color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#16A34A', backgroundColor: '#DCFCE7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{success}</div>}

        {/* PASO 1: Email */}
        {step === 1 && (
          <form onSubmit={handleBuscarPregunta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, textAlign: 'center' }}>Paso 1: Ingresá tu email para buscar tu pregunta secreta.</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Buscando...' : 'Buscar Pregunta'}
            </button>
          </form>
        )}

        {/* PASO 2: Pregunta Secreta */}
        {step === 2 && (
          <form onSubmit={handleValidarRespuesta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>Paso 2: Respondé tu pregunta secreta.</p>
            <p style={{ fontSize: '0.95rem', color: '#1E293B', margin: 0, fontWeight: '600' }}>{preguntaSecreta}</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Tu Respuesta</label>
              <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Validando...' : 'Validar Respuesta'}
            </button>
          </form>
        )}

        {/* PASO 3: Nueva Contraseña */}
        {step === 3 && (
          <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>Paso 3: Ingresá tu nueva contraseña.</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Nueva Contraseña</label>
              <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>Confirmar Contraseña</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#64748B', fontSize: '0.9rem', textDecoration: 'none' }}>Volver al Login</Link>
        </div>
      </div>
    </div>
  );
};