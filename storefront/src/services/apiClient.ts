import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('femmeera_customer_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data?.success) {
      return {
        success: false,
        message: data?.message || 'An error occurred during request execution.',
        data: undefined as unknown as T,
        errors: data?.errors,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    return {
      success: false,
      message: 'Unable to connect to Femmeera backend service.',
      data: [] as unknown as T,
    };
  }
}

apiClient.get = function <T>(endpoint: string, options: RequestInit = {}) {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
};

apiClient.post = function <T>(endpoint: string, body?: any, options: RequestInit = {}) {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

apiClient.put = function <T>(endpoint: string, body?: any, options: RequestInit = {}) {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

apiClient.delete = function <T>(endpoint: string, options: RequestInit = {}) {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
};
