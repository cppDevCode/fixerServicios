
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout-container">
      <Header />

      <div className="main-body">
        <aside className="sidebar">
          <h3>Módulos</h3>
          <ul>
            <li>
              <Link to="/prestadores">1. Prestadores</Link>
            </li>
            <li>
              <Link to="/prestadores/catalogo">
                Catálogo Público
              </Link>
            </li>
            <li>
              <Link to="/prestadores">Prestadores</Link>
            </li>
            <li>
              <Link to="/resenas">Reseñas</Link>
            </li>
            <li>
              <Link to="/usuarios">Usuarios</Link>
            </li>
          </ul>
        </aside>

        <main className="content-area">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
