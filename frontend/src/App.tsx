import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Verificando conexión...');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(`Backend conectado con pnpm: ${data.status}`))
      .catch(() => setStatus('Error conectando al backend'));
  }, [apiUrl]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Fixer - Prototipo Modular</h1>
      <p>Estado: <strong>{status}</strong></p>
    </div>
  );
};

export default App;
