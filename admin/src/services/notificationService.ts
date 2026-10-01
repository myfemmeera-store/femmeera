import { apiClient } from './apiClient';

export interface NotificationItem {
  id: string;
  type: 'order' | 'stock' | 'user' | 'payment';
  title: string;
  description: string;
  time: string;
  link: string;
  isRead: boolean;
}

export const notificationService = {
  getNotifications: async () => {
    return apiClient<NotificationItem[]>('/admin/notifications');
  },

  markAsRead: async (id: string) => {
    return apiClient.post(`/admin/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.post('/admin/notifications/read-all');
  },
};
