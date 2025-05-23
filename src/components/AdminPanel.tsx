// src/components/AdminPanel.tsx - Versión CTF (pistas sutiles)
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { getAllUsers, deleteUser, updateUserRole, User } from '../services/api';

const AdminPanel: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (window.confirm(`Delete employee ${username}? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        setActionMessage(`Employee ${username} removed from system`);
        loadUsers();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleRoleChange = async (id: number, newRole: string, username: string) => {
    try {
      await updateUserRole(id, newRole);
      setActionMessage(`Employee ${username} role updated to ${newRole}`);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-xl">Loading management interface...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ⚙️ Employee Management System
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee data, roles, and system access
            </p>
          </div>
          
          {/* Status indicator con pista sutil */}
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'admin' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.role === 'admin' ? '✅ Authorized Access' : '🤔 Accessing as ' + user?.role}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Session: {user?.username} (ID: {user?.id})
            </div>
          </div>
        </div>
        
        {/* Pista sutil para usuarios no admin */}
        {user?.role !== 'admin' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
            <div className="flex items-start">
              <div className="text-blue-500 mr-2">💡</div>
              <div>
                <p className="text-blue-700 font-medium">Interesting Discovery</p>
                <p className="text-blue-600 text-sm">
                  You're accessing the management interface as a "{user?.role}" user. 
                  In most systems, this would be restricted to administrators only.
                </p>
                <p className="text-blue-500 text-xs mt-1 italic">
                  "Sometimes the most powerful tools are left unlocked..."
                </p>
              </div>
            </div>
          </div>
        )}

        {actionMessage && (
          <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
            <p className="text-green-700">✅ {actionMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Employee Management Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">ID</th>
                <th className="border border-gray-300 p-3 text-left">Employee</th>
                <th className="border border-gray-300 p-3 text-left">Contact</th>
                <th className="border border-gray-300 p-3 text-left">Role</th>
                <th className="border border-gray-300 p-3 text-left">Sensitive Data</th>
                <th className="border border-gray-300 p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-mono">{u.id}</td>
                  <td className="border border-gray-300 p-3">
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-gray-600">{u.profile?.fullName}</div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div className="text-sm">{u.email}</div>
                    <div className="text-sm text-gray-600">{u.profile?.phone}</div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value, u.username)}
                      className="border rounded p-1 text-sm w-full"
                      title="Change user role - try promoting yourself!"
                    >
                      <option value="user">👤 Employee</option>
                      <option value="admin">👑 Administrator</option>
                      <option value="manager">📊 Manager</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-3 text-xs">
                    {u.profile && (
                      <div className="space-y-1">
                        <div className="text-green-600">
                          💰 ${u.profile.salary?.toLocaleString()}
                        </div>
                        <div className="text-blue-600 font-mono">
                          🆔 {u.profile.ssn}
                        </div>
                        <div className="text-gray-600">
                          🏢 {u.profile.department}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                        disabled={u.id === user?.id}
                        title={u.id === user?.id ? "Cannot delete yourself" : "Remove employee from system"}
                      >
                        🗑️ Remove
                      </button>
                      {u.id === user?.id && (
                        <div className="text-xs text-gray-500">
                          (Your account)
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded border">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-blue-700 text-sm">Total Employees</div>
          </div>
          <div className="bg-green-50 p-4 rounded border">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-green-700 text-sm">Administrators</div>
          </div>
          <div className="bg-purple-50 p-4 rounded border">
            <div className="text-2xl font-bold text-purple-600">
              ${users.reduce((sum, u) => sum + (u.profile?.salary || 0), 0).toLocaleString()}
            </div>
            <div className="text-purple-700 text-sm">Total Payroll</div>
          </div>
        </div>

        {/* CTF Hints */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🧩Notas de investigación sobre seguridad </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>• <strong>Access Pattern:</strong>   Interfaz de gestión accesible a los usuarios de {user?.role}</div>
            <div>• <strong>Data Exposure:</strong> Información sensible de los empleados visible en la tabla</div>
            <div>• <strong>Role Management:</strong> Modificación de la función del usuario mediante una interfaz desplegable</div>
            <div>• <strong>Privilege Testing:</strong> Intenta cambiar tu propio rol y refrescar</div>
            <div className="text-yellow-600 text-xs mt-2 italic">
              "Las vulnerabilidades más peligrosas suelen ser las características más convenientes.."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;