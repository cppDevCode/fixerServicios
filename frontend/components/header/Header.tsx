
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, UserRound } from 'lucide-react';
import fixerLogo from '../../assets/fixer-logo.png';
import './Header.css';

export function Header() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="fixer-header">
            <div className="fixer-header__contenedor">

                {/* Logo */}
                <Link
                    to="/"
                    className="fixer-header__logo"
                    onClick={cerrarMenu}
                    aria-label="Fixer - Inicio"
                >
                    <img src={fixerLogo} alt="Fixer" />
                </Link>

                {/* Navegación principal */}
                <nav
                    className={`fixer-header__nav ${menuAbierto ? 'fixer-header__nav--abierto' : ''}`}
                    aria-label="Navegación principal"
                    id="fixer-navegacion"
                >
                    <NavLink
                        to="/prestadores/catalogo"
                        onClick={cerrarMenu}
                    >
                        Explorar servicios
                    </NavLink>

                    <NavLink
                        to="/prestadores"
                        onClick={cerrarMenu}
                    >
                        Profesionales
                    </NavLink>

                    <NavLink
                        to="/como-funciona"
                        onClick={cerrarMenu}
                    >
                        Cómo funciona
                    </NavLink>

                    <NavLink
                        to="/garantia"
                        onClick={cerrarMenu}
                    >
                        Garantía
                    </NavLink>

                    <NavLink
                        to="/panel-pro"
                        onClick={cerrarMenu}
                    >
                        Panel Pro
                    </NavLink>
                </nav>

                {/* Acciones */}
                <div className="fixer-header__acciones">
                    <Link
                        to="/login"
                        className="fixer-header__icono"
                        aria-label="Acceder a mi cuenta"
                        onClick={cerrarMenu}
                    >
                        <UserRound size={22} />
                    </Link>

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
