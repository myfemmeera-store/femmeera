import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface CartPayloadItem {
  cart_item_id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  slug: string;
  brand: string;
  category_name: string;
  sku: string;
  size: string;
  color: string;
  image_url: string;
  unit_price: number;
  mrp: number;
  discount_percent: number;
  quantity: number;
  line_total: number;
  stock: number;
  is_available: boolean;
}

export interface CartPayload {
  cart_id: number;
  guest_session_id?: string;
  items: CartPayloadItem[];
  item_count: number;
  subtotal: number;
  discount: number;
  offer_discount: number;
  coupon_discount: number;
  applied_coupon?: {
    id: number;
    code: string;
    name: string;
    discount_amount: number;
  } | null;
  coupon_error?: string | null;
  shipping: {
    method_id?: number | null;
    method_name: string;
    estimated_days: string;
    base_price: number;
    amount: number;
    is_free_shipping: boolean;
    free_shipping_threshold: number;
    amount_needed_for_free_shipping: number;
  };
  tax: {
    rule_name: string;
    rate_percentage: number;
    is_inclusive: boolean;
    tax_amount: number;
  };
  total: number;
  currency: string;
  currency_symbol: string;
  validation_notices: string[];
}

const GUEST_SESSION_KEY = 'femmeera_guest_session_id';

export const getGuestSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
};

export const cartService = {
  getGuestSessionId,

  async getCart(couponCode?: string, shippingMethodId?: number): Promise<ApiResponse<CartPayload>> {
    const guestId = getGuestSessionId();
    const query = new URLSearchParams();
    if (couponCode) query.append('coupon_code', couponCode);
    if (shippingMethodId) query.append('shipping_method_id', shippingMethodId.toString());

    return apiClient<CartPayload>(`/cart?${query.toString()}`, {
      headers: {
        'X-Guest-Session-ID': guestId,
      },
    });
  },

  async addItem(variantId: number, quantity = 1): Promise<ApiResponse<CartPayload>> {
    const guestId = getGuestSessionId();
    return apiClient<CartPayload>('/cart/items', {
      method: 'POST',
      headers: {
        'X-Guest-Session-ID': guestId,
      },
      body: JSON.stringify({
        variant_id: variantId,
        quantity,
      }),
    });
  },

  async updateQuantity(cartItemId: number, quantity: number): Promise<ApiResponse<CartPayload>> {
    const guestId = getGuestSessionId();
    return apiClient<CartPayload>(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: {
        'X-Guest-Session-ID': guestId,
      },
      body: JSON.stringify({
        quantity,
      }),
    });
  },

  async removeItem(cartItemId: number): Promise<ApiResponse<CartPayload>> {
    const guestId = getGuestSessionId();
    return apiClient<CartPayload>(`/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'X-Guest-Session-ID': guestId,
      },
    });
  },

  async mergeCart(): Promise<ApiResponse<CartPayload>> {
    const guestId = getGuestSessionId();
    if (!guestId) return { success: false, message: 'No guest session' };

    return apiClient<CartPayload>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({
        guest_session_id: guestId,
      }),
    });
  }
};
