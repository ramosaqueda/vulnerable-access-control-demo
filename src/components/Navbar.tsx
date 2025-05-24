// src/components/Navbar.tsx - Versión CTF en Español
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : 'hover:bg-blue-700';
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="text-xl font-bold">
              🏢 SecureCorp Portal
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
              >
                📊 Tablero
              </Link>

              <Link
                to={`/profile/${user.id}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(`/profile/${user.id}`)}`}
              >
                👤 Mi Perfil
              </Link>

              {/* Solo mostrar para administradores */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')}`}
                  title="Panel de Administración"
                >
                  ⚙️ Administración
                </Link>
              )}

              <Link
                to="/system"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/system')}`}
                title="Información y diagnósticos del sistema"
              >
                🖥️ Info Sistema
              </Link>

              <Link
                to="/demo"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/demo')} bg-purple-600 hover:bg-purple-700`}
                title="Herramientas de pruebas de seguridad"
              >
                🔧 Herramientas de Seguridad
              </Link>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="font-medium">{user.username}</div>
              <div className={`text-xs ${
                user.role === 'admin' ? 'text-green-200' : 'text-blue-200'
              }`}>
                {user.role === 'admin' ? '👑 Administrador' : '👤 Empleado'}
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              title="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Mobile menu (simplified) */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}
            >
              📊 Tablero
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(`/profile/${user.id}`)}`}
            >
              👤 Mi Perfil
            </Link>
            {/* Solo mostrar para administradores */}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin')}`}
              >
                ⚙️ Administración
              </Link>
            )}
            <Link
              to="/system"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/system')}`}
            >
              🖥️ Info Sistema
            </Link>
            <Link
              to="/demo"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/demo')} bg-purple-600`}
            >
              🔧 Herramientas Seg.
            </Link>
          </div>
        </div>
      </div>

      {/* Status bar con pistas sutiles */}
      <div className="bg-blue-700 text-center py-1">
        <p className="text-xs">
          📋 Sesión: <strong>{user.username}</strong> (ID: {user.id}) | 
          🔑 Auth: Basada en Token | 
          💾 Almacenamiento Local
          {user.role !== 'admin' && (
            <span className="ml-2 text-yellow-200">
              💭 "¿Qué pasaría si tuviera más privilegios?"
            </span>
          )}
        </p>
      </div>
    </nav>
  );
};

export default Navbar;