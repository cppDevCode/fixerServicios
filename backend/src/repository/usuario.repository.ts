import { IUsuario } from '../interfaces/usuario.interface';
import { IUbicacion } from '../interfaces/ubicacion.interface';

// Mock de Ubicaciones
export const ubicacionesMock: IUbicacion[] = [
  { id: '1', pais: 'Argentina', provincia: 'Córdoba', ciudad: 'Córdoba Capital', codigoPostal: '5000', radio: 10 },
  { id: '2', pais: 'Argentina', provincia: 'Buenos Aires', ciudad: 'La Plata', codigoPostal: '1900', radio: 15 },
  { id: '3', pais: 'Argentina', provincia: 'Santa Fe', ciudad: 'Rosario', codigoPostal: '2000', radio: 20 },
];

// Mock de Usuarios
export const usuariosMock: IUsuario[] = [
  {
    id: '1',
    nombre: 'Bruna',
    apellido: 'Ramírez',
    email: 'bruna@example.com',
    passwordHash: '123456',
    rol: 'ADMIN',
    ubicacionId: '1',
    preguntaSecreta: '¿Nombre de tu primera mascota?',
    respuestaSecretaHash: 'Firulais',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Carlos',
    apellido: 'González',
    email: 'carlos@example.com',
    passwordHash: '123456',
    rol: 'PRESTADOR',
    ubicacionId: '2',
    preguntaSecreta: '¿Ciudad de nacimiento?',
    respuestaSecretaHash: 'Cordoba',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'Berta',
    apellido: 'Martínez',
    email: 'berta@example.com',
    passwordHash: '123456',
    rol: 'USUARIO',
    ubicacionId: '3',
    preguntaSecreta: '¿Nombre de tu primera mascota?',
    respuestaSecretaHash: 'Luna',
    createdAt: new Date().toISOString(),
  },

];

// Clase Repository
export class UsuarioRepository {
  async findAll(): Promise<IUsuario[]> {
    return usuariosMock;
  }

  async findById(id: string): Promise<IUsuario | undefined> {
    return usuariosMock.find(u => u.id === id);
  }

  async findByEmail(email: string): Promise<IUsuario | undefined> {
    return usuariosMock.find(u => u.email === email);
  }

  async update(id: string, data: Partial<IUsuario>): Promise<IUsuario | null> {
    const index = usuariosMock.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    usuariosMock[index] = { ...usuariosMock[index], ...data };
    return usuariosMock[index];
  }

  async findUbicacionById(id: string): Promise<IUbicacion | undefined> {
    return ubicacionesMock.find(u => u.id === id);
  }

  async create(data: Omit<IUsuario, 'id' | 'createdAt'>): Promise<IUsuario> {
    const nuevoId = (usuariosMock.length + 1).toString();
    const nuevoUsuario: IUsuario = {
      ...data,
      id: nuevoId,
      createdAt: new Date().toISOString(),
    };
    usuariosMock.push(nuevoUsuario);
    return nuevoUsuario;
  }
}