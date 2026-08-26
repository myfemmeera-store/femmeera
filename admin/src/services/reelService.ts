import { apiClient } from './apiClient';
import { ApiResponse, WatchAndShopReel } from '@/types';

export const reelService = {
  async getReels(): Promise<ApiResponse<WatchAndShopReel[]>> {
    return apiClient.get<WatchAndShopReel[]>('/admin/watch-and-shop');
  },

  async createReel(data: Partial<WatchAndShopReel>): Promise<ApiResponse<WatchAndShopReel>> {
    return apiClient.post<WatchAndShopReel>('/admin/watch-and-shop', data);
  },

  async updateReel(id: number, data: Partial<WatchAndShopReel>): Promise<ApiResponse<WatchAndShopReel>> {
    return apiClient.put<WatchAndShopReel>(`/admin/watch-and-shop/${id}`, data);
  },

  async deleteReel(id: number): Promise<ApiResponse<unknown>> {
    return apiClient.delete(`/admin/watch-and-shop/${id}`);
  },
};
