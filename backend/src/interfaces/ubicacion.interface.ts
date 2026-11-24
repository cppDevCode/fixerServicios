export interface IUbicacion {
    id: number;
    pais: string;
    provincia: string;
    localidad: string;
    codigoPostal: string;
    radio: number; // Radio de cobertura en km
}
