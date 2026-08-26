import { apiClient } from './apiClient';
import { ApiResponse, Order } from '@/types';
import { CartPayload } from './cartService';

export interface CheckoutCreatePayload {
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  shipping_method_id?: number;
  coupon_code?: string;
  payment_method?: string;
}

export interface CheckoutCreateResponse {
  order: Order;
  redirect_url: string;
}

export const checkoutService = {
  async getSummary(couponCode?: string, shippingMethodId?: number): Promise<ApiResponse<CartPayload>> {
    return apiClient<CartPayload>('/checkout/summary', {
      method: 'POST',
      body: JSON.stringify({
        coupon_code: couponCode,
        shipping_method_id: shippingMethodId,
      }),
    });
  },

  async validateCheckout(couponCode?: string, shippingMethodId?: number): Promise<ApiResponse<CartPayload>> {
    return apiClient<CartPayload>('/checkout/validate', {
      method: 'POST',
      body: JSON.stringify({
        coupon_code: couponCode,
        shipping_method_id: shippingMethodId,
      }),
    });
  },

  async createOrder(payload: CheckoutCreatePayload): Promise<ApiResponse<CheckoutCreateResponse>> {
    return apiClient<CheckoutCreateResponse>('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
