import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isRecovering, setIsRecovering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login con:', email, password);
    alert('Login simulado exitoso. Redirigiendo al sistema...');
    navigate('/usuarios'); 
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Simulación: Se validará la pregunta secreta.');
    setIsRecovering(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#2b6cb0', marginBottom: '1.5rem' }}>
          {isRecovering ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
        </h2>

        {!isRecovering ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contraseña:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>
              Ingresar
            </button>
            <button type="button" onClick={() => setIsRecovering(true)} style={{ background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>Ingresá tu email para recuperar tu cuenta.</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email:</label>
              <input type="email" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Pregunta Secreta: <br/><strong>¿Nombre de tu primera mascota?</strong></label>
              <input type="text" placeholder="Tu respuesta" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Recuperar Cuenta
            </button>
            <button type="button" onClick={() => setIsRecovering(false)} style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '0.9rem' }}>
              Volver al Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};