
import { Link } from 'react-router-dom';
import {
    BriefcaseBusiness,
    Users,
    Star,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import './PaginasInformativas.css';

export function PanelProPage() {
    return (
        <section className="info-page">

        {/* PRESENTACIÓN */}
        <div className="info-page__hero">
            <span className="info-page__etiqueta">
            FIXER PARA PROFESIONALES
            </span>

            <h1>Hacé crecer tus oportunidades con Fixer</h1>

            <p>
            Mostrá tus servicios, construí tu reputación
            y conectá con personas que buscan profesionales
            para resolver necesidades en su hogar.
            </p>

            <Link to="/registro" className="info-page__boton">
            Registrarme
            <ArrowRight size={18} />
            </Link>
        </div>

      {/* BENEFICIOS */}
        <div className="info-page__contenido">
        <h2>¿Por qué formar parte de Fixer?</h2>

        <p className="info-page__subtitulo">
            Un espacio para mostrar tu trabajo y llegar
            a potenciales clientes.
        </p>

        <div className="info-page__pasos">

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <BriefcaseBusiness size={28} />
                </div>

                <h3>Mostrá tus servicios</h3>

                <p>
                Presentá tu perfil profesional y los
                servicios que ofrecés en un mismo lugar.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <Users size={28} />
                </div>

                <h3>Conectá con clientes</h3>

                <p>
                Aumentá la visibilidad de tu trabajo
                entre personas que buscan soluciones
                para su hogar.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <div className="info-page__icono">
                <Star size={28} />
                </div>

                <h3>Construí tu reputación</h3>

                <p>
                Las reseñas y calificaciones permiten
                que otros usuarios conozcan las
                experiencias con tus servicios.
                </p>
            </article>

            </div>
        </div>

      {/* PASOS PARA COMENZAR */}
        <div className="info-page__contenido info-page__contenido--alternativo">
            <h2>Empezá en tres pasos</h2>

            <p className="info-page__subtitulo">
            Conocé cómo podés comenzar a formar parte
            de la comunidad de profesionales.
            </p>

            <div className="info-page__pasos">

            <article className="info-page__tarjeta">
                <span className="info-page__numero">01</span>
                <h3>Creá tu cuenta</h3>
                <p>
                Registrate en Fixer para comenzar
                a utilizar la plataforma.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <span className="info-page__numero">02</span>
                <h3>Completá tu perfil</h3>
                <p>
                Incorporá tu información profesional
                y los servicios que ofrecés.
                </p>
            </article>

            <article className="info-page__tarjeta">
                <span className="info-page__numero">03</span>
                <h3>Construí tu presencia</h3>
                <p>
                Compartí tu experiencia y fortalecé
                tu reputación dentro de Fixer.
                </p>
            </article>

        </div>

        {/* LLAMADA A LA ACCIÓN */}
        <div className="info-page__cta">
            <div>
                <CheckCircle2 size={32} />
                <h2>Tu próximo cliente puede encontrarte acá</h2>
                <p>
                Sumate a Fixer y descubrí nuevas oportunidades
                para mostrar tu trabajo.
                </p>
            </div>

            <Link to="/registro" className="info-page__boton">
                Crear mi cuenta
                <ArrowRight size={18} />
            </Link>
        </div>

        <p className="info-page__nota">
            Fixer es un prototipo académico en desarrollo.
            Algunas funcionalidades para profesionales
            todavía no se encuentran disponibles.
            </p>
        </div>
        </section>
    );
}
