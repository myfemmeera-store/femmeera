import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export const productService = {
  async getProducts(page = 1, search = '', categoryId = ''): Promise<ApiResponse<Product[]>> {
    let query = `?page=${page}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (categoryId) query += `&category_id=${categoryId}`;

    return apiClient<Product[]>(`/admin/products${query}`);
  },

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient<Product>(`/admin/products/${id}`);
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }
};
