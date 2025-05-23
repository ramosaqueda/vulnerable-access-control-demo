// src/components/ResetButton.tsx - Botón para resetear la base de datos
import React, { useState } from 'react';
import { resetDatabase } from '../services/api';

const ResetButton: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      // Resetear la base de datos
      resetDatabase();
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Mostrar confirmación
      alert('✅ Base de datos reseteada correctamente!\n\nTodos los cambios se han revertido al estado inicial.');
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
      
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('❌ Error al resetear la base de datos');
    } finally {
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="font-bold text-red-800 mb-2">Confirmar Reset</h3>
          <p className="text-sm text-gray-700 mb-4">
            Esto restaurará todos los datos al estado inicial y cerrará tu sesión.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isResetting ? 'Reseteando...' : '✅ Confirmar'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
      <div className="text-center">
        <div className="text-xs text-gray-600 mb-2">🛠️ Debug Tools</div>
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          🔄 Reset DB
        </button>
        <div className="text-xs text-gray-500 mt-1">
          Restaurar estado inicial
        </div>
      </div>
    </div>
  );
};

export default ResetButton;