// src/components/Profile.tsx - Versión CTF (pistas sutiles)
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getUserById, updateUser, User } from '../services/api';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: ''
  });

  const profileId = parseInt(id || '0');
  const isOwnProfile = currentUser?.id === profileId;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userData = await getUserById(profileId);
      setProfileUser(userData);
      
      if (userData.profile) {
        setFormData({
          fullName: userData.profile.fullName || '',
          phone: userData.profile.phone || '',
          department: userData.profile.department || ''
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateUser(profileId, formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      loadProfile(); // Recargar datos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Cargando Perfil de colaborados...</div>
      </div>
    );
  }

  if (error && !profileUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Accesso Denegado</h2>
          <p className="text-red-600">{error}</p>
          <Link to="/dashboard" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Regresar
          </Link>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con pista sutil */}
      <div className={`p-4 rounded-lg border-l-4 ${
        isOwnProfile 
          ? 'bg-green-50 border-green-400' 
          : 'bg-orange-50 border-orange-400'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isOwnProfile ? '👤 My Profile' : `👥 Perfil de ${profileUser.username}' `}
            </h1>
            <p className={isOwnProfile ? 'text-green-700' : 'text-orange-700'}>
              {isOwnProfile 
                ? 'You are viewing your own profile' 
                : `Viewing employee profile (ID: ${profileUser.id})`}
            </p>
            {!isOwnProfile && (
              <p className="text-xs text-gray-600 mt-1">
                💭Interesante... Puedo ver la información de otra persona
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Employee ID:</div>
            <div className="text-xl font-bold">{profileUser.id}</div>
          </div>
        </div>
      </div>

      {/* Profile Información */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Employee Información</h2>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                title={!isOwnProfile ? "Try editing someone else's profile..." : "Edit your profile"}
              >
                ✏️ Editar Perfil
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>

        {/* Basic Info (Read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <div className="p-3 bg-gray-100 rounded border">
              {profileUser.id}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="p-3 bg-gray-100 rounded border">
              {profileUser.username}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="p-3 bg-gray-100 rounded border">
              {profileUser.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className={`p-3 rounded border ${
              profileUser.role === 'admin' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profileUser.role === 'admin' ? '👑 Administrator' : '👤 Employee'}
            </div>
          </div>
        </div>

        {/* Editable Profile Data */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                 Nombre Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Departmento
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {!isOwnProfile && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">🤔 Curioso...</h4>
                <p className="text-yellow-700 text-sm">
                Estás editando el perfil de <strong>{profileUser.username}</strong> (ID: {profileUser.id}).
                Esto podría ser una capacidad interesante para explorar...
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={updating}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
               Nombre Completo
              </label>
              <div className="p-3 bg-gray-50 rounded border">
                {profileUser.profile?.fullName || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono
              </label>
              <div className="p-3 bg-gray-50 rounded border">
                {profileUser.profile?.phone || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departmento
              </label>
              <div className="p-3 bg-gray-50 rounded border">
                {profileUser.profile?.department || 'Not specified'}
              </div>
            </div>
          </div>
        )}

        {/* Sensitive Data (Pista sutil) */}
        {profileUser.profile && (profileUser.profile.salary || profileUser.profile.ssn) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800 mb-3">💼  Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {profileUser.profile.salary && (
                <div>
                  <strong className="text-blue-700">Sueldo </strong>
                  <div className="text-blue-600">${profileUser.profile.salary.toLocaleString()}</div>
                </div>
              )}
              {profileUser.profile.ssn && (
                <div>
                  <strong className="text-blue-700">SSN:</strong>
                  <div className="text-blue-600">{profileUser.profile.ssn}</div>
                </div>
              )}
            </div>
            {!isOwnProfile && (
              <p className="text-blue-600 text-xs mt-2">
                🤔 "¿Debo poder ver esta información sensible?"
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700">✅ {success}</p>
            {!isOwnProfile && (
              <p className="text-green-600 text-sm mt-1">
                💭 "Interesting... I was able to modify someone else's data"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Security Observation Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-bold text-purple-800 mb-3">🔍 Notas del investigador de seguridads</h3>
        <div className="text-sm text-purple-700 space-y-2">
          <p><strong>Observación:</strong> Acceso directo al perfil mediante parámetros URL</p>
          <p><strong>Patrón:</strong> nota la URL y el intercambio de variables</p>
          <p><strong>Acceso a datos:</strong> {isOwnProfile ? 'información proá (normal)' : 'Acecso multisuario (interesate)'}</p>
          <p><strong>Capacidad de Editar :</strong> Modificación Perfil {!isOwnProfile ? 'más allá de las fronteras de los usuarios' : 'dentro de su propio ámbito'}</p>
          <div className="text-purple-600 text-xs mt-2 italic">
            "Every parameter tells a story... What story does this URL tell?"
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          to="/dashboard" 
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
        >
          ← Regresar
        </Link>
      </div>
    </div>
  );
};

export default Profile;