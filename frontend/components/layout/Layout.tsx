import { Outlet, Link, useNavigate } from 'react-router-dom';
import "./Layout.css";

export const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      {/* HEADER GLOBAL */}
      <header className="global-header">
        <div className="logo" onClick={() => navigate('/')}>
          <h1>Fixer 🛠️</h1>
        </div>
        <nav className="user-nav">
          <Link to="/login" className="btn-header-login">Cerrar Sesión / Login</Link>
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

        {/* CONTENIDO DINÁMICO */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {/* FOOTER GLOBAL */}
      <footer className="global-footer">
        <p>© 2026 Fixer - Soluciones para tu hogar. UTN</p>
      </footer>
    </div>
  );
};