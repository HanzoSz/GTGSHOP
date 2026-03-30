/**
 * Auth API service - centralizes login/register and admin login calls.
 * Uses HttpOnly cookies for token storage (set by backend).
 */
import { API_URL as API_BASE } from '@/config';

export interface LoginResponse {
  token?: string | null;
  Token?: string | null;
  user?: { id?: number; Id?: number; email?: string; Email?: string; fullName?: string; FullName?: string; role?: string; Role?: string };
  User?: { id?: number; Id?: number; email?: string; Email?: string; fullName?: string; FullName?: string; role?: string; Role?: string };
  userId?: number;
  email?: string;
  fullName?: string;
  role?: string;
  message?: string;
  Message?: string;
}

export interface UserAuthPayload {
  id: number;
  email: string;
  fullName: string;
  role?: string;
}

function getUserFromResponse(data: LoginResponse, fallbackEmail: string): UserAuthPayload {
  const u = data.user ?? data.User;
  const id = u?.id ?? u?.Id ?? (data as unknown as { userId?: number }).userId;
  const email = u?.email ?? u?.Email ?? data.email ?? fallbackEmail;
  const fullName = u?.fullName ?? u?.FullName ?? data.fullName ?? '';
  const role = u?.role ?? u?.Role ?? data.role ?? 'User';
  return {
    id: id ?? 0,
    email: email ?? fallbackEmail,
    fullName: fullName ?? '',
    role,
  };
}

/**
 * User login (customer). Cookie is set by backend automatically.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: true; user: UserAuthPayload } | { success: false; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Nhận HttpOnly cookie từ backend
    });
    const data: LoginResponse = await response.json();
    if (response.ok) {
      const user = getUserFromResponse(data, email);
      return { success: true, user };
    }
    const message = data.message ?? data.Message ?? 'Email hoặc mật khẩu không đúng';
    return { success: false, message };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
  }
}

/**
 * Google OAuth login. Sends credential (ID Token) to backend for verification.
 */
export async function loginWithGoogle(
  credential: string
): Promise<{ success: true; user: UserAuthPayload } | { success: false; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      credentials: 'include',
    });
    const data: LoginResponse = await response.json();
    if (response.ok) {
      const user = getUserFromResponse(data, '');
      return { success: true, user };
    }
    const message = data.message ?? data.Message ?? 'Đăng nhập Google thất bại';
    return { success: false, message };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
  }
}

/**
 * Admin login. Validates role is Admin before returning.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<
  | { success: true; user: UserAuthPayload }
  | { success: false; message: string }
> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Nhận HttpOnly cookie từ backend
    });
    const data: LoginResponse = await response.json();
    if (!response.ok) {
      const message = data.message ?? data.Message ?? 'Email hoặc mật khẩu không đúng';
      return { success: false, message };
    }
    const user = getUserFromResponse(data, email);
    const role = (user.role ?? '').toLowerCase();
    if (role !== 'admin') {
      // Nếu không phải admin, logout cookie vừa set
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
      return { success: false, message: 'Tài khoản không có quyền Admin!' };
    }
    return { success: true, user };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, message: 'Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.' };
  }
}

/**
 * Register (customer).
 */
export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (response.ok) {
      return { success: true };
    }
    return { success: false, message: result.message ?? result.Message ?? 'Đăng ký thất bại' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
  }
}

/**
 * Logout - calls backend to clear HttpOnly cookies.
 */
export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Check current auth status by calling /auth/me.
 * Cookie is sent automatically → backend reads & returns user info.
 */
export async function checkAuthStatus(): Promise<UserAuthPayload | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data: LoginResponse = await response.json();
      const u = data.user ?? data.User;
      if (u) {
        return {
          id: u.id ?? u.Id ?? 0,
          email: u.email ?? u.Email ?? '',
          fullName: u.fullName ?? u.FullName ?? '',
          role: u.role ?? u.Role ?? 'User',
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// User info (non-sensitive) is still stored in localStorage for fast access
const USER_KEY = 'user';
const ADMIN_USER_KEY = 'admin_user';

export const authStorage = {
  getUser: () => {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },
  setUser: (value: UserAuthPayload) => localStorage.setItem(USER_KEY, JSON.stringify(value)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  getAdminUser: () => {
    try {
      const s = localStorage.getItem(ADMIN_USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },
  setAdminUser: (value: UserAuthPayload) => localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(value)),
  removeAdminUser: () => localStorage.removeItem(ADMIN_USER_KEY),
} as const;
