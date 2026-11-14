import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  esAdmin,
  esPrestador,
  obtenerUsuarioActual,
} from '../services/sesion.service';

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
  const navigate = useNavigate();
  const usuarioActual = obtenerUsuarioActual();
  const tienePermisoPerfil =
    esAdmin(usuarioActual) ||
    (usuarioActual !== null && String(usuarioActual.id) === String(id));
  const rutaRegreso = esAdmin(usuarioActual)
    ? '/usuarios'
    : esPrestador(usuarioActual)
      ? `/prestadores/${usuarioActual?.prestadorId ?? 1}`
      : '/prestadores/catalogo';

  const [usuario, setUsuario] = useState<IUsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = '/api/v1';

  useEffect(() => {
    if (!tienePermisoPerfil) {
      setLoading(false);
      return;
    }

    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        const result = await response.json();
        if (result.code === 200) setUsuario(result.data);
        else setError('No se encontró el usuario');
      } catch {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id, tienePermisoPerfil]);

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
        setTimeout(() => navigate(rutaRegreso), 1500);
      } else {
        setError(result.msg || 'Error al actualizar');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  if (!tienePermisoPerfil) {
    return (
      <div className="usuarios-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Acceso Restringido</h2>
        <p>Solo podés consultar o editar tu propio perfil de usuario.</p>
        <Link to={rutaRegreso} className="perfil-back-link">← Volver</Link>
      </div>
    );
  }

  if (loading) return <div className="usuarios-container">Cargando perfil...</div>;
  if (!usuario) return <div className="usuarios-container">No se encontró el usuario</div>;

  return (
    <div className="usuarios-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="perfil-header">
        <h2 className="perfil-title">Editar Perfil</h2>
        <Link to={rutaRegreso} className="perfil-back-link">← Volver</Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleGuardar} className="perfil-form">
        <div className="perfil-form-group">
          <label className="perfil-label">Nombre</label>
          <input type="text" name="nombre" value={usuario.nombre} onChange={handleChange} className="perfil-input" />
        </div>
        <div className="perfil-form-group">
          <label className="perfil-label">Apellido</label>
          <input type="text" name="apellido" value={usuario.apellido} onChange={handleChange} className="perfil-input" />
        </div>
        <div className="perfil-form-group">
          <label className="perfil-label">Email</label>
          <input type="email" name="email" value={usuario.email} onChange={handleChange} className="perfil-input" />
        </div>
        <div className="perfil-form-group">
          <label className="perfil-label">Código Postal</label>
          <input type="text" name="codigoPostal" value={usuario.codigoPostal || ''} onChange={handleChange} placeholder="Ej: 5000" className="perfil-input" />
        </div>
        <div className="perfil-form-group">
          <label className="perfil-label">Radio de Cobertura (km)</label>
          <input type="number" name="radio" value={usuario.radio || ''} onChange={handleChange} placeholder="Ej: 15" className="perfil-input" />
        </div>

        <div className="perfil-actions">
          <button type="submit" className="btn-save">Guardar Cambios</button>
          <Link to={rutaRegreso} className="btn-cancel">Cancelar</Link>
        </div>
      </form>
    </div>
  );
};