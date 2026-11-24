import { IUsuario } from '../interfaces/usuario.interface';
import { IUbicacion } from '../interfaces/ubicacion.interface';
import {
    UbicacionRepository,
    ubicacionRepositorySingleton,
} from './ubicacion.repository';

// Mock normalizado de Usuarios (IDs numéricos homogéneos con RESENA.usuarioId y PRESTADOR.id)
// Incluye clientes 3..7 referenciados en resena.mock.ts para garantizar integridad referencial.
export const usuariosMock: IUsuario[] = [
    {
        id: 1,
        nombre: 'Bruna',
        apellido: 'Ramírez',
        email: 'bruna@example.com',
        passwordHash: '123456',
        rol: 'ADMIN',
        ubicacionId: 1,
        preguntaSecreta: '¿Nombre de tu primera mascota?',
        respuestaSecretaHash: 'Firulais',
        createdAt: new Date('2026-01-01T10:00:00.000Z').toISOString(),
    },
    {
        id: 2,
        nombre: 'Carlos',
        apellido: 'Gómez',
        email: 'carlos@example.com',
        passwordHash: '123456',
        rol: 'PRESTADOR',
        prestadorId: 1,
        ubicacionId: 1,
        preguntaSecreta: '¿Ciudad de nacimiento?',
        respuestaSecretaHash: 'Cordoba',
        createdAt: new Date('2026-01-01T10:05:00.000Z').toISOString(),
    },
    {
        id: 3,
        nombre: 'Berta',
        apellido: 'Martínez',
        email: 'berta@example.com',
        passwordHash: '123456',
        rol: 'USUARIO',
        ubicacionId: 3,
        preguntaSecreta: '¿Nombre de tu primera mascota?',
        respuestaSecretaHash: 'Luna',
        createdAt: new Date('2026-01-01T10:10:00.000Z').toISOString(),
    },
    {
        id: 4,
        nombre: 'Lucas',
        apellido: 'Pereyra',
        email: 'lucas@example.com',
        passwordHash: '123456',
        rol: 'USUARIO',
        ubicacionId: 2,
        preguntaSecreta: '¿Ciudad de nacimiento?',
        respuestaSecretaHash: 'La Plata',
        createdAt: new Date('2026-01-01T10:15:00.000Z').toISOString(),
    },
    {
        id: 5,
        nombre: 'Mariana',
        apellido: 'Sosa',
        email: 'mariana@example.com',
        passwordHash: '123456',
        rol: 'USUARIO',
        ubicacionId: 4,
        preguntaSecreta: '¿Nombre de tu primera mascota?',
        respuestaSecretaHash: 'Toby',
        createdAt: new Date('2026-01-01T10:20:00.000Z').toISOString(),
    },
    {
        id: 6,
        nombre: 'Nicolás',
        apellido: 'Herrera',
        email: 'nicolas@example.com',
        passwordHash: '123456',
        rol: 'USUARIO',
        ubicacionId: 5,
        preguntaSecreta: '¿Ciudad de nacimiento?',
        respuestaSecretaHash: 'Mendoza',
        createdAt: new Date('2026-01-01T10:25:00.000Z').toISOString(),
    },
    {
        id: 7,
        nombre: 'Florencia',
        apellido: 'Díaz',
        email: 'florencia@example.com',
        passwordHash: '123456',
        rol: 'USUARIO',
        ubicacionId: 1,
        preguntaSecreta: '¿Nombre de tu primera mascota?',
        respuestaSecretaHash: 'Milo',
        createdAt: new Date('2026-01-01T10:30:00.000Z').toISOString(),
    },
];

export class UsuarioRepository {
    private usuarios: IUsuario[] = usuariosMock.map((u) => ({ ...u }));

    constructor(
        private readonly ubicacionRepo: UbicacionRepository = ubicacionRepositorySingleton
    ) {}

    async findAll(): Promise<IUsuario[]> {
        return this.usuarios.map((u) => ({ ...u }));
    }

    async findById(id: number): Promise<IUsuario | undefined> {
        const encontrado = this.usuarios.find((u) => u.id === id);
        return encontrado ? { ...encontrado } : undefined;
    }

    existsById(id: number): boolean {
        return this.usuarios.some((u) => u.id === id);
    }

    async findByEmail(email: string): Promise<IUsuario | undefined> {
        const emailNormalizado = email.trim().toLowerCase();
        const encontrado = this.usuarios.find(
            (u) => u.email.trim().toLowerCase() === emailNormalizado
        );
        return encontrado ? { ...encontrado } : undefined;
    }

    async update(
        id: number,
        data: Partial<Omit<IUsuario, 'id' | 'createdAt'>>
    ): Promise<IUsuario | null> {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index === -1) return null;

        this.usuarios[index] = {
            ...this.usuarios[index],
            ...data,
            id,
            updatedAt: new Date().toISOString(),
        };
        return { ...this.usuarios[index] };
    }

    async create(data: Omit<IUsuario, 'id' | 'createdAt'>): Promise<IUsuario> {
        const nuevoId = this.siguienteId();
        const nuevoUsuario: IUsuario = {
            ...data,
            id: nuevoId,
            createdAt: new Date().toISOString(),
        };
        this.usuarios.push(nuevoUsuario);
        return { ...nuevoUsuario };
    }

    async findUbicacionById(id: number): Promise<IUbicacion | undefined> {
        return this.ubicacionRepo.findById(id);
    }

    async findAllUbicaciones(): Promise<IUbicacion[]> {
        return this.ubicacionRepo.findAll();
    }

    private siguienteId(): number {
        return this.usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    }
}

export const usuarioRepositorySingleton = new UsuarioRepository();
