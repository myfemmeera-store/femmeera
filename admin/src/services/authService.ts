import { apiClient } from './apiClient';
import { ApiResponse, User } from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const res = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      localStorage.setItem('femmeera_admin_token', res.data.token);
      localStorage.setItem('femmeera_admin_user', JSON.stringify(res.data.user));
    }

    return res;
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient<{ user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failures on logout
    } finally {
      localStorage.removeItem('femmeera_admin_token');
      localStorage.removeItem('femmeera_admin_user');
      window.location.href = '/login';
    }
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('femmeera_admin_token');
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('femmeera_admin_user');
    return data ? JSON.parse(data) : null;
  }
};
