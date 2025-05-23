// src/components/Navbar.tsx - Versión CTF (pistas sutiles)
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
                📊 Dashboard
              </Link>

              <Link
                to={`/profile/${user.id}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(`/profile/${user.id}`)}`}
              >
                👤 My Profile
              </Link>

              {/* Pista sutil: Link disponible para todos pero con indicador */}
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')} ${
                  user.role !== 'admin' ? 'opacity-75' : ''
                }`}
                title={user.role !== 'admin' ? 'Administrative functions' : 'Admin Panel'}
              >
                ⚙️ Management
                {user.role !== 'admin' && (
                  <span className="ml-1 text-xs bg-yellow-500 px-1 rounded opacity-75">?</span>
                )}
              </Link>

              <Link
                to="/system"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/system')}`}
                title="System information and diagnostics"
              >
                🖥️ System Info
              </Link>

              <Link
                to="/demo"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/demo')} bg-purple-600 hover:bg-purple-700`}
                title="Security testing tools"
              >
                🔧 Security Tools
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
                {user.role === 'admin' ? '👑 Administrator' : '👤 Employee'}
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              title="Sign out"
            >
              Sign Out
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
              📊 Dashboard
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(`/profile/${user.id}`)}`}
            >
              👤 My Profile
            </Link>
            <Link
              to="/admin"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin')}`}
            >
              ⚙️ Management
            </Link>
            <Link
              to="/system"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/system')}`}
            >
              🖥️ System Info
            </Link>
            <Link
              to="/demo"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/demo')} bg-purple-600`}
            >
              🔧 Security Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Status bar con pistas sutiles */}
      <div className="bg-blue-700 text-center py-1">
        <p className="text-xs">
          📋 Session: <strong>{user.username}</strong> (ID: {user.id}) | 
          🔑 Auth: Token-based | 
          💾 Stored locally
          {user.role !== 'admin' && (
            <span className="ml-2 text-yellow-200">
              💭 "What if I had more privileges?"
            </span>
          )}
        </p>
      </div>
    </nav>
  );
};

export default Navbar;