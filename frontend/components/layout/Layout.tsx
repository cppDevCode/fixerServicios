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

import { Outlet } from 'react-router-dom';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout-container">
      <Header />

      <main className="content-area">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
