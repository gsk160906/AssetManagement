import { api } from './api';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export const getUsers = async (params: UserFilters = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
