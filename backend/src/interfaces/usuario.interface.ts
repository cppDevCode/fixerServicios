export interface IUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string; 
  rol: 'USUARIO' | 'PRESTADOR' | 'ADMIN';
  ubicacionId?: string;
  preguntaSecreta?: string;
  respuestaSecretaHash?: string;
  createdAt: string;
}