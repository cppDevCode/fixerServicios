export interface IPrestador {
    id: number;
    nombre: string;
    apellido: string;
    fotoUrl?: string;
    matricula?: string;
    aniosExperiencia: number;
    acercaDe: string;
    ofreceGarantia: boolean;
    categoriaId: string;
    provincia?: string;
    localidad?: string;
    telefono: {
        codPais: string;
        codArea: string;
        nroTelefono: string;
    };
    ratingPromedio?: number;
}
