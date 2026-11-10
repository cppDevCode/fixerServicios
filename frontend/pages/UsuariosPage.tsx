import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importante para la navegación

interface IUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  ubicacionId?: string;
}

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/usuarios?page=${page}&limit=5&search=${search}`);
        const result = await response.json();

        if (result.code === 200) {
          setUsuarios(result.data);
          setTotalPages(result.meta.totalPages);
          setTotalItems(result.meta.total);
        } else {
          setError(result.msg || 'Error al cargar los usuarios');
        }
      } catch {
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsuarios();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administrá los usuarios registrados en la plataforma.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, email o ciudad..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-state">Cargando usuarios...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ubicación ID</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron usuarios.</td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link to={`/usuarios/${user.id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: '600' }}>
                        {user.id}
                      </Link>
                    </td>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.rol.toLowerCase()}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td>{user.ubicacionId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <span>Total: {totalItems} usuarios</span>
        <div className="pagination-controls">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="btn-pagination"
          >
            Anterior
          </button>
          <span className="page-info">Página {page} de {totalPages}</span>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};