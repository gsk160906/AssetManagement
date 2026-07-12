import { api } from './api';

export interface DepartmentParams {
  name: string;
  parent_id?: string | null;
  manager_id?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export const getDepartments = async (params: any = {}) => {
  const response = await api.get('/departments', { params });
  return response.data;
};

export const getDepartmentById = async (id: string) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const getDepartmentTree = async () => {
  const response = await api.get('/departments/tree');
  return response.data;
};

export const getDepartmentStats = async () => {
  const response = await api.get('/departments/stats');
  return response.data;
};

export const getDepartmentEmployees = async (id: string) => {
  const response = await api.get(`/departments/${id}/employees`);
  return response.data;
};

export const getDepartmentAssets = async (id: string) => {
  const response = await api.get(`/departments/${id}/assets`);
  return response.data;
};

export const createDepartment = async (data: DepartmentParams) => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: string, data: Partial<DepartmentParams>) => {
  const response = await api.patch(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

export default {
  getDepartments,
  getDepartmentById,
  getDepartmentTree,
  getDepartmentStats,
  getDepartmentEmployees,
  getDepartmentAssets,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
