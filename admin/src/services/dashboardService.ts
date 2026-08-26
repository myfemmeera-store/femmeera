import { apiClient } from './apiClient';
import { ApiResponse, DashboardStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient<DashboardStats>('/admin/dashboard');
  }
};
