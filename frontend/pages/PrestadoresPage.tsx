import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogoPrestadoresUsuario } from '../components/prestadores/CatalogoPrestadoresUsuario';
import { FormularioPrestador } from '../components/prestadores/FormularioPrestador';
import { ListadoPrestadores } from '../components/prestadores/ListadoPrestadores';
import '../components/prestadores/Prestadores.css';
import {
    esPrestador,
    EVENTO_CAMBIO_SESION,
    obtenerUsuarioActual,
    puedeGestionarCatalogoPrestadores,
    type IUsuarioSesion,
} from '../services/sesion.service';

export interface PrestadoresPageProps {
    vistaInicial?: 'tabla' | 'catalogo';
}

export function PrestadoresPage({
    vistaInicial = 'tabla',
}: PrestadoresPageProps) {
    const [usuarioActual, setUsuarioActual] = useState<IUsuarioSesion | null>(
        () => obtenerUsuarioActual()
    );
    const esAdministrador = puedeGestionarCatalogoPrestadores(usuarioActual);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [versionCatalogo, setVersionCatalogo] = useState(0);
    const [modoVista, setModoVista] = useState<'tabla' | 'catalogo'>(
        esAdministrador ? vistaInicial : 'catalogo'
    );

    useEffect(() => {
        const actualizarSesion = () => {
            const usuario = obtenerUsuarioActual();
            setUsuarioActual(usuario);
            if (!puedeGestionarCatalogoPrestadores(usuario)) {
                setModoVista('catalogo');
                setMostrarFormulario(false);
            }
        };
        window.addEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
        return () =>
            window.removeEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
    }, []);

    useEffect(() => {
        setModoVista(esAdministrador ? vistaInicial : 'catalogo');
    }, [vistaInicial, esAdministrador]);

    const manejarPrestadorCreado = () => {
        setVersionCatalogo((v) => v + 1);
        setMostrarFormulario(false);
    };

    const mostrarTablaGestion = esAdministrador && modoVista === 'tabla';

    return (
        <div className="prestadores-pagina">
            <header className="prestadores-encabezado">
                <div>
                    <h2>
                        {esAdministrador
                            ? 'Módulo de Prestadores'
                            : 'Catálogo de Profesionales'}
                    </h2>
                    <p>
                        {esAdministrador
                            ? 'Consultá, filtrá y administrá el catálogo de profesionales y rubros registrados en Fixer.'
                            : 'Explorá los profesionales disponibles por rubro y localidad.'}
                    </p>
                </div>

                <div className="prestadores-encabezado__acciones">
                    {esPrestador(usuarioActual) && (
                        <Link
                            to={`/prestadores/${usuarioActual?.prestadorId ?? 1}`}
                            data-testid="btn-mi-ficha-prestador"
                            className="btn-prestador btn-prestador--primario"
                        >
                            Ir a Mi Ficha Profesional
                        </Link>
                    )}

                    {esAdministrador && (
                        <>
                            <button
                                type="button"
                                data-testid="btn-alternar-vista-prestadores"
                                className="btn-prestador btn-prestador--secundario"
                                onClick={() =>
                                    setModoVista((prev) =>
                                        prev === 'tabla' ? 'catalogo' : 'tabla'
                                    )
                                }
                            >
                                {modoVista === 'tabla'
                                    ? 'Ver Catálogo de Usuario'
                                    : 'Ver Tabla de Gestión'}
                            </button>

                            <button
                                type="button"
                                className="btn-prestador btn-prestador--primario"
                                onClick={() =>
                                    setMostrarFormulario((prev) => !prev)
                                }
                            >
                                {mostrarFormulario
                                    ? 'Cerrar formulario'
                                    : '+ Nuevo Prestador'}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {esAdministrador && mostrarFormulario && (
                <FormularioPrestador
                    titulo="Alta de nuevo prestador"
                    textoBoton="Registrar prestador"
                    onGuardado={manejarPrestadorCreado}
                    onCancelar={() => setMostrarFormulario(false)}
                />
            )}

            {mostrarTablaGestion ? (
                <ListadoPrestadores versionCatalogo={versionCatalogo} />
            ) : (
                <CatalogoPrestadoresUsuario versionCatalogo={versionCatalogo} />
            )}
        </div>
    );
}
