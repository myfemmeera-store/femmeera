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

    const token = localStorage.getItem('femmeera_admin_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    const res = await fetch(`${baseUrl}/admin/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    return await res.json();
  },
};
