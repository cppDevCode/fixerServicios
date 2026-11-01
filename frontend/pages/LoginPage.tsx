import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isRecovering, setIsRecovering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login simulado exitoso. Redirigiendo...');
    navigate('/usuarios'); 
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Simulación: Se validará la pregunta secreta.');
    setIsRecovering(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC', 
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #E2E8F0'
      }}>
        
        {/* Logo de Fixer */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#3B82F6', fontSize: '2rem', margin: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔧</span> Fixer
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Soluciones para tu hogar
          </p>
        </div>

        <h2 style={{ textAlign: 'center', color: '#1E293B', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          {isRecovering ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
        </h2>

        {!isRecovering ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', marginTop: '0.5rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EA580C'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F97316'}>
              Ingresar
            </button>
            <button type="button" onClick={() => setIsRecovering(true)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, textAlign: 'center' }}>Ingresá tu email y tu pregunta secreta para recuperar el acceso.</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Correo Electrónico</label>
              <input type="email" required placeholder="tu@email.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Pregunta Secreta: <br/><span style={{ color: '#1E293B', fontWeight: '600' }}>¿Cuál es el nombre de tu primera mascota?</span></label>
              <input type="text" placeholder="Tu respuesta" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
              Recuperar Cuenta
            </button>
            <button type="button" onClick={() => setIsRecovering(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.9rem' }}>
              Volver al Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};