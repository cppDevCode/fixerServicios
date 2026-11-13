import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import "./Layout.css";
import fixerLogo from '../../assets/fixer-logo.png';
import {
  cerrarSesionUsuario,
  esAdmin,
  esPrestador,
  esUsuarioFinal,
  EVENTO_CAMBIO_SESION,
  obtenerUsuarioActual,
  type IUsuarioSesion,
} from '../../services/sesion.service';

export const Layout = () => {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState<IUsuarioSesion | null>(() =>
    obtenerUsuarioActual()
  );

  useEffect(() => {
    const actualizarSesion = () => {
      setUsuarioActual(obtenerUsuarioActual());
    };

    window.addEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
    window.addEventListener('storage', actualizarSesion);

    return () => {
      window.removeEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
      window.removeEventListener('storage', actualizarSesion);
    };
  }, []);

  const manejarCerrarSesion = () => {
    cerrarSesionUsuario();
    setUsuarioActual(null);
    navigate('/login');
  };

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
        <nav className="user-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {usuarioActual ? (
            <>
              <span
                data-testid="usuario-sesion-badge"
                style={{ fontSize: '0.88rem', fontWeight: 600 }}
              >
                {usuarioActual.nombre} ({usuarioActual.rol})
              </span>
              <button
                type="button"
                data-testid="btn-cerrar-sesion"
                onClick={manejarCerrarSesion}
                className="btn-header-login"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-header-login">Cerrar Sesión / Login</Link>
          )}
        </nav>
      </header>

      <div className="main-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h3>Módulos</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/prestadores/catalogo">Catálogo Público</Link></li>

            {esAdmin(usuarioActual) && (
              <>
                <li><Link to="/prestadores">1. Prestadores</Link></li>
                <li><Link to="/usuarios">Usuarios</Link></li>
                <li><Link to="/resenas">Reseñas</Link></li>
              </>
            )}

            {esPrestador(usuarioActual) && (
              <>
                <li>
                  <Link to={`/prestadores/${usuarioActual?.prestadorId ?? 1}`}>
                    Mi Perfil Profesional
                  </Link>
                </li>
                <li>
                  <Link to={`/usuarios/${usuarioActual?.id}`}>
                    Mi Perfil de Usuario
                  </Link>
                </li>
              </>
            )}

            {esUsuarioFinal(usuarioActual) && (
              <li>
                <Link to={`/usuarios/${usuarioActual?.id}`}>
                  Mi Perfil de Usuario
                </Link>
              </li>
            )}
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