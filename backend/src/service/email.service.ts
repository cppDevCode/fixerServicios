import { randomInt } from 'node:crypto';

const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz';
const DIGITOS = '23456789';
const SIMBOLOS = '!@#$%&*_-';
const CONJUNTO_COMPLETO = `${MAYUSCULAS}${MINUSCULAS}${DIGITOS}${SIMBOLOS}`;

/**
 * Genera una contraseña aleatoria criptográficamente segura (crypto.randomInt)
 * que garantiza al menos 1 mayúscula, 1 minúscula, 1 dígito y 1 símbolo especial.
 */
export function generarPasswordSeguraAleatoria(longitud: number = 12): string {
    const largo = Math.max(10, longitud);
    const caracteres: string[] = [
        MAYUSCULAS[randomInt(0, MAYUSCULAS.length)],
        MINUSCULAS[randomInt(0, MINUSCULAS.length)],
        DIGITOS[randomInt(0, DIGITOS.length)],
        SIMBOLOS[randomInt(0, SIMBOLOS.length)],
    ];

    for (let i = caracteres.length; i < largo; i++) {
        caracteres.push(CONJUNTO_COMPLETO[randomInt(0, CONJUNTO_COMPLETO.length)]);
    }

    // Mezcla Fisher-Yates usando aleatoriedad criptográfica
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
    }

    return caracteres.join('');
}

export interface ICorreoEnviado {
    para: string;
    asunto: string;
    cuerpoTexto: string;
    cuerpoHtml: string;
    passwordTemporal: string;
    enviadoEn: string;
    modo: 'webhook' | 'simulado';
}

export interface IDatosCorreoCredenciales {
    destinatario: string;
    nombre: string;
    apellido: string;
    passwordTemporal: string;
}

export class EmailService {
    private correosEnviados: ICorreoEnviado[] = [];

    public async enviarCredencialesTemporales(
        datos: IDatosCorreoCredenciales
    ): Promise<ICorreoEnviado> {
        const asunto = 'Fixer Servicios — Tus credenciales temporales de acceso';
        const nombreCompleto = `${datos.nombre} ${datos.apellido}`.trim();

        const cuerpoTexto = [
            `Hola ${nombreCompleto},`,
            '',
            'Tu perfil profesional fue registrado en Fixer Servicios por un administrador.',
            '',
            'Tus credenciales temporales de ingreso son:',
            `  Correo: ${datos.destinatario}`,
            `  Contraseña temporal: ${datos.passwordTemporal}`,
            '',
            'Por motivos de seguridad, al iniciar sesión por primera vez se te solicitará obligatoriamente cambiar esta contraseña.',
            '',
            'Saludos,',
            'Equipo de Fixer Servicios',
        ].join('\n');

        const cuerpoHtml = [
            `<p>Hola <strong>${nombreCompleto}</strong>,</p>`,
            '<p>Tu perfil profesional fue registrado en <strong>Fixer Servicios</strong> por un administrador.</p>',
            `<p><strong>Correo:</strong> ${datos.destinatario}<br/>`,
            `<strong>Contraseña temporal:</strong> <code>${datos.passwordTemporal}</code></p>`,
            '<p>Por motivos de seguridad, al iniciar sesión por primera vez deberás cambiar esta contraseña de forma obligatoria.</p>',
            '<p>Equipo de Fixer Servicios</p>',
        ].join('');

        let modo: 'webhook' | 'simulado' = 'simulado';
        const webhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();

        if (webhookUrl) {
            try {
                const res = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: datos.destinatario,
                        subject: asunto,
                        text: cuerpoTexto,
                        html: cuerpoHtml,
                    }),
                });
                if (res.ok) {
                    modo = 'webhook';
                }
            } catch (error) {
                console.error(
                    '[EmailService] Error al enviar mediante EMAIL_WEBHOOK_URL; usando modo simulado:',
                    error
                );
            }
        }

        const registro: ICorreoEnviado = {
            para: datos.destinatario,
            asunto,
            cuerpoTexto,
            cuerpoHtml,
            passwordTemporal: datos.passwordTemporal,
            enviadoEn: new Date().toISOString(),
            modo,
        };

        this.correosEnviados.push(registro);

        if (process.env.NODE_ENV !== 'test') {
            console.info(
                `[EmailService:${modo}] Correo enviado a ${registro.para} | Asunto: "${registro.asunto}" | Contraseña temporal: ${registro.passwordTemporal}`
            );
        }

        return { ...registro };
    }

    public obtenerCorreosEnviados(): ICorreoEnviado[] {
        return this.correosEnviados.map((c) => ({ ...c }));
    }

    public obtenerUltimoCorreoPara(email: string): ICorreoEnviado | undefined {
        const objetivo = email.trim().toLowerCase();
        for (let i = this.correosEnviados.length - 1; i >= 0; i--) {
            if (this.correosEnviados[i].para.trim().toLowerCase() === objetivo) {
                return { ...this.correosEnviados[i] };
            }
        }
        return undefined;
    }

    public limpiarHistorial(): void {
        this.correosEnviados = [];
    }
}

export const emailServiceSingleton = new EmailService();
