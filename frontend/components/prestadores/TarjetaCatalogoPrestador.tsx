import { useState } from 'react';
import type { IPrestador } from '../../interfaces/prestador.interface';
import { formatearTelefonoPrestador } from '../../services/exportarCatalogo.service';
import { AvatarPrestador } from './AvatarPrestador';

const ESPECIALIDADES_POR_RUBRO: Record<string, string> = {
    Plomería: 'Plomería Integral e Instalaciones Sanitarias',
    Electricidad: 'Electricidad y Tableros Eléctricos',
    Gasista: 'Calderas, Termotanques y Cañerías',
    Pintura: 'Pintura de Obra y Terminaciones',
    Carpintería: 'Carpintería a Medida y Mobiliario',
    Albañilería: 'Albañilería y Refacciones en General',
    Jardinería: 'Paisajismo, Poda y Riego Automático',
    Cerrajería: 'Cerrajería Domiciliaria y Comercial',
    Refrigeración: 'Instalación y Service de Climatización',
};

export function obtenerTituloEspecialidad(prestador: IPrestador): string {
    return (
        ESPECIALIDADES_POR_RUBRO[prestador.categoriaId] ??
        `Especialista en ${prestador.categoriaId}`
    );
}

export function calcularCantidadResenas(prestador: IPrestador): number {
    return 38 + prestador.aniosExperiencia * 6 + (prestador.id % 15);
}

export interface TarjetaCatalogoPrestadorProps {
    prestador: IPrestador;
    onVerPerfil: (id: number) => void;
    onContactar?: (prestador: IPrestador) => void;
}

export function TarjetaCatalogoPrestador({
    prestador,
    onVerPerfil,
    onContactar,
}: TarjetaCatalogoPrestadorProps) {
    const [guardado, setGuardado] = useState(false);
    const [mostrarContacto, setMostrarContacto] = useState(false);

    const rating =
        prestador.ratingPromedio !== undefined
            ? prestador.ratingPromedio.toFixed(1)
            : '4.5';
    const cantidadResenas = calcularCantidadResenas(prestador);
    const telefonoFormateado = formatearTelefonoPrestador(prestador.telefono);

    const manejarContactar = () => {
        setMostrarContacto((prev) => !prev);
        onContactar?.(prestador);
    };

    return (
        <article
            className="catalogo-tarjeta"
            data-testid="tarjeta-catalogo-prestador"
            aria-label={`Profesional ${prestador.nombre} ${prestador.apellido}`}
        >
            <div className="catalogo-tarjeta__cabecera">
                <div className="catalogo-tarjeta__identidad">
                    <div className="catalogo-tarjeta__avatar-contenedor">
                        <AvatarPrestador
                            nombre={prestador.nombre}
                            apellido={prestador.apellido}
                            fotoUrl={prestador.fotoUrl}
                            tamano="md"
                        />
                    </div>

                    <div className="catalogo-tarjeta__titular">
                        <h3>
                            {prestador.nombre} {prestador.apellido}
                        </h3>
                        <span className="catalogo-tarjeta__subtitulo">
                            {prestador.matricula
                                ? `Matrícula ${prestador.matricula}`
                                : `Especialista en ${prestador.categoriaId}`}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className={`catalogo-tarjeta__guardar ${
                        guardado ? 'catalogo-tarjeta__guardar--activo' : ''
                    }`}
                    aria-label={
                        guardado ? 'Quitar de guardados' : 'Guardar profesional'
                    }
                    aria-pressed={guardado}
                    onClick={() => setGuardado((prev) => !prev)}
                >
                    🔖
                </button>
            </div>

            <div className="catalogo-tarjeta__cuerpo">
                <p className="catalogo-tarjeta__especialidad">
                    {obtenerTituloEspecialidad(prestador)}
                </p>

                <div className="catalogo-tarjeta__etiquetas">
                    <span className="catalogo-chip catalogo-chip--azul">
                        {prestador.categoriaId}
                    </span>

                    <span className="catalogo-chip catalogo-chip--naranja">
                        {prestador.aniosExperiencia} años de experiencia
                    </span>
                </div>

                <div className="catalogo-tarjeta__metricas">
                    <div className="catalogo-tarjeta__metricas-fila">
                        <span className="catalogo-tarjeta__puntuacion">
                            <span className="catalogo-tarjeta__estrella">★</span>
                            <strong>{rating}</strong>
                            <span className="catalogo-tarjeta__resenas">
                                ({cantidadResenas} reseñas)
                            </span>
                        </span>

                        <span className="catalogo-tarjeta__telefono">
                            📞 {telefonoFormateado}
                        </span>
                    </div>

                    <div className="catalogo-tarjeta__metricas-fila catalogo-tarjeta__metricas-fila--secundaria">
                        <span className="catalogo-tarjeta__descripcion">
                            {prestador.acercaDe ||
                                'Atención profesional a domicilio'}
                        </span>
                        <span className="catalogo-tarjeta__garantia-texto">
                            {prestador.ofreceGarantia
                                ? 'Ofrece garantía'
                                : 'Sin garantía'}
                        </span>
                    </div>
                </div>
            </div>

            {mostrarContacto && (
                <div
                    className="catalogo-tarjeta__contacto-info"
                    role="status"
                >
                    📞 Contacto directo: <strong>{telefonoFormateado}</strong>
                </div>
            )}

            <div className="catalogo-tarjeta__acciones">
                <button
                    type="button"
                    className="catalogo-tarjeta__btn catalogo-tarjeta__btn--perfil"
                    onClick={() => onVerPerfil(prestador.id)}
                >
                    Ver Perfil
                </button>

                <button
                    type="button"
                    className="catalogo-tarjeta__btn catalogo-tarjeta__btn--contactar"
                    onClick={manejarContactar}
                >
                    💬 Contactar
                </button>
            </div>
        </article>
    );
}
