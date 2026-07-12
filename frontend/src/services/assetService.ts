import { api } from './api';

export const getAssets = async (params: any = {}) => {
  const response = await api.get('/assets', { params });
  return response.data;
};

export const getAssetById = async (id: string) => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data: any) => {
  const response = await api.post('/assets', data);
  return response.data;
};

export const updateAsset = async (id: string, data: any) => {
  const response = await api.patch(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: string) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

export const duplicateAsset = async (id: string) => {
  const response = await api.post(`/assets/${id}/duplicate`);
  return response.data;
};

export const archiveAsset = async (id: string, status: string) => {
  const response = await api.patch(`/assets/${id}/archive`, { status });
  return response.data;
};

// Allocation calls
export const allocateAsset = async (id: string, data: any) => {
  const response = await api.post(`/assets/${id}/allocate`, data);
  return response.data;
};

export const returnAsset = async (id: string, data: any) => {
  const response = await api.post(`/assets/${id}/return`, data);
  return response.data;
};

export const extendAllocation = async (id: string, expected_return_date: string) => {
  const response = await api.patch(`/assets/${id}/extend`, { expected_return_date });
  return response.data;
};

export const getAllocationHistory = async (id: string) => {
  const response = await api.get(`/assets/${id}/allocation-history`);
  return response.data;
};

// Transfer calls
export const requestTransfer = async (id: string, data: any) => {
  const response = await api.post(`/assets/${id}/transfer`, data);
  return response.data;
};

export const approveTransfer = async (id: string) => {
  const response = await api.patch(`/assets/transfers/${id}/approve`);
  return response.data;
};

export const rejectTransfer = async (id: string, remarks: string) => {
  const response = await api.patch(`/assets/transfers/${id}/reject`, { remarks });
  return response.data;
};

export const completeTransfer = async (id: string) => {
  const response = await api.patch(`/assets/transfers/${id}/complete`);
  return response.data;
};

export const getTransferHistory = async (id: string) => {
  const response = await api.get(`/assets/${id}/transfers`);
  return response.data;
};

// Maintenance calls
export const createMaintenance = async (assetId: string, data: any) => {
  const response = await api.post('/maintenance', { ...data, asset_id: assetId });
  return response.data;
};

export const assignTechnician = async (ticketId: string, assigned_technician_id: string) => {
  const response = await api.patch(`/maintenance/${ticketId}/assign`, { assigned_technician_id });
  return response.data;
};

export const updateMaintenance = async (ticketId: string, data: any) => {
  const response = await api.patch(`/maintenance/${ticketId}`, data);
  return response.data;
};

export const resolveMaintenance = async (ticketId: string, data: any) => {
  const response = await api.patch(`/maintenance/${ticketId}/resolve`, data);
  return response.data;
};

export const getMaintenanceHistory = async (id: string) => {
  const response = await api.get(`/assets/${id}/maintenance`);
  return response.data;
};

// Warranty calls
export const getExpiringWarranties = async (days = 30) => {
  const response = await api.get('/assets/warranty/expiring', { params: { days } });
  return response.data;
};

export const getExpiredWarranties = async () => {
  const response = await api.get('/assets/warranty/expired');
  return response.data;
};

// Documents calls
export const createDocument = async (id: string, docData: any) => {
  const response = await api.post(`/assets/${id}/documents`, docData);
  return response.data;
};

export const getDocuments = async (id: string) => {
  const response = await api.get(`/assets/${id}/documents`);
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await api.delete(`/assets/documents/${id}`);
  return response.data;
};

// Timeline calls
export const getAssetTimeline = async (id: string) => {
  const response = await api.get(`/assets/${id}/timeline`);
  return response.data;
};

// QR Code calls
export const getQRCode = async (id: string) => {
  const response = await api.get(`/assets/${id}/qrcode`);
  return response.data;
};

export const getAssetQRCode = async (id: string) => {
  const response = await api.get(`/assets/${id}/qrcode`);
  return response.data;
};

// Bulk Operations calls
export const bulkImport = async (assets: any[]) => {
  const response = await api.post('/assets/bulk-import', { assets });
  return response.data;
};

export const bulkUpdateStatus = async (ids: string[], status: string) => {
  const response = await api.patch('/assets/bulk-status', { ids, status });
  return response.data;
};

export const bulkDelete = async (ids: string[]) => {
  const response = await api.post('/assets/bulk-delete', { ids }); // Using POST in frontend since express delete body isn't universal
  return response.data;
};
export default {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  duplicateAsset,
  archiveAsset,
  allocateAsset,
  returnAsset,
  extendAllocation,
  getAllocationHistory,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getTransferHistory,
  createMaintenance,
  assignTechnician,
  updateMaintenance,
  resolveMaintenance,
  getMaintenanceHistory,
  getExpiringWarranties,
  getExpiredWarranties,
  createDocument,
  getDocuments,
  deleteDocument,
  getAssetTimeline,
  getQRCode,
  getAssetQRCode,
  bulkImport,
  bulkUpdateStatus,
  bulkDelete
};
