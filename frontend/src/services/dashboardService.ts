import { api } from './api';

export const getOverview = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};

export const getCharts = async () => {
  const response = await api.get('/dashboard/charts');
  return response.data;
};

export const getActivities = async (page = 1, limit = 10, range = '30d') => {
  const response = await api.get('/dashboard/activities', {
    params: { page, limit, range },
  });
  return response.data;
};

export const getBookings = async (page = 1, limit = 5) => {
  const response = await api.get('/dashboard/bookings', {
    params: { page, limit },
  });
  return response.data;
};

export const getMaintenance = async () => {
  const response = await api.get('/dashboard/maintenance');
  return response.data;
};

export const getNotifications = async (page = 1, limit = 5) => {
  const response = await api.get('/dashboard/notifications', {
    params: { page, limit },
  });
  return response.data;
};
