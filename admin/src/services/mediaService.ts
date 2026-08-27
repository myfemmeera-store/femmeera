import { apiClient } from './apiClient';

export interface MediaUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    path: string;
    disk: string;
    filename: string;
    mime_type: string;
    size: number;
  };
}

export const mediaService = {
  async uploadImage(file: File, folder: 'products' | 'categories' | 'banners' | 'cms' | 'branding' | 'general' = 'general'): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = typeof window !== 'undefined' ? localStorage.getItem('femmeera_admin_token') : '';
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '');

    const res = await fetch(`${apiBase}/admin/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data: MediaUploadResponse = await res.json();

    if (data.success && data.data?.url) {
      let rawUrl = data.data.url;
      // Normalize URL if it contains localhost or 127.0.0.1
      if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
        const domainOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
        const pathPart = rawUrl.replace(/^https?:\/\/[^\/]+/, '');
        rawUrl = `${domainOrigin}${pathPart}`;
      } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        const domainOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
        const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        rawUrl = `${domainOrigin}${cleanPath.startsWith('/storage') ? cleanPath : `/storage${cleanPath}`}`;
      }
      data.data.url = rawUrl;
    }

    return data;
  },
};
