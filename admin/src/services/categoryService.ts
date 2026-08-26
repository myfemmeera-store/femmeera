import { apiClient } from './apiClient';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient<Category[]>('/admin/categories');
  },

  async createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    return apiClient<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
    return apiClient<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }
};
