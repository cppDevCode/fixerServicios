import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserRound, LogOut } from 'lucide-react';
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
import './Header.css';

export function Header() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState<IUsuarioSesion | null>(
        () => obtenerUsuarioActual()
    );
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setUsuarioActual(obtenerUsuarioActual());
    }, [location.pathname, location.search]);

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

    const cerrarMenu = () => setMenuAbierto(false);

    const manejarCerrarSesion = () => {
        cerrarSesionUsuario();
        setUsuarioActual(null);
        cerrarMenu();
        navigate('/login');
    };

    return (
        <header className="fixer-header">
            <div className="fixer-header__contenedor">
                <Link
                    to="/"
                    className="fixer-header__logo"
                    onClick={cerrarMenu}
                    aria-label="Fixer - Inicio"
                >
                    <img src={fixerLogo} alt="Fixer" />
                </Link>

                <nav
                    className={`fixer-header__nav ${menuAbierto ? 'fixer-header__nav--abierto' : ''}`}
                    aria-label="Navegación principal"
                    id="fixer-navegacion"
                >
                    <NavLink to="/" end onClick={cerrarMenu}>
                        Inicio
                    </NavLink>

                    <NavLink to="/prestadores/catalogo" onClick={cerrarMenu}>
                        Explorar servicios
                    </NavLink>

                    {esAdmin(usuarioActual) && (
                        <>
                            <NavLink to="/prestadores" end onClick={cerrarMenu}>
                                1. Prestadores
                            </NavLink>
                            <NavLink to="/usuarios" onClick={cerrarMenu}>
                                Usuarios
                            </NavLink>
                        </>
                    )}

                    {esPrestador(usuarioActual) && (
                        <>
                            <NavLink
                                to={`/prestadores/${usuarioActual?.prestadorId ?? 1}`}
                                onClick={cerrarMenu}
                            >
                                Mi Ficha Profesional
                            </NavLink>
                            <NavLink
                                to={`/usuarios/${usuarioActual?.id}`}
                                onClick={cerrarMenu}
                            >
                                Mi Perfil de Usuario
                            </NavLink>
                        </>
                    )}

                    {esUsuarioFinal(usuarioActual) && (
                        <NavLink
                            to={`/usuarios/${usuarioActual?.id}`}
                            onClick={cerrarMenu}
                        >
                            Mi Perfil
                        </NavLink>
                    )}

                    <NavLink to="/como-funciona" onClick={cerrarMenu}>
                        Cómo funciona
                    </NavLink>

                    <NavLink to="/garantia" onClick={cerrarMenu}>
                        Garantía
                    </NavLink>

                    {!usuarioActual && (
                        <NavLink to="/panel-pro" onClick={cerrarMenu}>
                            Panel Pro
                        </NavLink>
                    )}
                </nav>

                <div className="fixer-header__acciones">
                    {usuarioActual ? (
                        <>
                            <Link
                                to={`/usuarios/${usuarioActual.id}`}
                                data-testid="usuario-sesion-badge"
                                className="fixer-header__usuario-badge"
                                title="Ver mi perfil de usuario"
                            >
                                <UserRound size={16} />
                                <span>
                                    {usuarioActual.nombre} ({usuarioActual.rol})
                                </span>
                            </Link>

                            <button
                                type="button"
                                data-testid="btn-cerrar-sesion"
                                onClick={manejarCerrarSesion}
                                className="fixer-header__btn-salir"
                            >
                                <LogOut size={16} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="fixer-header__login-btn"
                                aria-label="Acceder a mi cuenta"
                            >
                                <UserRound size={18} />
                                <span>Iniciar Sesión</span>
                            </Link>

                            <Link
                                to="/panel-pro"
                                className="fixer-header__publicar"
                                onClick={cerrarMenu}
                            >
                                Publicar servicio
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        className="fixer-header__hamburguesa"
                        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuAbierto}
                        aria-controls="fixer-navegacion"
                        onClick={() => setMenuAbierto(!menuAbierto)}
                    >
                        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
}
