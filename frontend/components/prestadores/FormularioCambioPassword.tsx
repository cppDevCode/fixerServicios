import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import {
    cambiarPasswordUsuario,
    validarCambioPassword,
} from '../../services/password.service';
import './Prestadores.css';

export interface FormularioCambioPasswordProps {
    usuarioId: number;
    bloqueadoHastaInicial?: string | null;
    obligatorio?: boolean;
    onCuentaBloqueada?: (bloqueadoHasta: string) => void;
    onPasswordCambiada?: () => void;
}

export function FormularioCambioPassword({
    usuarioId,
    bloqueadoHastaInicial = null,
    obligatorio = false,
    onCuentaBloqueada,
    onPasswordCambiada,
}: FormularioCambioPasswordProps) {
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');

    const [mostrarActual, setMostrarActual] = useState(false);
    const [mostrarNueva, setMostrarNueva] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);
    const [bloqueadoHasta, setBloqueadoHasta] = useState<string | null>(
        bloqueadoHastaInicial
    );

    useEffect(() => {
        setBloqueadoHasta(bloqueadoHastaInicial ?? null);
    }, [bloqueadoHastaInicial]);

    const estaBloqueado = Boolean(
        bloqueadoHasta && new Date(bloqueadoHasta).getTime() > Date.now()
    );

    const manejarSubmit = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setError(null);
        setMensajeExito(null);

        const errorLocal = validarCambioPassword({
            passwordActual,
            nuevaPassword,
            confirmarPassword,
        });

        if (errorLocal) {
            setError(errorLocal);
            return;
        }

        setEnviando(true);
        try {
            const resultado = await cambiarPasswordUsuario(usuarioId, {
                passwordActual,
                nuevaPassword,
                confirmarPassword,
            });

            if (resultado.ok) {
                setMensajeExito(resultado.mensaje);
                setPasswordActual('');
                setNuevaPassword('');
                setConfirmarPassword('');
                setBloqueadoHasta(null);
                onPasswordCambiada?.();
                return;
            }

            if (resultado.status === 423) {
                const hasta =
                    resultado.bloqueadoHasta ??
                    new Date(Date.now() + 30 * 60 * 1000).toISOString();
                setBloqueadoHasta(hasta);
                onCuentaBloqueada?.(hasta);
                setPasswordActual('');
                setError(resultado.mensaje);
                return;
            }

            if (resultado.status === 401) {
                setPasswordActual('');
            }
            setError(resultado.mensaje);
        } catch {
            setError('No se pudo conectar con el servidor para cambiar la contraseña.');
        } finally {
            setEnviando(false);
        }
    };

    const horaDesbloqueo = bloqueadoHasta
        ? new Date(bloqueadoHasta).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <form
            className="formulario-prestador formulario-cambio-password"
            onSubmit={manejarSubmit}
            aria-label="Cambiar contraseña"
            data-testid="formulario-cambio-password"
        >
            <div className="formulario-cambio-password__cabecera">
                <Lock size={18} aria-hidden="true" />
                <div>
                    <h3>
                        {obligatorio
                            ? 'Cambio de contraseña obligatorio'
                            : 'Cambiar contraseña'}
                    </h3>
                    <p className="formulario-cambio-password__subtitulo">
                        {obligatorio
                            ? 'Ingresaste con la contraseña temporal enviada a tu correo electrónico. Para continuar usando tu cuenta debés definir una nueva contraseña personal.'
                            : 'Por seguridad, tras 3 intentos fallidos de contraseña actual la cuenta se bloquea por 30 minutos.'}
                    </p>
                </div>
            </div>

            {obligatorio && (
                <div
                    className="formulario-cambio-password__aviso-obligatorio"
                    role="status"
                    data-testid="cambio-password-obligatorio"
                >
                    Ingresá como contraseña actual la clave temporal que recibiste
                    en tu correo y escribí dos veces tu nueva contraseña. Tras 3
                    intentos fallidos la cuenta se bloquea por 30 minutos.
                </div>
            )}

            {error && (
                <div
                    className="prestadores-estado prestadores-estado--error"
                    role="alert"
                    data-testid="cambio-password-error"
                >
                    {error}
                    {estaBloqueado && horaDesbloqueo && (
                        <div>
                            Cuenta bloqueada hasta las{' '}
                            <strong>{horaDesbloqueo}</strong>.
                        </div>
                    )}
                </div>
            )}

            {mensajeExito && (
                <div
                    className="formulario-cambio-password__exito"
                    role="status"
                    data-testid="cambio-password-exito"
                >
                    {mensajeExito}
                </div>
            )}

            <div className="prestadores-campo">
                <label htmlFor="cambio-password-actual">
                    Contraseña actual *
                </label>
                <div className="campo-password-wrapper">
                    <input
                        id="cambio-password-actual"
                        name="passwordActual"
                        type={mostrarActual ? 'text' : 'password'}
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        placeholder="Ingresá tu contraseña actual"
                        autoComplete="current-password"
                        disabled={enviando || estaBloqueado}
                    />
                    <button
                        type="button"
                        className="campo-password-toggle"
                        onClick={() => setMostrarActual((prev) => !prev)}
                        aria-label={
                            mostrarActual
                                ? 'Ocultar contraseña actual'
                                : 'Mostrar contraseña actual'
                        }
                        aria-pressed={mostrarActual}
                        disabled={enviando || estaBloqueado}
                    >
                        {mostrarActual ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="prestadores-campo">
                <label htmlFor="cambio-password-nueva">
                    Nueva contraseña * (mínimo 6 caracteres)
                </label>
                <div className="campo-password-wrapper">
                    <input
                        id="cambio-password-nueva"
                        name="nuevaPassword"
                        type={mostrarNueva ? 'text' : 'password'}
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        placeholder="Ingresá tu nueva contraseña"
                        autoComplete="new-password"
                        disabled={enviando || estaBloqueado}
                    />
                    <button
                        type="button"
                        className="campo-password-toggle"
                        onClick={() => setMostrarNueva((prev) => !prev)}
                        aria-label={
                            mostrarNueva
                                ? 'Ocultar nueva contraseña'
                                : 'Mostrar nueva contraseña'
                        }
                        aria-pressed={mostrarNueva}
                        disabled={enviando || estaBloqueado}
                    >
                        {mostrarNueva ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="prestadores-campo">
                <label htmlFor="cambio-password-confirmar">
                    Confirmar nueva contraseña *
                </label>
                <div className="campo-password-wrapper">
                    <input
                        id="cambio-password-confirmar"
                        name="confirmarPassword"
                        type={mostrarConfirmar ? 'text' : 'password'}
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        placeholder="Repetí tu nueva contraseña"
                        autoComplete="new-password"
                        disabled={enviando || estaBloqueado}
                    />
                    <button
                        type="button"
                        className="campo-password-toggle"
                        onClick={() => setMostrarConfirmar((prev) => !prev)}
                        aria-label={
                            mostrarConfirmar
                                ? 'Ocultar confirmación de contraseña'
                                : 'Mostrar confirmación de contraseña'
                        }
                        aria-pressed={mostrarConfirmar}
                        disabled={enviando || estaBloqueado}
                    >
                        {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="formulario-prestador__acciones">
                <button
                    type="submit"
                    className="btn-prestador btn-prestador--primario"
                    disabled={enviando || estaBloqueado}
                    data-testid="btn-actualizar-password"
                >
                    {enviando
                        ? 'Actualizando...'
                        : estaBloqueado
                          ? 'Cuenta bloqueada (30 min)'
                          : 'Actualizar contraseña'}
                </button>
            </div>
        </form>
    );
}
