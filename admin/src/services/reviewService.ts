import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface ReviewItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  user_id: number;
  user_name: string;
  user_email: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export const reviewService = {
  async getReviews(page = 1): Promise<ApiResponse<ReviewItem[]>> {
    return apiClient.get<ReviewItem[]>(`/admin/reviews?page=${page}`);
  },

  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/reviews/${id}/status`, { status });
  },

  async deleteReview(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/reviews/${id}`);
  },
};
