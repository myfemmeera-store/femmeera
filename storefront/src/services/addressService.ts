import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface CustomerAddress {
  id: number;
  customer_id: number;
  type: 'SHIPPING' | 'BILLING';
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  pincode?: string;
  country: string;
  is_default: boolean;
}

export const addressService = {
  async getAddresses(): Promise<ApiResponse<CustomerAddress[]>> {
    return apiClient<CustomerAddress[]>('/customer/addresses');
  },

  async addAddress(addressData: Omit<CustomerAddress, 'id' | 'customer_id'>): Promise<ApiResponse<CustomerAddress>> {
    return apiClient<CustomerAddress>('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  async updateAddress(id: number, addressData: Partial<CustomerAddress>): Promise<ApiResponse<CustomerAddress>> {
    return apiClient<CustomerAddress>(`/customer/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  async deleteAddress(id: number): Promise<ApiResponse<void>> {
    return apiClient<void>(`/customer/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  async setDefaultAddress(id: number): Promise<ApiResponse<CustomerAddress>> {
    return apiClient<CustomerAddress>(`/customer/addresses/${id}/default`, {
      method: 'POST',
    });
  }
};
