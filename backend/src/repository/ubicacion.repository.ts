import { IUbicacion } from '../interfaces/ubicacion.interface';

const normalizar = (texto: string): string =>
    texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const UBICACIONES_INICIALES: IUbicacion[] = [
    {
        id: 1,
        pais: 'Argentina',
        provincia: 'Córdoba',
        localidad: 'Córdoba Capital',
        codigoPostal: '5000',
        radio: 10,
    },
    {
        id: 2,
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        localidad: 'La Plata',
        codigoPostal: '1900',
        radio: 15,
    },
    {
        id: 3,
        pais: 'Argentina',
        provincia: 'Santa Fe',
        localidad: 'Rosario',
        codigoPostal: '2000',
        radio: 20,
    },
    {
        id: 4,
        pais: 'Argentina',
        provincia: 'Ciudad Autónoma de Buenos Aires',
        localidad: 'CABA',
        codigoPostal: '1000',
        radio: 15,
    },
    {
        id: 5,
        pais: 'Argentina',
        provincia: 'Mendoza',
        localidad: 'Mendoza',
        codigoPostal: '5500',
        radio: 15,
    },
    {
        id: 6,
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        localidad: '9 de Julio',
        codigoPostal: '6500',
        radio: 10,
    },
];

export class UbicacionRepository {
    private ubicaciones: IUbicacion[] = UBICACIONES_INICIALES.map((u) => ({ ...u }));

    findAll(): IUbicacion[] {
        return this.ubicaciones.map((u) => ({ ...u }));
    }

    findById(id: number): IUbicacion | undefined {
        const encontrada = this.ubicaciones.find((u) => u.id === id);
        return encontrada ? { ...encontrada } : undefined;
    }

    create(datos: Omit<IUbicacion, 'id'>): IUbicacion {
        const nueva: IUbicacion = {
            id: this.siguienteId(),
            pais: datos.pais.trim() || 'Argentina',
            provincia: datos.provincia.trim(),
            localidad: datos.localidad.trim(),
            codigoPostal: datos.codigoPostal.trim(),
            radio: Number.isFinite(datos.radio) && datos.radio > 0 ? datos.radio : 10,
        };
        this.ubicaciones.push(nueva);
        return { ...nueva };
    }

    update(id: number, datos: Partial<Omit<IUbicacion, 'id'>>): IUbicacion | null {
        const index = this.ubicaciones.findIndex((u) => u.id === id);
        if (index === -1) return null;

        const actual = this.ubicaciones[index];
        this.ubicaciones[index] = {
            ...actual,
            ...(datos.pais !== undefined ? { pais: datos.pais.trim() || actual.pais } : {}),
            ...(datos.provincia !== undefined ? { provincia: datos.provincia.trim() } : {}),
            ...(datos.localidad !== undefined ? { localidad: datos.localidad.trim() } : {}),
            ...(datos.codigoPostal !== undefined
                ? { codigoPostal: datos.codigoPostal.trim() }
                : {}),
            ...(datos.radio !== undefined && Number.isFinite(datos.radio) && datos.radio > 0
                ? { radio: datos.radio }
                : {}),
            id,
        };

        return { ...this.ubicaciones[index] };
    }

    findOrCreate(datos: {
        pais?: string;
        provincia?: string;
        localidad?: string;
        codigoPostal?: string;
        radio?: number;
    }): IUbicacion {
        const pais = datos.pais?.trim() || 'Argentina';
        const provincia = datos.provincia?.trim() || '';
        const localidad = datos.localidad?.trim() || '';
        const codigoPostal = datos.codigoPostal?.trim() || '';
        const radio =
            datos.radio !== undefined && Number.isFinite(datos.radio) && datos.radio > 0
                ? datos.radio
                : undefined;

        const existente = this.ubicaciones.find((u) => {
            const mismaProvincia = provincia
                ? normalizar(u.provincia) === normalizar(provincia)
                : true;
            const mismaLocalidad = localidad
                ? normalizar(u.localidad) === normalizar(localidad)
                : true;
            const mismoCp = codigoPostal ? normalizar(u.codigoPostal) === normalizar(codigoPostal) : true;
            const mismoRadio = radio !== undefined ? u.radio === radio : true;

            if (localidad && provincia) {
                return mismaProvincia && mismaLocalidad && mismoCp && mismoRadio;
            }
            if (localidad) {
                return mismaLocalidad && mismoCp && mismoRadio;
            }
            if (codigoPostal) {
                return mismoCp && mismoRadio;
            }
            return false;
        });

        if (existente) {
            return { ...existente };
        }

        // Si ya existe la provincia/localidad pero con distinto radio o CP, hereda CP/provincia faltante
        const baseGeografica = this.ubicaciones.find(
            (u) =>
                (localidad && normalizar(u.localidad) === normalizar(localidad)) ||
                (provincia && normalizar(u.provincia) === normalizar(provincia))
        );

        return this.create({
            pais,
            provincia: provincia || baseGeografica?.provincia || 'Córdoba',
            localidad: localidad || baseGeografica?.localidad || 'Córdoba Capital',
            codigoPostal: codigoPostal || baseGeografica?.codigoPostal || '5000',
            radio: radio ?? baseGeografica?.radio ?? 10,
        });
    }

    private siguienteId(): number {
        return this.ubicaciones.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    }
}

export const ubicacionRepositorySingleton = new UbicacionRepository();
