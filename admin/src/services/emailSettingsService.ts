import { apiClient } from './apiClient';

export interface EmailSettingItem {
  id: number;
  event_key: string;
  name: string;
  description: string;
  recipient_type: 'customer' | 'admin';
  is_enabled: boolean;
  subject_template: string | null;
}

export interface SmtpConfigInfo {
  host: string;
  port: number;
  from_address: string;
  from_name: string;
  encryption: string;
  has_username: boolean;
}

export interface EmailSettingsPayload {
  customer_notifications: EmailSettingItem[];
  admin_notifications: EmailSettingItem[];
  smtp_config: SmtpConfigInfo;
}

export const emailSettingsService = {
  async getSettings() {
    return apiClient<EmailSettingsPayload>('/admin/settings/email-notifications');
  },

  async updateSettings(settings: { id: number; is_enabled: boolean; subject_template?: string | null }[]) {
    return apiClient.put<{ message: string }>('/admin/settings/email-notifications', { settings });
  },

  async testConnection(test_email?: string) {
    return apiClient.post<{ message: string; details?: any }>('/admin/settings/email-notifications/test', { test_email });
  },
};
