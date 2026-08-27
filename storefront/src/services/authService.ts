import { apiClient } from './apiClient';
import { ApiResponse, User } from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: { name: string; email: string; phone?: string; password: string; password_confirmation: string }): Promise<ApiResponse<LoginResponse>> {
    const res = await apiClient<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.data?.token) {
      localStorage.setItem('femmeera_customer_token', res.data.token);
      localStorage.setItem('femmeera_customer_user', JSON.stringify(res.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('femmeera-auth-updated'));
      }
    }

    return res;
  },

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const res = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('femmeera_customer_token', res.data.token);
      localStorage.setItem('femmeera_customer_user', JSON.stringify(res.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('femmeera-auth-updated'));
      }
    } else if (res.errors) {
      const firstKey = Object.keys(res.errors)[0];
      if (firstKey && res.errors[firstKey]?.[0]) {
        res.message = res.errors[firstKey][0];
      }
    }

    return res;
  },

  async googleLogin(idToken: string): Promise<ApiResponse<LoginResponse>> {
    const guestSessionId = typeof window !== 'undefined' ? localStorage.getItem('femmeera_guest_session_id') : null;
    const res = await apiClient<LoginResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken, guest_session_id: guestSessionId }),
    });

    if (res.data?.token) {
      localStorage.setItem('femmeera_customer_token', res.data.token);
      localStorage.setItem('femmeera_customer_user', JSON.stringify(res.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('femmeera-auth-updated'));
      }
    }

    return res;
  },

  handleOAuthCallback(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('femmeera_customer_token', token);
      localStorage.setItem('femmeera_customer_user', JSON.stringify(user));
      window.dispatchEvent(new Event('femmeera-auth-updated'));
    }
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient<{ user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('femmeera_customer_token');
      localStorage.removeItem('femmeera_customer_user');
      window.location.href = '/';
    }
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('femmeera_customer_user');
    return data ? JSON.parse(data) : null;
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('femmeera_customer_token');
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  },

  async resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse<any>> {
    return apiClient<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email.trim(),
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    });
  },
};
