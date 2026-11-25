import { describe, it, expect } from 'vitest';
import {
    EmailService,
    generarPasswordSeguraAleatoria,
} from '../service/email.service';

describe('EmailService y generador de contraseñas seguras', () => {
    it('generarPasswordSeguraAleatoria genera contraseñas aleatorias con mayúscula, minúscula, número y símbolo', () => {
        const generadas = new Set<string>();

        for (let i = 0; i < 20; i++) {
            const clave = generarPasswordSeguraAleatoria(12);
            expect(clave.length).toBe(12);
            expect(/[A-Z]/.test(clave)).toBe(true);
            expect(/[a-z]/.test(clave)).toBe(true);
            expect(/[0-9]/.test(clave)).toBe(true);
            expect(/[!@#$%&*_-]/.test(clave)).toBe(true);
            generadas.add(clave);
        }

        expect(generadas.size).toBe(20);
    });

    it('EmailService.enviarCredencialesTemporales registra el correo enviado con la contraseña temporal', async () => {
        const service = new EmailService();
        const correo = await service.enviarCredencialesTemporales({
            destinatario: 'nuevo.pro@example.com',
            nombre: 'Sofía',
            apellido: 'Ledesma',
            passwordTemporal: 'Abc123!@#XYZ',
        });

        expect(correo.para).toBe('nuevo.pro@example.com');
        expect(correo.passwordTemporal).toBe('Abc123!@#XYZ');
        expect(correo.cuerpoTexto).toContain('Sofía Ledesma');
        expect(correo.cuerpoTexto).toContain('Abc123!@#XYZ');
        expect(correo.cuerpoTexto).toContain('obligatoriamente cambiar');

        const ultimo = service.obtenerUltimoCorreoPara('nuevo.pro@example.com');
        expect(ultimo).toEqual(correo);
        expect(service.obtenerCorreosEnviados()).toHaveLength(1);
    });
});
