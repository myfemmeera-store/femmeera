import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  category_name: string;
  image_url?: string | null;
}

export interface ProductsResponsePayload {
  data?: Product[];
  related_products?: Product[];
}

export const productService = {
  async getProducts(params?: {
    page?: number;
    search?: string;
    category_slug?: string;
    sort?: string;
    min_price?: number;
    max_price?: number;
    gender?: string;
  }): Promise<ApiResponse<Product[]> & { related_products?: Product[] }> {
    let query = `?page=${params?.page || 1}`;
    if (params?.search) query += `&search=${encodeURIComponent(params.search)}`;
    if (params?.category_slug) query += `&category_slug=${encodeURIComponent(params.category_slug)}`;
    if (params?.sort) query += `&sort=${encodeURIComponent(params.sort)}`;
    if (params?.min_price) query += `&min_price=${params.min_price}`;
    if (params?.max_price) query += `&max_price=${params.max_price}`;
    if (params?.gender) query += `&gender=${encodeURIComponent(params.gender)}`;

    return apiClient<Product[]>(`/products${query}`);
  },

  async getSearchSuggestions(query: string): Promise<ApiResponse<SearchSuggestion[]>> {
    if (!query.trim()) return { success: true, data: [] };
    return apiClient<SearchSuggestion[]>(`/products/suggestions?q=${encodeURIComponent(query)}`);
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      return await apiClient<Product>(`/products/${encodeURIComponent(slug)}`);
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Product not found.',
        data: undefined as any,
      };
    }
  }
};
