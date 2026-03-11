import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  authStorage,
  loginUser as apiLoginUser,
  loginAdmin as apiLoginAdmin,
  registerUser as apiRegisterUser,
  isTokenValid,
  type UserAuthPayload,
} from '../services/authService';

interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  // Admin auth (separate session from user)
  adminUser: UserAuthPayload | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(p: UserAuthPayload | null): User | null {
  if (!p) return null;
  return { id: p.id, email: p.email, fullName: p.fullName, role: p.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<UserAuthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = authStorage.getToken();
    const savedUser = authStorage.getUser();
    if (savedToken && savedUser) {
      if (isTokenValid(savedToken)) {
        setToken(savedToken);
        setUser(savedUser as User);
      } else {
        authStorage.removeToken();
        authStorage.removeUser();
      }
    }
    const adminToken = authStorage.getAdminToken();
    const savedAdminUser = authStorage.getAdminUser();
    if (adminToken && savedAdminUser) {
      if (isTokenValid(adminToken)) {
        setAdminUser(savedAdminUser);
      } else {
        authStorage.removeAdminToken();
        authStorage.removeAdminUser();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLoginUser(email, password);
    if (result.success) {
      setUser(toUser(result.user));
      setToken(result.token);
      authStorage.setToken(result.token);
      authStorage.setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const loginAdmin = async (email: string, password: string) => {
    const result = await apiLoginAdmin(email, password);
    if (result.success) {
      setAdminUser(result.user);
      authStorage.setAdminToken(result.token);
      authStorage.setAdminUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const register = async (data: RegisterData) => {
    const result = await apiRegisterUser(data);
    if (result.success) return { success: true };
    return { success: false, message: result.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authStorage.removeToken();
    authStorage.removeUser();
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    authStorage.removeAdminToken();
    authStorage.removeAdminUser();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      authStorage.setUser(updatedUser as UserAuthPayload);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        adminUser,
        isAdminAuthenticated: !!adminUser,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
