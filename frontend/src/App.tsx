import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { RegistroPage } from './../pages/RegistroPage';
import { RecuperarPasswordPage } from './../pages/RecuperarPasswordPage'; 
import { UsuariosPage } from '../pages/UsuariosPage';
import { UsuarioDetallePage } from '../pages/UsuarioDetallePage';
import { HomePage } from '../pages/HomePage';
import { PrestadoresPage } from '../pages/PrestadoresPage';
import { PrestadorDetallePage } from '../pages/PrestadorDetallePage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
        
        <Route element={<Layout />}>
          {/* Ruta raíz establecida en la vista Home del sitio */}
          <Route path="/" element={<HomePage />} />
          <Route path="/prestadores" element={<PrestadoresPage />} />
          <Route path="/prestadores/catalogo" element={<PrestadoresPage vistaInicial="catalogo" />} />
          <Route path="/prestadores/:id" element={<PrestadorDetallePage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/usuarios/:id" element={<UsuarioDetallePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;