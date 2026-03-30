// Centralized config - dùng biến môi trường Vite
// Khi deploy: tạo file .env với VITE_API_URL=https://your-domain.com/api

export const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE = API_URL;
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
