import { api } from './api';
import type { NotificationPreferences, NotificationFilters } from '../types/notification';

export const getNotifications = async (filters: Partial<NotificationFilters> = {}) => {
  const response = await api.get('/notifications', { params: filters });
  return response.data;
};

export const getNotification = async (id: string) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/count');
  return response.data;
};

export const markRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markUnread = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/unread`);
  return response.data;
};

export const markAllRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const deleteReadNotifications = async () => {
  const response = await api.delete('/notifications/read');
  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

export const updatePreferences = async (data: Partial<NotificationPreferences>) => {
  const response = await api.patch('/notifications/preferences', data);
  return response.data;
};
