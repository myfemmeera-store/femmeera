import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface StoreSettings {
  store_name?: string;
  store_logo?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  store_currency?: string;
  currency_symbol?: string;
  free_shipping_threshold?: string;
  announcement_bar?: string;
  default_meta_title?: string;
  default_meta_description?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_whatsapp?: string;
  social_youtube?: string;
  social_pinterest?: string;
  social_twitter?: string;
  [key: string]: any;
}

export const settingService = {
  async getSettings(): Promise<ApiResponse<StoreSettings>> {
    return apiClient.get<StoreSettings>('/settings');
  },
};
