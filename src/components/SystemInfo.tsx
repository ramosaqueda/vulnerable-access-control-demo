// src/components/SystemInfo.tsx - Versión CTF en Español
import React, { useState, useEffect } from 'react';
import { getSystemInfo, SystemInfo as SystemInfoType, decodeCurrentToken } from '../services/api';

const SystemInfo: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadSystemInfo();
    loadTokenInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await getSystemInfo();
      setSystemInfo(info);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTokenInfo = () => {
    const decoded = decodeCurrentToken();
    setTokenInfo(decoded);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-xl">Cargando diagnóstico del sistema...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">🖥️ Información del Sistema y Diagnósticos</h1>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
          <h3 className="font-bold text-blue-800 mb-2">📊 Panel de Estado del Sistema</h3>
          <p className="text-blue-700">
            Bienvenido al panel de información del sistema. Aquí puedes ver el estado actual del sistema, 
            detalles de configuración e información de diagnóstico.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            💡 Esta información normalmente está restringida a administradores del sistema
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {systemInfo && (
          <div className="space-y-6">
            {/* Basic System Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-3 text-gray-800">🖥️ Entorno del Servidor</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Sistema Operativo:</strong> {systemInfo.server}</div>
                  <div><strong>Base de Datos:</strong> {systemInfo.database}</div>
                  <div><strong>Total de Usuarios:</strong> {systemInfo.users_count}</div>
                  <div><strong>Último Respaldo:</strong> {systemInfo.last_backup}</div>
                  <div><strong>Modo Debug:</strong> 
                    <span className={systemInfo.debug_mode ? 'text-orange-600' : 'text-green-600'}>
                      {systemInfo.debug_mode ? ' Habilitado ⚠️' : ' Deshabilitado ✅'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded border">
                <h3 className="font-bold mb-3 text-green-800">👑 Acceso Administrativo</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Usuarios Admin:</strong> {systemInfo.admin_users.join(', ')}</div>
                  <div><strong>Acceso al Sistema:</strong> Multinivel</div>
                  <div><strong>Nivel de Seguridad:</strong> Estándar</div>
                  <div><strong>Registro de Auditoría:</strong> Básico</div>
                </div>
              </div>
            </div>

            {/* Advanced Configuration - Con pista sutil */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">⚙️ Configuración Avanzada</h3>
                  <span className="text-gray-500">
                    {showAdvanced ? '▼' : '▶'} Clic para {showAdvanced ? 'ocultar' : 'revelar'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Configuración interna del sistema y detalles técnicos
                </p>
              </button>
              
              {showAdvanced && (
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded mb-4">
                    <h4 className="font-bold text-orange-800 mb-2">🔐 Configuración de Seguridad</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-orange-700">Método de Autenticación:</strong>
                        <div className="text-orange-600">JSON Web Tokens (JWT)</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Almacenamiento de Token:</strong>
                        <div className="text-orange-600">localStorage del cliente</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Duración de Sesión:</strong>
                        <div className="text-orange-600">24 horas</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Clave de Cifrado:</strong>
                        <div className="text-orange-600 font-mono text-xs break-all">
                          {systemInfo.secret_key}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-orange-600 italic">
                      💭 "Esto parece información que podría ser importante..."
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <h4 className="font-bold text-purple-800 mb-2">🔧 Configuración de Desarrollo</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Entorno:</strong> Modo de Desarrollo</div>
                      <div><strong>Reporte de Errores:</strong> Detallado</div>
                      <div><strong>Política CORS:</strong> Permisiva</div>
                      <div><strong>Limitación de Tasa:</strong> Deshabilitada</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Token Analysis Section */}
        {tokenInfo && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded">
            <h3 className="font-bold mb-3 text-indigo-800">🎫 Token de Sesión Actual</h3>
            <p className="text-indigo-700 text-sm mb-3">
              Tu token de autenticación contiene la siguiente información:
            </p>
            <div className="bg-white p-3 rounded border">
              <pre className="text-xs overflow-x-auto text-indigo-900">
{JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
            <div className="mt-3 text-xs text-indigo-600 space-y-1">
              <div>💡 Este token está almacenado en el localStorage de tu navegador</div>
              <div>🔍 Abre DevTools → Aplicación → Local Storage para verlo</div>
              <div>🤔 ¿Notas algún patrón interesante en la estructura del token?</div>
            </div>
          </div>
        )}

        {/* Security Research Panel */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-bold text-red-800 mb-3">🔬 Observaciones de Investigación de Seguridad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">Divulgación de Información:</h4>
              <ul className="text-red-600 space-y-1 text-xs">
                <li>• Configuración del sistema expuesta a todos los usuarios</li>
                <li>• Secretos criptográficos visibles en la interfaz</li>
                <li>• Enumeración de usuarios administradores posible</li>
                <li>• Modo debug habilita mensajes de error detallados</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">Vectores de Ataque:</h4>
              <ul className="text-red-600 space-y-1 text-xs">
                <li>• Extracción de secreto JWT para falsificación de tokens</li>
                <li>• Vulnerabilidad de almacenamiento de tokens del lado cliente</li>
                <li>• Enumeración de interfaz administrativa</li>
                <li>• Configuraciones de desarrollo en producción</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-100 rounded">
            <h4 className="font-semibold text-red-800 mb-2">🎯 Desafío de Investigación</h4>
            <p className="text-red-700 text-sm">
              "Ahora que tienes la clave secreta JWT, ¿qué podría hacer un investigador de seguridad con esta información? 
              Piensa en las posibilidades de manipulación de tokens y escalada de privilegios..."
            </p>
          </div>
        </div>

        {/* CTF Tools */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">🛠️ Herramientas de Pruebas de Seguridad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-blue-700 mb-2">🔍 Decodificador de Tokens</h4>
              <p className="text-sm text-gray-600 mb-2">
                Decodifica y analiza tokens JWT
              </p>
              <a 
                href="https://jwt.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Abrir jwt.io →
              </a>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-green-700 mb-2">🌐 DevTools</h4>
              <p className="text-sm text-gray-600 mb-2">
                Herramientas de desarrollador del navegador para inspección
              </p>
              <button 
                onClick={() => alert('Presiona F12 o clic derecho y selecciona "Inspeccionar elemento"')}
                className="text-green-600 hover:text-green-800 text-sm underline"
              >
                Cómo abrir →
              </button>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-purple-700 mb-2">📡 Análisis de Red</h4>
              <p className="text-sm text-gray-600 mb-2">
                Monitorea peticiones y respuestas de API
              </p>
              <button 
                onClick={() => alert('Abre DevTools → pestaña Network, luego interactúa con la aplicación')}
                className="text-purple-600 hover:text-purple-800 text-sm underline"
              >
                Aprender más →
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 italic">
            "Los mejores investigadores de seguridad usan todas las herramientas a su disposición..."
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;