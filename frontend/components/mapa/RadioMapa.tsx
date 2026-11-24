import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { obtenerCoordenadas, Coordenadas } from '../../services/geocoding.service';
import 'leaflet/dist/leaflet.css';

interface RadioMapaProps {
codigoPostal: string;
ciudad?: string;
radioKm: number;
nombreZona?: string;
}

export const RadioMapa = ({ codigoPostal, ciudad, radioKm, nombreZona }: RadioMapaProps) => {
    const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cargarCoordenadas = async () => {
            setLoading(true);
            setError(false);
        const coords = await obtenerCoordenadas(codigoPostal, ciudad);
        if (coords) {
            setCoordenadas(coords);
        } else {
            setError(true);
        }
        setLoading(false);
        };
    cargarCoordenadas();
    }, [codigoPostal, ciudad]);

    if (loading) {
    return (
        <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B' }}>Cargando mapa...</span>
        </div>
    );
    }

    if (error || !coordenadas) {
    return (
        <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', padding: '1rem', textAlign: 'center' }}>
            <span style={{ color: '#DC2626', fontSize: '0.9rem' }}>
            No se pudo ubicar la zona (CP: {codigoPostal}).<br />
            Verificá el código postal.
        </span>
        </div>
    );
    }

    const centro: [number, number] = [coordenadas.lat, coordenadas.lon];
    const radioMetros = radioKm * 1000;

    return (
    <div style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        <MapContainer center={centro} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
            center={centro}
            radius={radioMetros}
            pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.15, weight: 2 }}
            />
            <Marker position={centro}>
                <Popup>
                    {nombreZona ? `Zona: ${nombreZona}` : `CP: ${codigoPostal}`}
                    <br />
                Radio: {radioKm} km
                </Popup>
            </Marker>
        </MapContainer>
    </div>
    );
};