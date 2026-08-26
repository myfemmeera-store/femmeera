import { apiClient } from './apiClient';
import { ApiResponse, InventoryItem } from '@/types';

export interface InventoryTransactionItem {
  id: number;
  variant_id: number;
  type: string;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  variant?: {
    sku: string;
    size: string;
    color: string;
    product?: { name: string };
  };
  creator?: { name: string };
}

export const inventoryService = {
  async getInventory(page = 1, search = ''): Promise<ApiResponse<InventoryItem[]>> {
    let query = `?page=${page}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return apiClient<InventoryItem[]>(`/admin/inventory${query}`);
  },

  async getLowStock(page = 1): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient<InventoryItem[]>(`/admin/inventory/low-stock?page=${page}`);
  },

  async getOutOfStock(page = 1): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient<InventoryItem[]>(`/admin/inventory/out-of-stock?page=${page}`);
  },

  async getHistory(page = 1, variantId?: number): Promise<ApiResponse<InventoryTransactionItem[]>> {
    let query = `?page=${page}`;
    if (variantId) query += `&variant_id=${variantId}`;
    return apiClient<InventoryTransactionItem[]>(`/admin/inventory/history${query}`);
  },

  async adjustStock(
    variantId: number,
    quantity: number,
    type: string,
    notes?: string
  ): Promise<ApiResponse<InventoryItem>> {
    return apiClient<InventoryItem>(`/admin/inventory/${variantId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ quantity, type, notes }),
    });
  }
};
