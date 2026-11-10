// frontend/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/v1';

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
        // Guardamos el token simulado y los datos del usuario
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('usuario', JSON.stringify(result.data.usuario));
        
        // Redirigimos al listado de usuarios
        navigate('/usuarios');
      } else {
        setError(result.msg || 'Credenciales inválidas');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', border: '1px solid #E2E8F0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#3B82F6', fontSize: '2rem', margin: 0 }}>🔧 Fixer</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.5rem' }}>Soluciones para tu hogar</p>
        </div>

        <h2 style={{ textAlign: 'center', color: '#1E293B', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Iniciar Sesión</h2>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="bruna@example.com"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="123456"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem' }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem', backgroundColor: loading ? '#94A3B8' : '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/recuperar-password" style={{ color: '#3B82F6', fontSize: '0.9rem', textDecoration: 'none' }}>
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/registro" style={{ color: '#64748B', fontSize: '0.9rem', textDecoration: 'none' }}>
            ¿No tenés cuenta? <span style={{ color: '#F97316', fontWeight: '600' }}>Registrate</span>
          </Link>
        </div>
      </div>
    </div>
  );
};