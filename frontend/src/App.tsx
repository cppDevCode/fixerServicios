import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { PrestadoresPlaceholder } from '../pages/Placeholders';
import { ResenasPage } from '../pages/ResenaPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          {/* Redirección de la ruta raíz al módulo de usuarios */}
          <Route path="/" element={<Navigate to="/usuarios" replace />} />
          <Route path="/prestadores" element={<PrestadoresPlaceholder />} />
          <Route path="/resenas" element={<ResenasPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;