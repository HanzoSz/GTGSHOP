import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  authStorage,
  loginUser as apiLoginUser,
  loginAdmin as apiLoginAdmin,
  registerUser as apiRegisterUser,
  logoutApi,
  checkAuthStatus,
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
  const [adminUser, setAdminUser] = useState<UserAuthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi mount: kiểm tra auth status từ cookie bằng cách gọi /auth/me
  useEffect(() => {
    const init = async () => {
      // Thử load user info nhanh từ localStorage (non-sensitive cache)
      const savedUser = authStorage.getUser();
      const savedAdminUser = authStorage.getAdminUser();

      if (savedUser) setUser(savedUser as User);
      if (savedAdminUser) setAdminUser(savedAdminUser);

      // Xác thực lại với backend qua cookie
      try {
        const currentUser = await checkAuthStatus();
        if (currentUser) {
          // Cookie hợp lệ → cập nhật user
          const role = (currentUser.role ?? '').toLowerCase();
          if (role === 'admin') {
            setAdminUser(currentUser);
            authStorage.setAdminUser(currentUser);
          } else {
            setUser(toUser(currentUser));
            authStorage.setUser(currentUser);
          }
        } else {
          // Cookie hết hạn hoặc không có → xóa cache
          if (savedUser) {
            setUser(null);
            authStorage.removeUser();
          }
          if (savedAdminUser) {
            setAdminUser(null);
            authStorage.removeAdminUser();
          }
        }
      } catch {
        // Network error → giữ cached user (offline-friendly)
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLoginUser(email, password);
    if (result.success) {
      setUser(toUser(result.user));
      authStorage.setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const loginAdmin = async (email: string, password: string) => {
    const result = await apiLoginAdmin(email, password);
    if (result.success) {
      setAdminUser(result.user);
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

  const logout = async () => {
    setUser(null);
    authStorage.removeUser();
    await logoutApi(); // Gọi backend xóa cookie
  };

  const logoutAdmin = async () => {
    setAdminUser(null);
    authStorage.removeAdminUser();
    await logoutApi(); // Gọi backend xóa cookie
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
        isAuthenticated: !!user,
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
