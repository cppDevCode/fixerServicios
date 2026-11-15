import { Outlet } from 'react-router-dom';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout-container">
      {/* HEADER GLOBAL */}
      <header className="global-header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img
            src={fixerLogo}
            alt="Fixer - Soluciones para tu hogar"
            className="logo-img"
          />
        </div>
        <nav className="user-nav">
          <Link to="/login" className="btn-header-login" onClick={()=>{
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
          }}
          >Cerrar Sesión / Login</Link>
        </nav>
      </header>

      <div className="main-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h3>Módulos</h3>
          <ul>
            <li><Link to="/prestadores">Prestadores</Link></li>
            <li><Link to="/resenas">Reseñas</Link></li>
            <li><Link to="/usuarios">Usuarios</Link></li>
          </ul>
        </aside>
      <Header />

      <main className="content-area">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
