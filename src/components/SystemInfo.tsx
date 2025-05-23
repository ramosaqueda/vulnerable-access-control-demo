// src/components/SystemInfo.tsx - Versión CTF (pistas sutiles)
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
        <div className="text-xl">Loading system diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">🖥️ System Information & Diagnostics</h1>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
          <h3 className="font-bold text-blue-800 mb-2">📊 System Health Dashboard</h3>
          <p className="text-blue-700">
            Welcome to the system information panel. Here you can view current system status, 
            configuration details, and diagnostic information.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            💡 This information is typically restricted to system administrators
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
                <h3 className="font-bold mb-3 text-gray-800">🖥️ Server Environment</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Operating System:</strong> {systemInfo.server}</div>
                  <div><strong>Database:</strong> {systemInfo.database}</div>
                  <div><strong>Total Users:</strong> {systemInfo.users_count}</div>
                  <div><strong>Last Backup:</strong> {systemInfo.last_backup}</div>
                  <div><strong>Debug Mode:</strong> 
                    <span className={systemInfo.debug_mode ? 'text-orange-600' : 'text-green-600'}>
                      {systemInfo.debug_mode ? ' Enabled ⚠️' : ' Disabled ✅'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded border">
                <h3 className="font-bold mb-3 text-green-800">👑 Administrative Access</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Admin Users:</strong> {systemInfo.admin_users.join(', ')}</div>
                  <div><strong>System Access:</strong> Multi-level</div>
                  <div><strong>Security Level:</strong> Standard</div>
                  <div><strong>Audit Logging:</strong> Basic</div>
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
                  <h3 className="font-bold text-gray-800">⚙️ Advanced Configuration</h3>
                  <span className="text-gray-500">
                    {showAdvanced ? '▼' : '▶'} Click to {showAdvanced ? 'hide' : 'reveal'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  System internals and configuration details
                </p>
              </button>
              
              {showAdvanced && (
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded mb-4">
                    <h4 className="font-bold text-orange-800 mb-2">🔐 Security Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-orange-700">Authentication Method:</strong>
                        <div className="text-orange-600">JSON Web Tokens (JWT)</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Token Storage:</strong>
                        <div className="text-orange-600">Client-side localStorage</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Session Duration:</strong>
                        <div className="text-orange-600">24 hours</div>
                      </div>
                      <div>
                        <strong className="text-orange-700">Encryption Key:</strong>
                        <div className="text-orange-600 font-mono text-xs break-all">
                          {systemInfo.secret_key}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-orange-600 italic">
                      💭 "This looks like it might be important information..."
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <h4 className="font-bold text-purple-800 mb-2">🔧 Development Settings</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Environment:</strong> Development Mode</div>
                      <div><strong>Error Reporting:</strong> Verbose</div>
                      <div><strong>CORS Policy:</strong> Permissive</div>
                      <div><strong>Rate Limiting:</strong> Disabled</div>
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
            <h3 className="font-bold mb-3 text-indigo-800">🎫 Current Session Token</h3>
            <p className="text-indigo-700 text-sm mb-3">
              Your authentication token contains the following information:
            </p>
            <div className="bg-white p-3 rounded border">
              <pre className="text-xs overflow-x-auto text-indigo-900">
{JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
            <div className="mt-3 text-xs text-indigo-600 space-y-1">
              <div>💡 This token is stored in your browser's localStorage</div>
              <div>🔍 Open DevTools → Application → Local Storage to see it</div>
              <div>🤔 Notice any interesting patterns in the token structure?</div>
            </div>
          </div>
        )}

        {/* Security Research Panel */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-bold text-red-800 mb-3">🔬 Security Research Observations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">Information Disclosure:</h4>
              <ul className="text-red-600 space-y-1 text-xs">
                <li>• System configuration exposed to all users</li>
                <li>• Cryptographic secrets visible in interface</li>
                <li>• Admin user enumeration possible</li>
                <li>• Debug mode enables verbose error messages</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">Attack Vectors:</h4>
              <ul className="text-red-600 space-y-1 text-xs">
                <li>• JWT secret extraction for token forging</li>
                <li>• Client-side token storage vulnerability</li>
                <li>• Administrative interface enumeration</li>
                <li>• Development settings in production</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-100 rounded">
            <h4 className="font-semibold text-red-800 mb-2">🎯 Research Challenge</h4>
            <p className="text-red-700 text-sm">
              "Now that you have the JWT secret key, what could a security researcher do with this information? 
              Think about token manipulation and privilege escalation possibilities..."
            </p>
          </div>
        </div>

        {/* CTF Tools */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">🛠️ Security Testing Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-blue-700 mb-2">🔍 Token Decoder</h4>
              <p className="text-sm text-gray-600 mb-2">
                Decode and analyze JWT tokens
              </p>
              <a 
                href="https://jwt.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Open jwt.io →
              </a>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-green-700 mb-2">🌐 DevTools</h4>
              <p className="text-sm text-gray-600 mb-2">
                Browser developer tools for inspection
              </p>
              <button 
                onClick={() => alert('Press F12 or right-click and select "Inspect Element"')}
                className="text-green-600 hover:text-green-800 text-sm underline"
              >
                How to open →
              </button>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-purple-700 mb-2">📡 Network Analysis</h4>
              <p className="text-sm text-gray-600 mb-2">
                Monitor API requests and responses
              </p>
              <button 
                onClick={() => alert('Open DevTools → Network tab, then interact with the application')}
                className="text-purple-600 hover:text-purple-800 text-sm underline"
              >
                Learn more →
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 italic">
            "The best security researchers use every tool at their disposal..."
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;