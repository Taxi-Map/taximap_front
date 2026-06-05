import axios from 'axios';
import { authStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_provider');
      if (authStore.getState().user) {
        authStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    const msg = data?.mensagem || data?.message || data?.error;
    if (Array.isArray(msg)) return msg.join('. ');
    if (typeof msg === 'string' && msg) return msg;
    return err.message || fallback;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message;
    if (Array.isArray(msg)) return msg.join('. ');
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}

export default api;
