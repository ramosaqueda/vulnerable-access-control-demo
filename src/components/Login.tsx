// src/components/Login.tsx - Versión CTF (sin instrucciones obvias)
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { loginUser } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  // Usuarios disponibles (pista sutil)
  const availableAccounts = [
    { username: 'admin', role: 'System Administrator', hint: 'Has the keys to the kingdom' },
    { username: 'jaranguiz', role: 'El especialista en Marketing ', hint: 'Always curious about his colleagues' },
    { username: 'james', role: 'El hombre de las ventas', hint: 'Protective of her personal data' },
    { username: 'rob', role: 'IT, Odia Microsoft, la terminal es su amiga, ', hint: 'Knows everyone\'s secrets' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(username, password);
      login(response.user, response.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser: { username: string }) => {
    setUsername(demoUser.username);
    setPassword('user123'); // Pista sutil: password común
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mandrake SecureCorpⓇ Portal</h1>
        <p className="text-gray-600 mt-2">sistema de colaboradores v2.1</p>
        <div className="text-xs text-gray-400 mt-1">
          🔒  Seguridad de nivel empresarial: miles de usuarios confían en ella
        </div>
      </div>

      {/* Pista sutil sobre usuarios disponibles */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
        <h3 className="font-semibold text-blue-800 mb-3">👥 Directorio de colaboradores</h3>
        <div className="text-sm text-blue-700 mb-2">
          Tienes problemas? Contacta a tu colegas XD:
        </div>
        <div className="grid grid-cols-1 gap-2">
          {availableAccounts.map((account, index) => (
            <button
              key={index}
              onClick={() => handleQuickLogin(account)}
              className="text-left p-2 hover:bg-blue-100 rounded border transition-colors"
              title="Click to auto-fill username"
            >
              <div className="font-medium text-blue-800">{account.username}</div>
              <div className="text-xs text-blue-600">{account.role}</div>
              <div className="text-xs text-gray-500 italic">"{account.hint}"</div>
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          💡 Las contraseñas por defecto siguen los patrones de la política de la empresa
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el nombre de usuario..."
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa la password..."
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            🔐 Olvidaste la contraseña, bueno hacker, trata con: user123, admin123
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              Autenticando...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Pistas sutiles en el footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-1">
          <div>🏢 Mandrake SecureCorp </div>
          <div>📊 Perfiles de empleados • 🔧 Herramientas de Admin • 📈 Metreica de Systema</div>
          <div className="text-gray-400">
            💭 "A veces los sistemas más seguros tienen los fallos más evidentes"
          </div>
        </div>
      </div>

      {/* Easter egg: Comentario HTML visible en DevTools */}
      {/* 
        🕵️ CTF Hint: 
        - Eche un vistazo a la aplicación después de iniciar sesión
        - Pruebe a cambiar las URL y los parámetros
        - Compruebe a qué datos puede acceder frente a los que debería acceder
        - Inspeccione las solicitudes y respuestas de la red
        - DevTools es su amigo
      */}
    </div>
  );
};

export default Login;