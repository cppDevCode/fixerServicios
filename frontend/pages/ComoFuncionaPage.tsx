
import { Link } from 'react-router-dom';
import {
    Search,
    MessageCircle,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import './PaginasInformativas.css';

export function ComoFuncionaPage() {
    return (
        <section className="info-page">
        <div className="info-page__hero">
            <span className="info-page__etiqueta">
            SIMPLE Y CONFIABLE
            </span>

            <h1>Encontrá al profesional que necesitás</h1>

            <p>
            En Fixer te ayudamos a conectar con profesionales
            para resolver las necesidades de tu hogar.
            </p>

            <Link
            to="/prestadores/catalogo"
            className="info-page__boton"
            >
            Explorar servicios
            <ArrowRight size={18} />
            </Link>
        </div>

        <div className="info-page__contenido">
            <h2>¿Cómo funciona Fixer?</h2>
            <p className="info-page__subtitulo">
            Encontrar ayuda para tu hogar puede ser muy sencillo.
            </p>

            <div className="info-page__pasos">
            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <Search size={28} />
                </div>

                <span className="info-page__numero">01</span>
                <h3>Explorá servicios</h3>
                <p>
                Buscá profesionales según el tipo de servicio
                que necesitás.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <MessageCircle size={28} />
                </div>

                <span className="info-page__numero">02</span>
                <h3>Elegí un profesional</h3>
                <p>
                Consultá los perfiles y las reseñas de otros
                usuarios para tomar una decisión.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <CheckCircle2 size={28} />
                </div>

                <span className="info-page__numero">03</span>
                <h3>Resolvé tu necesidad</h3>
                <p>
                Encontrá una opción que se adapte a lo que
                buscás y avanzá con tu solicitud.
                </p>
            </article>
            </div>
        </div>
        </section>
    );
}
