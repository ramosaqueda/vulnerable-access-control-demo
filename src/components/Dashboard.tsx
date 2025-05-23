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
          👥 Employee Directory
        </h2>
        <p className="text-gray-600 mb-4">
          Quick access to colleague profiles. Your employee ID is #{user.id}.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(id => (
            <Link
              key={id}
              to={`/profile/${id}`}
              className={`p-3 rounded border text-center transition-colors hover:shadow-md ${
                id === user.id 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Employee #{id}</div>
              <div className="text-sm">
                {id === user.id ? '👤 Your Profile' : '👥 Colleague'}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-3">
          💡 Tip: Employee IDs are sequential for easy navigation
        </div>
      </div>

      {/* Management Tools Section - Pista sutil */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          🔧 Management Tools
        </h2>
        <p className="text-gray-600 mb-4">
          Access advanced company tools and employee management features.
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
              💭 "Interesting... what if I had different permissions?"
            </p>
          </div>
        )}

        {showVulnerableContent && allUsers.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-blue-700 mb-2">📈 Employee Statistics</h3>
            <p className="text-blue-600 mb-3">
              Successfully loaded data for {allUsers.length} employees
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
              📝 Note: This data should probably be restricted...
            </div>
          </div>
        )}
      </div>

      {/* Information Panel - Pistas sutiles */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          📋 Your Session Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">👤 Current User:</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> {user.role}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🔑 Session Details:</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>Storage:</strong> Browser Local Storage</div>
              <div><strong>Token Type:</strong> JWT (JSON Web Token)</div>
              <div><strong>Expires:</strong> 24 hours</div>
              <div><strong>Inspect:</strong> DevTools → Application</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          💭 "I wonder what information is stored in that token..."
        </div>
      </div>

      {/* Hints Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">
          🧩 Daily Security Puzzle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-yellow-700 mb-2">🔍 Explorer's Challenge:</h3>
            <p className="text-yellow-600">
              "Can you find information about your colleagues without their permission?"
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-orange-700 mb-2">🚀 Privilege Quest:</h3>
            <p className="text-orange-600">
              "What happens when boundaries don't exist?"
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <h3 className="font-semibold text-red-700 mb-2">🗝️ Secret Seeker:</h3>
            <p className="text-red-600">
              "Every system has its hidden configuration..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;