import { useEffect, useState } from 'react';
import { CatalogoPrestadoresUsuario } from '../components/prestadores/CatalogoPrestadoresUsuario';
import { FormularioPrestador } from '../components/prestadores/FormularioPrestador';
import { ListadoPrestadores } from '../components/prestadores/ListadoPrestadores';
import '../components/prestadores/Prestadores.css';

export interface PrestadoresPageProps {
    vistaInicial?: 'tabla' | 'catalogo';
}

export function PrestadoresPage({
    vistaInicial = 'tabla',
}: PrestadoresPageProps) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [versionCatalogo, setVersionCatalogo] = useState(0);
    const [modoVista, setModoVista] = useState<'tabla' | 'catalogo'>(
        vistaInicial
    );

    useEffect(() => {
        setModoVista(vistaInicial);
    }, [vistaInicial]);

    const manejarPrestadorCreado = () => {
        setVersionCatalogo((v) => v + 1);
        setMostrarFormulario(false);
    };

    return (
        <div className="prestadores-pagina">
            <header className="prestadores-encabezado">
                <div>
                    <h2>Módulo de Prestadores</h2>
                    <p>
                        Consultá, filtrá y administrá el catálogo de
                        profesionales y rubros registrados en Fixer.
                    </p>
                </div>

                <div className="prestadores-encabezado__acciones">
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
                        onClick={() => setMostrarFormulario((prev) => !prev)}
                    >
                        {mostrarFormulario
                            ? 'Cerrar formulario'
                            : '+ Nuevo Prestador'}
                    </button>
                </div>
            </header>

            {mostrarFormulario && (
                <FormularioPrestador
                    titulo="Alta de nuevo prestador"
                    textoBoton="Registrar prestador"
                    onGuardado={manejarPrestadorCreado}
                    onCancelar={() => setMostrarFormulario(false)}
                />
            )}

            {modoVista === 'catalogo' ? (
                <CatalogoPrestadoresUsuario versionCatalogo={versionCatalogo} />
            ) : (
                <ListadoPrestadores versionCatalogo={versionCatalogo} />
            )}
        </div>
    );
}
