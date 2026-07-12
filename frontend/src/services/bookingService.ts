import { api } from './api';

export interface BookingFilters {
  q?: string;
  status?: string;
  employeeId?: string;
  resourceId?: string;
  departmentId?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const getBookings = async (params: BookingFilters = {}) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const getMyBookings = async (params: BookingFilters = {}) => {
  const response = await api.get('/bookings/my', { params });
  return response.data;
};

export const getBookingStats = async () => {
  const response = await api.get('/bookings/stats');
  return response.data;
};

export const getCalendarEvents = async (params: { employeeId?: string } = {}) => {
  const response = await api.get('/bookings/calendar', { params });
  return response.data;
};

export const getBookingById = async (id: string) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const getAvailableResources = async (start: string, end: string) => {
  const response = await api.get('/bookings/available-resources', {
    params: { start, end }
  });
  return response.data;
};

export const createBooking = async (data: {
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  notes?: string | null;
}) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const updateBooking = async (id: string, data: {
  startTime?: string;
  endTime?: string;
  purpose?: string;
  notes?: string | null;
  status?: string;
}) => {
  const response = await api.patch(`/bookings/${id}`, data);
  return response.data;
};

export const cancelBooking = async (id: string) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export default {
  getBookings,
  getMyBookings,
  getBookingStats,
  getCalendarEvents,
  getBookingById,
  getAvailableResources,
  createBooking,
  updateBooking,
  cancelBooking
};
