import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_type: string;
  provider: string;
  status: string;
  avatar?: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export const customerService = {
  async getCustomers(search?: string): Promise<ApiResponse<CustomerUser[]>> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient<CustomerUser[]>(`/admin/customers${query}`);
  },

  async getCustomerById(id: number): Promise<ApiResponse<CustomerUser>> {
    return apiClient<CustomerUser>(`/admin/customers/${id}`);
  },

  async toggleCustomerStatus(id: number): Promise<ApiResponse<{ id: number; status: string }>> {
    return apiClient<{ id: number; status: string }>(`/admin/customers/${id}/status`, {
      method: 'PUT',
    });
  },
};
