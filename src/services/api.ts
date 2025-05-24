// src/services/api.ts - API Mock con datos JSON locales
import { User, LoginResponse, SystemInfo } from './types';

// 🗂️ Base de datos simulada en memoria
let usersDatabase: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@demo.com',
    password: 'admin123', // En producción NUNCA almacenar passwords en plaintext
    role: 'admin',
    profile: {
      fullName: 'Administrador de sistema',
      phone: '+5696610323',
      department: 'Oficial de Seguridad',
      salary: 120000,
      ssn: '123-45-6789'
    },
    created_at: '2024-01-01T08:00:00Z'
  },
  {
    id: 2,
    username: 'jaranguiz',
    email: 'john@demo.com',
    password: 'user123',
    role: 'user',
    profile: {
      fullName: 'Juan Aranguiz Salas',
      phone: '+56932123422',
      department: 'Marketing',
      salary: 65000,
      ssn: '987-65-4321'
    },
    created_at: '2024-01-02T09:00:00Z'
  },
  {
    id: 3,
    username: 'james',
    email: 'james@demo.com',
    password: 'user123',
    role: 'user',
    profile: {
      fullName: 'James Blond Von Gonzalez',
      phone: '+56973751234',
      department: 'Ventas',
      salary: 70000,
      ssn: '456-78-9012'
    },
    created_at: '2024-01-03T10:00:00Z'
  },
  {
    id: 4,
    username: 'rob',
    email: 'robeesponja@demo.com',
    password: 'user123',
    role: 'user',
    profile: {
      fullName: 'Rob Spon Ja',
      phone: '+56943848472',
      department: 'IT',
      salary: 60000,
      ssn: '789-01-2345'
    },
    created_at: '2024-01-04T11:00:00Z'
  }
];

// 🔑 Configuración del sistema (vulnerable)
const SYSTEM_CONFIG = {
  jwt_secret: 'vulnerable-secret-key',
  server_info: 'Ubuntu 20.04',
  database_info: 'JSON Local Storage',
  debug_mode: true,
  last_backup: '2024-01-15',
  admin_users: ['admin'],
  total_users: usersDatabase.length
};

// 🎭 Simulación de delay de red
const simulateNetworkDelay = (ms: number = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 🔐 Simulación de JWT simple (solo para demo)
const createSimpleJWT = (user: Omit<User, 'password'>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  }));
  const signature = btoa(`signature_with_${SYSTEM_CONFIG.jwt_secret}`);
  
  return `${header}.${payload}.${signature}`;
};

// 🔓 Decodificar JWT simple
const decodeSimpleJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiración
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expirado
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

// 🚨 Función para simular errores HTTP
const createHttpError = (status: number, message: string) => {
  const error = new Error(message) as any;
  error.status = status;
  return error;
};

// === FUNCIONES DE AUTENTICACIÓN ===

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  await simulateNetworkDelay();
  
  const user = usersDatabase.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw createHttpError(401, 'Credenciales inválidas');
  }

  // Crear token
  const userWithoutPassword = { ...user };
  delete (userWithoutPassword as any).password;
  
  const token = createSimpleJWT(userWithoutPassword);

  return {
    token,
    user: userWithoutPassword
  };
};

// === FUNCIONES DE USUARIOS (VULNERABLES) ===

// 🚨 VULNERABLE: IDOR - Puede acceder a cualquier usuario por ID
export const getUserById = async (id: number): Promise<User> => {
  await simulateNetworkDelay();
  
  // Simular verificación de token (vulnerable)
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  // 🚨 NO HAY VALIDACIÓN: Cualquier usuario autenticado puede ver cualquier perfil
  const user = usersDatabase.find(u => u.id === id);
  
  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // Retornar usuario sin password pero con datos sensibles
  const userWithoutPassword = { ...user };
  delete (userWithoutPassword as any).password;
  
  return userWithoutPassword;
};

// 🚨 VULNERABLE: Puede actualizar cualquier usuario
export const updateUser = async (id: number, userData: Partial<User['profile']>): Promise<void> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  // 🚨 NO HAY VALIDACIÓN: Cualquier usuario puede modificar cualquier perfil
  const userIndex = usersDatabase.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // Actualizar perfil
  usersDatabase[userIndex].profile = {
    ...usersDatabase[userIndex].profile,
    ...userData
  };

  console.log(`🚨 VULNERABILITY EXPLOITED: User ${decoded.username} (ID: ${decoded.id}) modified user ${id}`);
};

// === FUNCIONES ADMINISTRATIVAS (VULNERABLES) ===

// 🚨 VULNERABLE: Usuarios normales pueden acceder
export const getAllUsers = async (): Promise<User[]> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  // 🚨 FALLA: No verifica si es admin
  console.log(`🚨 VULNERABILITY EXPLOITED: User ${decoded.username} (role: ${decoded.role}) accessed admin user list`);

  // Retornar usuarios sin passwords pero con datos sensibles
  return usersDatabase.map(user => {
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    return userWithoutPassword;
  });
};

// 🚨 VULNERABLE: Cualquiera puede eliminar usuarios
export const deleteUser = async (id: number): Promise<void> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  const userIndex = usersDatabase.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // 🚨 NO HAY VALIDACIÓN: Cualquier usuario puede eliminar otros
  const deletedUser = usersDatabase[userIndex];
  usersDatabase.splice(userIndex, 1);
  
  console.log(`🚨 VULNERABILITY EXPLOITED: User ${decoded.username} deleted user ${deletedUser.username}`);
};

