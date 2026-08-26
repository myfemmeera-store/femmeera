import { apiClient } from './apiClient';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient<Category[]>('/categories');
  }
};
