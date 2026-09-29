import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export const productService = {
  async getProducts(page = 1, search = '', categorySlug = '', perPage = 15): Promise<ApiResponse<Product[]>> {
    let query = `?page=${page}&per_page=${perPage}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (categorySlug) query += `&category_slug=${encodeURIComponent(categorySlug)}`;

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
  },

  async reorderProducts(items: { id: number; sort_order: number }[]): Promise<ApiResponse<null>> {
    return apiClient<null>('/admin/products/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }
};
