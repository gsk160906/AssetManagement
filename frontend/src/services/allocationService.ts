import { api } from './api';

export const getAllocations = async (params: any = {}) => {
  const response = await api.get('/allocations', { params });
  return response.data;
};

export const allocateAsset = async (data: { assetId: string; employeeId: string; expectedReturnDate?: string; notes?: string }) => {
  const response = await api.post('/allocations', data);
  return response.data;
};

export const returnAsset = async (id: string, data: { conditionAfter: string; notes?: string }) => {
  const response = await api.patch(`/allocations/${id}/return`, data);
  return response.data;
};

export const transferAsset = async (data: { assetId: string; newEmployeeId: string; notes?: string }) => {
  const response = await api.post('/allocations/transfer', data);
  return response.data;
};

export const getAllocationHistory = async (assetId: string) => {
  const response = await api.get(`/allocations/history/${assetId}`);
  return response.data;
};

export const getEmployeeAssets = async (employeeId: string) => {
  const response = await api.get(`/allocations/employee/${employeeId}`);
  return response.data;
};

export default {
  getAllocations,
  allocateAsset,
  returnAsset,
  transferAsset,
  getAllocationHistory,
  getEmployeeAssets
};
