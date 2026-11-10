import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { RegistroPage } from './../pages/RegistroPage';
import { RecuperarPasswordPage } from './../pages/RecuperarPasswordPage'; 
import { UsuariosPage } from '../pages/UsuariosPage';
import { PrestadoresPlaceholder, ResenasPlaceholder } from '../pages/Placeholders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
        <Route element={<Layout />}>
          {/* Redirección de la ruta raíz al módulo de usuarios */}
          <Route path="/" element={<Navigate to="/usuarios" replace />} />
          <Route path="/prestadores" element={<PrestadoresPlaceholder />} />
          <Route path="/resenas" element={<ResenasPlaceholder />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;