// 🚨 VULNERABLE: Cualquiera puede cambiar roles
export const updateUserRole = async (id: number, role: string): Promise<void> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  const userIndex = usersDatabase.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // 🚨 NO HAY VALIDACIÓN: Cualquier usuario puede cambiar roles
  const oldRole = usersDatabase[userIndex].role;
  usersDatabase[userIndex].role = role;
  
  console.log(`🚨 VULNERABILITY EXPLOITED: User ${decoded.username} changed user ${id} role from ${oldRole} to ${role}`);
  
  // Si el usuario cambió su propio rol, actualizar el token en localStorage
  if (id === decoded.id) {
    const updatedUser = { ...usersDatabase[userIndex] };
    delete (updatedUser as any).password;
    const newToken = createSimpleJWT(updatedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
};

// === FUNCIONES DEL SISTEMA (VULNERABLES) ===

// 🚨 VULNERABLE: Expone información crítica
export const getSystemInfo = async (): Promise<SystemInfo> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  // 🚨 CUALQUIER usuario autenticado puede acceder
  console.log(`🚨 VULNERABILITY EXPLOITED: User ${decoded.username} accessed system info including JWT secret`);

  return {
    server: SYSTEM_CONFIG.server_info,
    database: SYSTEM_CONFIG.database_info,
    users_count: usersDatabase.length,
    admin_users: SYSTEM_CONFIG.admin_users,
    secret_key: SYSTEM_CONFIG.jwt_secret, // 🚨 MUY VULNERABLE
    last_backup: SYSTEM_CONFIG.last_backup,
    debug_mode: SYSTEM_CONFIG.debug_mode
  };
};

// === FUNCIONES DE TESTING/DEMO ===

export const testConnection = async () => {
  await simulateNetworkDelay(100);
  return {
    message: 'Frontend API Mock funcionando correctamente',
    timestamp: new Date().toISOString(),
    total_users: usersDatabase.length,
    vulnerabilities: [
      'IDOR en getUserById()',
      'Escalada de privilegios en getAllUsers()',
      'Exposición de datos sensibles',
      'Falta de validación de ownership',
      'Manipulación de roles sin autorización',
      'JWT secret expuesta en getSystemInfo()'
    ]
  };
};

// Función helper para hacer requests directas (para demostraciones)
export const makeDirectRequest = async (method: string, endpoint: string, data?: any) => {
  await simulateNetworkDelay();
  
  console.log(`🔍 Direct API Call: ${method} ${endpoint}`, data);

  // Simular diferentes endpoints
  switch (endpoint) {
    case '/users/1':
    case '/users/2':
    case '/users/3':
    case '/users/4':
      const userId = parseInt(endpoint.split('/')[2]);
      return await getUserById(userId);
      
    case '/admin/users':
      return await getAllUsers();
      
    case '/system/info':
      return await getSystemInfo();
      
    default:
      if (endpoint.startsWith('/users/') && method === 'PUT') {
        const userId = parseInt(endpoint.split('/')[2]);
        await updateUser(userId, data);
        return { message: 'Usuario actualizado' };
      }
      
      if (endpoint.includes('/role') && method === 'PUT') {
        const userId = parseInt(endpoint.split('/')[3]);
        await updateUserRole(userId, data.role);
        return { message: 'Rol actualizado' };
      }
      
      throw createHttpError(404, 'Endpoint no encontrado');
  }
};

// Función para demostrar manipulación de tokens
export const decodeCurrentToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return decodeSimpleJWT(token);
};

// 🎭 Función para crear tokens falsos (para demos avanzadas)
export const createFakeToken = (userData: any) => {
  console.log('🚨 CREATING FAKE TOKEN - Educational purposes only!');
  return createSimpleJWT(userData);
};

// 🔄 Función para resetear los datos a su estado inicial
export const resetDatabase = () => {
  usersDatabase = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        fullName: 'System Administrator',
        phone: '+1-555-0001',
        department: 'IT Security',
        salary: 120000,
        ssn: '123-45-6789'
      },
      created_at: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      username: 'john',
      email: 'john@demo.com',
      password: 'user123',
      role: 'user',
      profile: {
        fullName: 'John Doe',
        phone: '+1-555-0002',
        department: 'Marketing',
        salary: 65000,
        ssn: '987-65-4321'
      },
      created_at: '2024-01-02T09:00:00Z'
    },
    {
      id: 3,
      username: 'jane',
      email: 'jane@demo.com',
      password: 'user123',
      role: 'user',
      profile: {
        fullName: 'Jane Smith',
        phone: '+1-555-0003',
        department: 'Sales',
        salary: 70000,
        ssn: '456-78-9012'
      },
      created_at: '2024-01-03T10:00:00Z'
    },
    {
      id: 4,
      username: 'bob',
      email: 'bob@demo.com',
      password: 'user123',
      role: 'user',
      profile: {
        fullName: 'Bob Wilson',
        phone: '+1-555-0004',
        department: 'HR',
        salary: 60000,
        ssn: '789-01-2345'
      },
      created_at: '2024-01-04T11:00:00Z'
    }
  ];
  
  console.log('🔄 Database reset to initial state');
};

// Exportar la base de datos para debug (solo en development)
if (import.meta.env.DEV) {
  (window as any).debugAPI = {
    usersDatabase,
    resetDatabase,
    createFakeToken,
    SYSTEM_CONFIG
  };
}

export default {
  loginUser,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getSystemInfo,
  testConnection,
  makeDirectRequest,
  decodeCurrentToken,
  createFakeToken,
  resetDatabase
};