import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface ShippingMethod {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  estimated_min_days: number;
  estimated_max_days: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ShippingMethodsResponse {
  methods: ShippingMethod[];
  free_shipping_threshold: number;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  postal_code: string;
  estimated_days?: string;
  message: string;
}

export const shippingService = {
  async getMethods(): Promise<ApiResponse<ShippingMethodsResponse>> {
    return apiClient<ShippingMethodsResponse>('/shipping/methods');
  },

  async checkServiceability(postalCode: string): Promise<ApiResponse<ServiceabilityResponse>> {
    return apiClient<ServiceabilityResponse>('/shipping/check-serviceability', {
      method: 'POST',
      body: JSON.stringify({ postal_code: postalCode }),
    });
  }
};
