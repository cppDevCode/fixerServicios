import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import { FormularioCambioPassword } from '../prestadores/FormularioCambioPassword';
import {
    EVENTO_CAMBIO_SESION,
    marcarPasswordCambiada,
    obtenerUsuarioActual,
    type IUsuarioSesion,
} from '../../services/sesion.service';
import './Layout.css';

export const Layout = () => {
    const location = useLocation();
    const [usuarioActual, setUsuarioActual] = useState<IUsuarioSesion | null>(
        () => obtenerUsuarioActual()
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

    const requiereCambioPassword = Boolean(usuarioActual?.debeCambiarPassword);
    const esRutaAuth =
        !requiereCambioPassword &&
        (location.pathname === '/login' ||
            location.pathname === '/registro' ||
            location.pathname === '/recuperar-password');

    return (
        <div
            className={`layout-container${esRutaAuth ? ' layout-container--auth' : ''}`}
        >
            <Header />

            <main className="content-area">
                {requiereCambioPassword && usuarioActual ? (
                    <section
                        className="cambio-password-obligatorio-pantalla"
                        aria-label="Cambio de contraseña obligatorio"
                        data-testid="pantalla-cambio-password-obligatorio"
                    >
                        <FormularioCambioPassword
                            usuarioId={usuarioActual.id}
                            obligatorio={true}
                            onPasswordCambiada={marcarPasswordCambiada}
                        />
                    </section>
                ) : (
                    <Outlet />
                )}
            </main>

            <Footer />
        </div>
    );
};
