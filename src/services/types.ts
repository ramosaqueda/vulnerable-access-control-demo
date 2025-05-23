// src/services/types.ts - Definiciones de tipos

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string; // Solo para verificación de login, nunca expuesto
    role: string;
    profile?: {
      fullName: string;
      phone: string;
      department: string;
      salary?: number;
      ssn?: string;
    };
    created_at?: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: Omit<User, 'password'>;
  }
  
  export interface SystemInfo {
    server: string;
    database: string;
    users_count: number;
    admin_users: string[];
    secret_key: string;
    last_backup: string;
    debug_mode: boolean;
  }
  
  export interface AuthContextType {
    user: Omit<User, 'password'> | null;
    token: string | null;
    login: (userData: Omit<User, 'password'>, token: string) => void;
    logout: () => void;
  }
  
  export interface VulnerabilityTestResult {
    id: number;
    title: string;
    data: any;
    isVulnerable: boolean;
    timestamp: string;
  }