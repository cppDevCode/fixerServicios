import { Outlet, Link, useNavigate } from 'react-router-dom';
import "./Layout.css";

export const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      {/* HEADER GLOBAL */}
      <header className="global-header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>Fixer 🛠️</h1>
        </div>
        <nav className="user-nav">
          <Link to="/login" style={{ backgroundColor: '#FFF7ED', color: '#F97316', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Cerrar Sesión / Login</Link>
        </nav>
      </header>

      <div className="main-body">
        {/* SIDEBAR CON TABS POR INTEGRANTE */}
        <aside className="sidebar">
          <h3>Módulos</h3>
          <ul>
            <li><Link to="/prestadores">1. Prestadores</Link></li>
            <li><Link to="/resenas">2. Reseñas</Link></li>
            <li><Link to="/usuarios">3. Usuarios</Link></li>
          </ul>
        </aside>

        {/* CONTENIDO DINÁMICO */}
        <main className="content-area">
          <Outlet /> {/* Aquí se renderizan las páginas */}
        </main>
      </div>

      {/* FOOTER GLOBAL */}
      <footer className="global-footer">
        <p>© 2026 Fixer - Soluciones para tu hogar. UTN</p>
      </footer>
    </div>
  );
};