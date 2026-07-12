import { api } from './api';
import type { UserProfile, UserPreferences, UserSession } from '../types/profile';

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/profile');
  return response.data.data.profile;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put('/profile', data);
  return response.data.data.profile;
};

export const uploadAvatar = async (formData: FormData): Promise<{ profile_image_url: string }> => {
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const deleteAvatar = async (): Promise<{ success: boolean }> => {
  const response = await api.delete('/profile/avatar');
  return response.data.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
  const response = await api.patch('/profile/change-password', { currentPassword, newPassword });
  return response.data.data;
};

export const getPreferences = async (): Promise<UserPreferences> => {
  const response = await api.get('/profile/preferences');
  return response.data.data.preferences;
};

export const updatePreferences = async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
  const response = await api.patch('/profile/preferences', data);
  return response.data.data.preferences;
};

export const getSessions = async (): Promise<{ current: UserSession | null; others: UserSession[] }> => {
  const response = await api.get('/profile/sessions');
  return response.data.data;
};

export const logoutCurrentSession = async (): Promise<{ success: boolean }> => {
  const response = await api.delete('/profile/sessions/current');
  return response.data.data;
};

export const logoutAllSessions = async (): Promise<{ success: boolean }> => {
  const response = await api.delete('/profile/sessions');
  return response.data.data;
};
