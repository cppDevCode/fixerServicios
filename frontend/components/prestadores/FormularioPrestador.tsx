import { useState, type FormEvent } from 'react';
import type {
    ICategoria,
    ICrearPrestador,
    IPrestador,
} from '../../interfaces/prestador.interface';
import {
    actualizarPrestador,
    CATEGORIAS_POR_DEFECTO,
    crearPrestador,
} from '../../services/prestador.service';
import './Prestadores.css';

export interface FormularioPrestadorProps {
    categorias?: ICategoria[];
    prestadorInicial?: IPrestador;
    titulo?: string;
    textoBoton?: string;
    onGuardado?: (prestador: IPrestador) => void;
    onCancelar?: () => void;
}

export function FormularioPrestador({
    categorias = CATEGORIAS_POR_DEFECTO,
    prestadorInicial,
    titulo,
    textoBoton,
    onGuardado,
    onCancelar,
}: FormularioPrestadorProps) {
    const listaCategorias =
        categorias.length > 0 ? categorias : CATEGORIAS_POR_DEFECTO;

    const [nombre, setNombre] = useState(prestadorInicial?.nombre ?? '');
    const [apellido, setApellido] = useState(prestadorInicial?.apellido ?? '');
    const [categoriaId, setCategoriaId] = useState(
        prestadorInicial?.categoriaId ?? listaCategorias[0]?.id ?? 'Plomería'
    );
    const [matricula, setMatricula] = useState(prestadorInicial?.matricula ?? '');
    const [aniosExperiencia, setAniosExperiencia] = useState(
        String(prestadorInicial?.aniosExperiencia ?? 1)
    );
    const [acercaDe, setAcercaDe] = useState(prestadorInicial?.acercaDe ?? '');
    const [ofreceGarantia, setOfreceGarantia] = useState(
        prestadorInicial?.ofreceGarantia ?? true
    );
    const [codPais, setCodPais] = useState(
        prestadorInicial?.telefono?.codPais ?? '+54'
    );
    const [codArea, setCodArea] = useState(
        prestadorInicial?.telefono?.codArea ?? '11'
    );
    const [nroTelefono, setNroTelefono] = useState(
        prestadorInicial?.telefono?.nroTelefono ?? ''
    );
    const [ratingPromedio, setRatingPromedio] = useState(
        prestadorInicial?.ratingPromedio !== undefined
            ? String(prestadorInicial.ratingPromedio)
            : '4.5'
    );

    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const esEdicion = Boolean(prestadorInicial?.id);

    const manejarSubmit = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setError(null);
        setMensajeExito(null);

        const nombreLimpio = nombre.trim();
        const apellidoLimpio = apellido.trim();
        const rubroLimpio = categoriaId.trim();

        if (!nombreLimpio || !apellidoLimpio || !rubroLimpio) {
            setError('Los campos nombre, apellido y rubro son obligatorios.');
            return;
        }

        const experienciaNumero = Number(aniosExperiencia);
        if (Number.isNaN(experienciaNumero) || experienciaNumero < 0) {
            setError('Los años de experiencia deben ser un número mayor o igual a 0.');
            return;
        }

        const ratingNumero = ratingPromedio.trim()
            ? Number(ratingPromedio)
            : undefined;

        const payload: ICrearPrestador = {
            nombre: nombreLimpio,
            apellido: apellidoLimpio,
            categoriaId: rubroLimpio,
            matricula: matricula.trim() ? matricula.trim() : undefined,
            aniosExperiencia: experienciaNumero,
            acercaDe: acercaDe.trim(),
            ofreceGarantia,
            telefono: {
                codPais: codPais.trim() || '+54',
                codArea: codArea.trim() || '11',
                nroTelefono: nroTelefono.trim(),
            },
            ratingPromedio:
                ratingNumero !== undefined && !Number.isNaN(ratingNumero)
                    ? ratingNumero
                    : undefined,
        };

        setEnviando(true);
        try {
            const respuesta =
                esEdicion && prestadorInicial
                    ? await actualizarPrestador(prestadorInicial.id, payload)
                    : await crearPrestador(payload);

            setMensajeExito(
                esEdicion
                    ? 'Datos del prestador actualizados correctamente.'
                    : 'Prestador registrado exitosamente.'
            );

            if (!esEdicion) {
                setNombre('');
                setApellido('');
                setMatricula('');
                setAcercaDe('');
                setNroTelefono('');
            }

            onGuardado?.(respuesta.datos);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al guardar el prestador.'
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form
            className="formulario-prestador"
            onSubmit={manejarSubmit}
            aria-label={titulo ?? (esEdicion ? 'Editar prestador' : 'Nuevo prestador')}
        >
            <h3>
                {titulo ??
                    (esEdicion
                        ? 'Actualizar datos del prestador'
                        : 'Registrar nuevo prestador')}
            </h3>

            <div className="formulario-prestador__grid">
                <div className="prestadores-campo">
                    <label htmlFor="prestador-nombre">Nombre *</label>
                    <input
                        id="prestador-nombre"
                        name="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Carlos"
                        disabled={enviando}
                    />
                </div>

                <div className="prestadores-campo">
                    <label htmlFor="prestador-apellido">Apellido *</label>
                    <input
                        id="prestador-apellido"
                        name="apellido"
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Ej: Gómez"
                        disabled={enviando}
                    />
                </div>

                <div className="prestadores-campo">
                    <label htmlFor="prestador-rubro">Rubro / Categoría *</label>
                    <select
                        id="prestador-rubro"
                        name="categoriaId"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        disabled={enviando}
                    >
                        {listaCategorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="prestadores-campo">
                    <label htmlFor="prestador-matricula">Matrícula profesional</label>
                    <input
                        id="prestador-matricula"
                        name="matricula"
                        type="text"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        placeholder="Ej: MAT-1001"
                        disabled={enviando}
                    />
                </div>

                <div className="prestadores-campo">
                    <label htmlFor="prestador-experiencia">Años de experiencia</label>
                    <input
                        id="prestador-experiencia"
                        name="aniosExperiencia"
                        type="number"
                        min="0"
                        max="60"
                        value={aniosExperiencia}
                        onChange={(e) => setAniosExperiencia(e.target.value)}
                        disabled={enviando}
                    />
                </div>

                <div className="prestadores-campo">
                    <label htmlFor="prestador-rating">Calificación inicial (1 a 5)</label>
                    <input
                        id="prestador-rating"
                        name="ratingPromedio"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={ratingPromedio}
                        onChange={(e) => setRatingPromedio(e.target.value)}
                        disabled={enviando}
                    />
                </div>
            </div>

            <div className="prestadores-campo">
                <label>Teléfono de contacto</label>
                <div className="formulario-prestador__telefono">
                    <input
                        id="prestador-cod-pais"
                        name="codPais"
                        type="text"
                        aria-label="Código de país"
                        value={codPais}
                        onChange={(e) => setCodPais(e.target.value)}
                        placeholder="+54"
                        disabled={enviando}
                    />
                    <input
                        id="prestador-cod-area"
                        name="codArea"
                        type="text"
                        aria-label="Código de área"
                        value={codArea}
                        onChange={(e) => setCodArea(e.target.value)}
                        placeholder="11"
                        disabled={enviando}
                    />
                    <input
                        id="prestador-nro-telefono"
                        name="nroTelefono"
                        type="text"
                        aria-label="Número de teléfono"
                        value={nroTelefono}
                        onChange={(e) => setNroTelefono(e.target.value)}
                        placeholder="40001001"
                        disabled={enviando}
                    />
                </div>
            </div>

            <div className="prestadores-campo">
                <label htmlFor="prestador-acerca">Acerca del profesional y especialidad</label>
                <textarea
                    id="prestador-acerca"
                    name="acercaDe"
                    rows={3}
                    value={acercaDe}
                    onChange={(e) => setAcercaDe(e.target.value)}
                    placeholder="Describí experiencia, certificaciones y trabajos realizados..."
                    disabled={enviando}
                />
            </div>

            <label className="formulario-prestador__checkbox">
                <input
                    id="prestador-garantia"
                    name="ofreceGarantia"
                    type="checkbox"
                    checked={ofreceGarantia}
                    onChange={(e) => setOfreceGarantia(e.target.checked)}
                    disabled={enviando}
                />
                Ofrece garantía escrita sobre los trabajos realizados
            </label>

            {error && (
                <p className="prestadores-alerta prestadores-alerta--error" role="alert">
                    {error}
                </p>
            )}

            {mensajeExito && (
                <p className="prestadores-alerta prestadores-alerta--exito" role="status">
                    {mensajeExito}
                </p>
            )}

            <div className="formulario-prestador__acciones">
                {onCancelar && (
                    <button
                        type="button"
                        className="btn-prestador btn-prestador--secundario"
                        onClick={onCancelar}
                        disabled={enviando}
                    >
                        Cancelar
                    </button>
                )}

                <button
                    type="submit"
                    className="btn-prestador btn-prestador--primario"
                    disabled={enviando}
                >
                    {enviando
                        ? 'Guardando...'
                        : textoBoton ?? (esEdicion ? 'Guardar cambios' : 'Crear prestador')}
                </button>
            </div>
        </form>
    );
}
