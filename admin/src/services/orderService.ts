import { apiClient } from './apiClient';
import { ApiResponse, Order } from '@/types';

export interface OrderItemDetail {
  id: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
}

export interface OrderStatusHistoryItem {
  id: number;
  previous_status?: string | null;
  new_status: string;
  comment?: string | null;
  created_at: string;
  changer?: { name: string };
}

export interface DetailedOrder extends Order {
  user?: { name: string; email: string; phone?: string };
  items: OrderItemDetail[];
  shipping_address_snapshot: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  billing_address_snapshot: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  status_history?: OrderStatusHistoryItem[];
  latest_payment?: {
    id: number;
    provider: string;
    provider_payment_order_id?: string;
    provider_payment_id?: string;
    provider_signature?: string;
    amount: number;
    currency: string;
    status: string;
    paid_at?: string;
    created_at: string;
  };
}

export const orderService = {
  async getOrders(page = 1, search = '', status = '', paymentStatus = ''): Promise<ApiResponse<DetailedOrder[]>> {
    let query = `?page=${page}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (paymentStatus) query += `&payment_status=${encodeURIComponent(paymentStatus)}`;

    return apiClient<DetailedOrder[]>(`/admin/orders${query}`);
  },

  async getOrder(id: number): Promise<ApiResponse<DetailedOrder>> {
    return apiClient<DetailedOrder>(`/admin/orders/${id}`);
  },

  async updateStatus(id: number, status: string, comment?: string): Promise<ApiResponse<DetailedOrder>> {
    return apiClient<DetailedOrder>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    });
  },

  async cancelOrder(id: number, reason: string): Promise<ApiResponse<DetailedOrder>> {
    return apiClient<DetailedOrder>(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async updateTracking(
    id: number,
    carrier: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<ApiResponse<DetailedOrder>> {
    return apiClient<DetailedOrder>(`/admin/orders/${id}/tracking`, {
      method: 'POST',
      body: JSON.stringify({ carrier, tracking_number: trackingNumber, tracking_url: trackingUrl }),
    });
  }
};
