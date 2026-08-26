import { apiClient } from './apiClient';

export interface PaymentOrderResponse {
  payment_id: number;
  order_id: number;
  order_number: string;
  amount: number;
  currency: string;
  provider: string;
  provider_payment_order_id: string;
  key_id: string;
}

export interface PaymentVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentRecord {
  id: number;
  order_id: number;
  provider: string;
  provider_payment_order_id: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  transactions?: Array<{
    id: number;
    type: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
  refunds?: Array<{
    id: number;
    amount: number;
    reason: string;
    status: string;
    created_at: string;
  }>;
}

export const paymentService = {
  /**
   * Create Razorpay Payment Order for an existing unpaid customer order.
   */
  async createPaymentOrder(orderId: string | number): Promise<PaymentOrderResponse> {
    const res = await apiClient<PaymentOrderResponse>('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to create payment order');
    }
    return res.data;
  },

  /**
   * Authoritatively verify payment signature with backend.
   */
  async verifyPayment(payload: PaymentVerifyPayload): Promise<{ success: boolean; message: string; order?: any }> {
    const res = await apiClient<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message || '',
      order: res.data,
    };
  },

  /**
   * Fetch payment status and record details.
   */
  async getPayment(paymentId: string | number): Promise<PaymentRecord> {
    const res = await apiClient<PaymentRecord>(`/payments/${paymentId}`);
    if (!res.data) {
      throw new Error(res.message || 'Payment record not found');
    }
    return res.data;
  },

  /**
   * Retry payment for an unpaid order.
   */
  async retryPayment(orderId: string | number): Promise<PaymentOrderResponse> {
    const res = await apiClient<PaymentOrderResponse>(`/payments/${orderId}/retry`, {
      method: 'POST',
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to retry payment');
    }
    return res.data;
  },
};
