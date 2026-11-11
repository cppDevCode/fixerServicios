import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';


interface IUsuarioDetalle {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  ubicacionId?: string;
  codigoPostal?: string;
  radio?: number;
}
export const UsuarioDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();const [usuario, setUsuario] = useState<Partial<IUsuarioDetalle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        const result = await response.json();
        if (result.code === 200) {
          setUsuario(result.data);
        } else {
          setError('No se encontró el usuario');
        }
      } catch {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!usuario) return;
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          codigoPostal: usuario.codigoPostal,
          radio: Number(usuario.radio),
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSuccess('Perfil actualizado correctamente');
        setTimeout(() => navigate('/usuarios'), 1500);
      } else {
        setError(result.msg || 'Error al actualizar');
      }
    } catch {
      setError('Error de conexión con el servidor');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando perfil...</div>;
  if (error && !usuario) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!usuario) return <div style={{ padding: '2rem' }}>No se encontró el usuario</div>;
  

  return (
    <div className="usuarios-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Editar Perfil</h2>
        <Link to="/usuarios" style={{ color: '#64748B', textDecoration: 'none' }}>← Volver al listado</Link>
      </div>

      {error && <div style={{ color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: '#16A34A', backgroundColor: '#DCFCE7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Nombre</label>
          <input type="text" name="nombre" value={usuario.nombre} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Apellido</label>
          <input type="text" name="apellido" value={usuario.apellido} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Email</label>
          <input type="email" name="email" value={usuario.email} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Código Postal</label>
          <input type="text" name="codigoPostal" placeholder="Ej: 5000" value={usuario.codigoPostal || ''} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Radio de Cobertura (km)</label>
          <input type="number" name="radio" placeholder="Ej: 15" value={usuario.radio || ''} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Guardar Cambios</button>
          <Link to="/usuarios" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#F1F5F9', color: '#475569', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', textAlign: 'center' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  );
};