import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface CourierOption {
  courier_company_id: number;
  courier_name: string;
  courier_rating: number;
  estimated_delivery_date: string;
  estimated_days: string;
  chargeable_weight: number;
  freight_charge: number;
  cod_charge: number;
  total_shipping_charge: number;
  payment_mode: 'Prepaid' | 'COD';
  courier_type: 'Surface' | 'Air';
  serviceability_status: boolean;
  recommendation_score: number;
}

export interface RateCalculationResult {
  shipment_details: {
    actual_weight_kg: number;
    volumetric_weight_kg: number;
    applicable_weight_kg: number;
    dimensions_cm: {
      length: number;
      breadth: number;
      height: number;
    };
    payment_mode: 'Prepaid' | 'COD';
    declared_value_inr: number;
    is_dangerous: boolean;
  };
  pickup_location: {
    pincode: string;
    city: string;
    state: string;
  };
  delivery_location: {
    pincode: string;
    city: string;
    state: string;
  };
  available_couriers: CourierOption[];
}

export interface ShiprocketRateParams {
  pickup_postcode?: string;
  delivery_postcode: string;
  weight: number;
  declared_value: number;
  cod?: boolean;
  length?: number;
  breadth?: number;
  height?: number;
  is_dangerous?: boolean;
}

export const shiprocketService = {
  /**
   * Calculate courier rates using Shiprocket API
   */
  async calculateRates(params: ShiprocketRateParams): Promise<ApiResponse<RateCalculationResult>> {
    return apiClient.post<RateCalculationResult>('/admin/shipping/rates/calculate', params);
  },

  /**
   * Create Shiprocket shipment for Femmeera order
   */
  async createShipment(
    orderId: number,
    custom?: {
      courier_id?: number;
      courier_name?: string;
      pickup_location?: string;
      weight?: number;
      length?: number;
      breadth?: number;
      height?: number;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/admin/orders/${orderId}/create-shipment`, custom || {});
  },

  /**
   * Get Shiprocket tracking by Order ID
   */
  async trackShipment(orderId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/admin/orders/${orderId}/track-shipment`);
  },
};
