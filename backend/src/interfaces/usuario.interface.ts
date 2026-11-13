export interface IUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string; 
  rol: 'USUARIO' | 'PRESTADOR' | 'ADMIN';
  prestadorId?: number;
  ubicacionId?: string;
  codigopostal?: string;
  radio?: number;
  preguntaSecreta?: string;
  respuestaSecretaHash?: string;
  createdAt: string;
}