import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface HeroBanner {
  id?: number;
  title: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  image_display_url?: string;
  mobile_image_display_url?: string;
  button_text?: string;
  button_url?: string;
  sort_order?: number;
  status: 'ACTIVE' | 'DISABLED';
}

export interface PopupItem {
  id?: number;
  title: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  coupon_code?: string;
  status: 'ACTIVE' | 'DISABLED';
}

export const cmsService = {
  // Banners
  async getBanners(): Promise<ApiResponse<HeroBanner[]>> {
    return apiClient.get<HeroBanner[]>('/admin/banners');
  },

  async createBanner(data: Partial<HeroBanner>): Promise<ApiResponse<HeroBanner>> {
    return apiClient.post<HeroBanner>('/admin/banners', data);
  },

  async updateBanner(id: number, data: Partial<HeroBanner>): Promise<ApiResponse<HeroBanner>> {
    return apiClient.put<HeroBanner>(`/admin/banners/${id}`, data);
  },

  async deleteBanner(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/banners/${id}`);
  },

  // Popups
  async getPopups(): Promise<ApiResponse<PopupItem[]>> {
    return apiClient.get<PopupItem[]>('/admin/popups');
  },

  async createPopup(data: Partial<PopupItem>): Promise<ApiResponse<PopupItem>> {
    return apiClient.post<PopupItem>('/admin/popups', data);
  },

  async updatePopup(id: number, data: Partial<PopupItem>): Promise<ApiResponse<PopupItem>> {
    return apiClient.put<PopupItem>(`/admin/popups/${id}`, data);
  },

  async deletePopup(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/popups/${id}`);
  },

  // Store & CMS Settings
  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return apiClient.get<Record<string, any>>('/admin/settings');
  },

  async updateSettings(data: Record<string, any>): Promise<ApiResponse<Record<string, any>>> {
    return apiClient.post<Record<string, any>>('/admin/settings', data);
  },
};
