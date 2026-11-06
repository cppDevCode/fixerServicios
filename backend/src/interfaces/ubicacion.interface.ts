export interface IUbicacion {
  id: string;
  pais: string;
  provincia: string;
  ciudad: string;
  codigoPostal: string;
  radio: number; // Radio de cobertura en km
}