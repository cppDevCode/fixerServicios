
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Star,
    Users,
    ArrowRight,
} from 'lucide-react';
import './PaginasInformativas.css';

export function GarantiaPage() {
    return (
        <section className="info-page">
        <div className="info-page__hero">
            <span className="info-page__etiqueta">
            CONFIANZA Y TRANSPARENCIA
            </span>

            <h1>Tu tranquilidad es nuestra prioridad</h1>

            <p>
            En Fixer creemos que encontrar profesionales para
            tu hogar debería ser una experiencia sencilla,
            transparente y confiable.
            </p>

            <Link
            to="/prestadores/catalogo"
            className="info-page__boton"
            >
            Encontrar profesionales
            <ArrowRight size={18} />
            </Link>
        </div>

        <div className="info-page__contenido">
            <h2>¿Por qué confiar en Fixer?</h2>

            <p className="info-page__subtitulo">
            Queremos ayudarte a tomar decisiones con más información.
            </p>

            <div className="info-page__pasos">
            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <ShieldCheck size={28} />
                </div>

                <h3>Información clara</h3>

                <p>
                Accedé a los perfiles de los profesionales
                y conocé los servicios que ofrecen.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <Star size={28} />
                </div>

                <h3>Opiniones de usuarios</h3>

                <p>
                Consultá calificaciones y reseñas para conocer
                las experiencias compartidas por otros usuarios.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <Users size={28} />
                </div>

                <h3>Una comunidad conectada</h3>

                <p>
                Facilitamos el encuentro entre personas que
                necesitan soluciones y profesionales que
                ofrecen sus servicios.
                </p>
            </article>
            </div>

            <div className="info-page__aviso">
            <ShieldCheck size={22} />

            <div>
                <h3>Sobre la Garantía Fixer</h3>

                <p>
                Fixer es un prototipo académico en desarrollo.
                Actualmente, esta sección presenta nuestros
                principios de confianza y transparencia.
                No constituye una garantía contractual,
                cobertura de seguros ni protección económica.
                </p>
            </div>
            </div>
        </div>
        </section>
    );
}
