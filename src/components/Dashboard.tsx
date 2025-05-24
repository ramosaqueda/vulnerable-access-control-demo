// src/components/Dashboard.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getAllUsers, User } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVulnerableContent, setShowVulnerableContent] = useState(false);

  // 🚨 VULNERABLE: Cualquier usuario puede intentar cargar lista de todos los usuarios
  const loadAllUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      setShowVulnerableContent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Dashboard - Broken Access Control Demo
        </h1>
        <p className="text-gray-600">
          Bienvenido, <strong>{user.username}</strong> (Rol: {user.role})
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to={`/profile/${user.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold">Mi Perfil</div>
          <div className="text-sm opacity-90">Ver/Editar mi información</div>
        </Link>

        <Link
          to="/admin"
          className={`p-6 rounded-lg text-center transition-colors ${
            user.role === 'admin' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-semibold">Panel Admin</div>
          <div className="text-sm opacity-90">
            {user.role === 'admin' ? 'Acceso autorizado' : '🚨 Vulnerable!'}
          </div>
        </Link>

        <Link
          to="/system"
          className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-2xl mb-2">🖥️</div>
          <div className="font-semibold">Info Sistema</div>
          <div className="text-sm opacity-90">🚨 Datos sensibles</div>
        </Link>

        <Link
          to="/demo"
          className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-2xl mb-2">💥</div>
          <div className="font-semibold">Demo Ataques</div>
          <div className="text-sm opacity-90">Vulnerabilidades en acción</div>
        </Link>
      </div>

      {/* Employee Directory Section - Pista sutil */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          👥 Directorio de Colaboradores
        </h2>
        <p className="text-gray-600 mb-4">
          Acceso rápido a los perfiles de tus compañeros, tu ID de colaborador #{user.id}.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(id => (
            <Link
              key={id}
              to={`/noesaqui/${id}`}
              className={`p-3 rounded border text-center transition-colors hover:shadow-md ${
                id === user.id 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Colaborador #{id}</div>
              <div className="text-sm">
                {id === user.id ? '👤 Your Profile' : '👥 Colleague'}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-3">
          💡 Tip: Los identificadores de los empleados son secuenciales para facilitar la navegación.
        </div>
      </div>

      {/* Management Tools Section - Pista sutil */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          🔧 Herramientas de Administración
        </h2>
        <p className="text-gray-600 mb-4">
         Acceda a herramientas avanzadas de la empresa y funciones de gestión de empleados.
        </p>
        
        <button
          onClick={loadAllUsers}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 mb-4"
        >
          {loading ? 'Loading...' : '📊 View Employee Statistics'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">❌ Access denied: {error}</p>
            <p className="text-sm text-gray-600 mt-1">
              💭 "Interesante... ¿qué pasaría si tuviera diferentes permisos?"
            </p>
          </div>
        )}

        {showVulnerableContent && allUsers.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-blue-700 mb-2">📈 Employee Statistics</h3>
            <p className="text-blue-600 mb-3">
              Los datos se cargaron correctamente para {allUsers.length} colaboradores
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {allUsers.map(u => (
                <div key={u.id} className="bg-white p-3 rounded border">
                  <div className="font-medium">#{u.id} - {u.username}</div>
                  <div className="text-sm text-gray-600">{u.email} | {u.role}</div>
                  {u.profile && (
                    <div className="text-xs text-orange-600 mt-1">
                      💰 Annual: ${u.profile.salary?.toLocaleString()} | 
                      🆔 ID: {u.profile.ssn}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              📝 Nota mental: Probablemente estos datos deberían restringirse...
            </div>
          </div>
        )}
      </div>

      {/* Information Panel - Pistas sutiles */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          📋 Tu información de Session
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">👤 Usuario Actual</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Rol:</strong> {user.role}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🔑 Detalle de Sesión :</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>Almacenamiento:</strong> Browser Local Storage</div>
              <div><strong>Tipo de Token:</strong> JWT (JSON Web Token)</div>
              <div><strong>Expiración:</strong> 24 hours</div>
              <div><strong>Inspeccionar en :</strong> DevTools → Application</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          💭 "I wonder what information is stored in that token... ;)"
        </div>
      </div>

      {/* Hints Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">
          🧩Rompecabezas de seguridad diario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-yellow-700 mb-2">🔍 Desafío del explorador:</h3>
            <p className="text-yellow-600">
              "¿Puedes encontrar información sobre tus colegas sin su permiso?"
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-orange-700 mb-2">🚀 Búsqueda de privilegios:</h3>
            <p className="text-orange-600">
              "¿Qué pasa cuando no existen límites?"
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-red-700 mb-2">🗝️ Buscador secreto:</h3>
            <p className="text-red-600">
              "Cada sistema tiene su configuración oculta..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;