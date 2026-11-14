
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import fixerLogo from '../../assets/fixer-logo.png';
import './Footer.css';

export function Footer() {
    return (
        <footer className="fixer-footer">
        <div className="fixer-footer__contenedor">
            <div className="fixer-footer__columnas">

            {/* IDENTIDAD */}
            <div className="fixer-footer__marca">
                <Link to="/" aria-label="Fixer - Inicio">
                <img
                    src={fixerLogo}
                    alt="Fixer"
                    className="fixer-footer__logo"
                />
                </Link>

                <p>
                Conectamos personas con profesionales para
                encontrar soluciones para el hogar de manera
                simple y confiable.
                </p>

                <div className="fixer-footer__redes">
                <span aria-label="Facebook" title="Facebook">
                    <FaFacebookF size={20} />
                </span>

                <span aria-label="Instagram" title="Instagram">
                    <FaInstagram size={20} />
                </span>

                <span aria-label="LinkedIn" title="LinkedIn">
                    <FaLinkedinIn size={20} />
                </span>
                </div>
            </div>

            {/* PLATAFORMA */}
            <div className="fixer-footer__columna">
                <h3>Plataforma</h3>

                <Link to="/prestadores/catalogo">
                Explorar servicios
                </Link>

                <Link to="/como-funciona">Cómo funciona</Link>
                <Link to="/garantia">Garantía Fixer</Link>
            </div>

            {/* PROFESIONALES */}
            <div className="fixer-footer__columna">
                <h3>Profesionales</h3>

                <Link to="/prestadores">
                Ver profesionales
                </Link>

                <Link to="/panel-pro">Panel Pro</Link>
                <Link to="/panel-pro">Publicar servicio</Link>
            </div>

            {/* ATENCIÓN */}
            <div className="fixer-footer__columna">
                <h3>Atención</h3>

                <span>Centro de ayuda</span>
                <span>Contacto</span>

                <div className="fixer-footer__estado">
                <ShieldCheck size={18} />
                <span>Tu confianza es importante</span>
                </div>
            </div>
            </div>

            {/* BARRA INFERIOR */}
            <div className="fixer-footer__inferior">
            <p>© 2026 Fixer. Proyecto académico UTN.</p>

            <div className="fixer-footer__legales">
                <span>Privacidad</span>
                <span>Términos de uso</span>
                <span>Seguridad</span>
            </div>
            </div>
        </div>
        </footer>
    );
}
