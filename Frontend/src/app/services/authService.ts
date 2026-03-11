/**
 * Auth API service - centralizes login/register and admin login calls.
 * Use this for consistent API base URL and response handling.
 */
import { API_URL as API_BASE } from '@/config';

export interface LoginResponse {
  token?: string;
  Token?: string;
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

function getToken(data: LoginResponse): string | null {
  return data.token ?? data.Token ?? null;
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
 * User login (customer). Returns normalized user + token or error message.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: true; token: string; user: UserAuthPayload } | { success: false; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: LoginResponse = await response.json();
    const token = getToken(data);
    if (response.ok && token) {
      const user = getUserFromResponse(data, email);
      return { success: true, token, user };
    }
    const message = data.message ?? data.Message ?? 'Email hoặc mật khẩu không đúng';
    return { success: false, message };
  } catch (error) {
    console.error('Login error:', error);
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
  | { success: true; token: string; user: UserAuthPayload }
  | { success: false; message: string }
> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: LoginResponse = await response.json();
    const token = getToken(data);
    if (!response.ok || !token) {
      const message = data.message ?? data.Message ?? 'Email hoặc mật khẩu không đúng';
      return { success: false, message };
    }
    const user = getUserFromResponse(data, email);
    const role = (user.role ?? '').toLowerCase();
    if (role !== 'admin') {
      return { success: false, message: 'Tài khoản không có quyền Admin!' };
    }
    return { success: true, token, user };
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

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (value: string) => localStorage.setItem(TOKEN_KEY, value),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
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
  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (value: string) => localStorage.setItem(ADMIN_TOKEN_KEY, value),
  removeAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
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

/**
 * Decode JWT payload (no verify, client-side only for exp check).
 * Returns null if not a valid JWT or parse fails.
 */
export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

/**
 * Returns true if token exists and is not expired (or has no exp claim).
 * Uses a 60s buffer before actual expiry.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return true; // non-JWT or invalid: let backend decide
  const exp = payload.exp;
  if (exp == null) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp > now + 60;
}
