export interface IPrestador {
    id: number;
    nombre: string;
    apellido: string;
    matricula?: string;
    aniosExperiencia: number;
    acercaDe: string;
    ofreceGarantia: boolean;
    categoriaId: string;
    telefono: {
        codPais: string;
        codArea: string;
        nroTelefono: string;
    };
    ratingPromedio?: number;
}
