// src/App.tsx - Aplicación actualizada para funcionar sin backend
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import SystemInfo from './components/SystemInfo';
import Navbar from './components/Navbar';
import VulnerabilityDemo from './components/VulnerabilityDemo';
import ResetButton from './components/ResetButton';
import { User, AuthContextType } from './services/types';
import './App.css';

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {}
});

function App() {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: Omit<User, 'password'>, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando aplicación vulnerable...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Warning Banner */}
          <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
            ⚠️ APLICACIÓN VULNERABLE - Solo para fines educativos - NO usar en producción
          </div>

          {/* Status Banner */}
          <div className="bg-blue-600 text-white text-center py-1 text-xs">
            🚀 Modo: Frontend Only | 📊 Base de datos: JSON Local | 🔄 Reset disponible
          </div>

          {user && <Navbar />}
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route 
                path="/login" 
                element={!user ? <Login /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/profile/:id" 
                element={user ? <Profile /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={user ? <AdminPanel /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/system" 
                element={user ? <SystemInfo /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/demo" 
                element={user ? <VulnerabilityDemo /> : <Navigate to="/login" />} 
              />
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
              <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
          </main>

          {/* Debug Panel - Solo visible en desarrollo */}
          {import.meta.env.DEV && user && (
            <div className="fixed bottom-4 right-4">
              <ResetButton />
            </div>
          )}

          {/* Footer con información del modo */}
          <footer className="bg-gray-800 text-white text-center py-3 text-sm">
            <div className="container mx-auto">
              📚 <strong>Broken Access Control Demo</strong> | 
              🎯 6 Vulnerabilidades implementadas | 
              🔧 Frontend-only para portabilidad | 
              💾 Datos en memoria (se resetean al recargar)
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;