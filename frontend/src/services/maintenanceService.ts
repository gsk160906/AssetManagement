import { api } from './api';

export const getMaintenances = async (params: any = {}) => {
  const response = await api.get('/maintenance', { params });
  return response.data;
};

export const getMaintenanceById = async (id: string) => {
  const response = await api.get(`/maintenance/${id}`);
  return response.data;
};

export const getMaintenanceStats = async () => {
  const response = await api.get('/maintenance/stats');
  return response.data;
};

export const createMaintenance = async (data: {
  assetId: string;
  description: string;
  priority: string;
  estimatedCost?: number;
}) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenance = async (id: string, data: any) => {
  const response = await api.patch(`/maintenance/${id}`, data);
  return response.data;
};

export const updateMaintenanceStatus = async (id: string, data: { status: string; actualCost?: number; notes?: string }) => {
  const response = await api.patch(`/maintenance/${id}/status`, data);
  return response.data;
};

export const deleteMaintenance = async (id: string) => {
  const response = await api.delete(`/maintenance/${id}`);
  return response.data;
};

export default { getMaintenances, getMaintenanceById, getMaintenanceStats, createMaintenance, updateMaintenance, updateMaintenanceStatus, deleteMaintenance };
