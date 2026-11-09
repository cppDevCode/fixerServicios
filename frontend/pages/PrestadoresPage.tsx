import { useState } from 'react';
import { FormularioPrestador } from '../components/prestadores/FormularioPrestador';
import { ListadoPrestadores } from '../components/prestadores/ListadoPrestadores';
import '../components/prestadores/Prestadores.css';

export function PrestadoresPage() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [versionCatalogo, setVersionCatalogo] = useState(0);

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

            <ListadoPrestadores versionCatalogo={versionCatalogo} />
        </div>
    );
}
