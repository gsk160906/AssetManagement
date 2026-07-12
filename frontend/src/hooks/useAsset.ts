import { useState, useEffect, useCallback } from 'react';
import { getAssetById, getAssetQRCode } from '../services/assetService';

export interface UseAssetResult {
  asset: any | null;
  qrCode: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAsset = (id: string | undefined): UseAssetResult => {
  const [asset, setAsset] = useState<any | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assetRes, qrRes] = await Promise.all([
        getAssetById(id),
        getAssetQRCode(id).catch((err) => {
          console.warn('QR Code load failed:', err);
          return { success: false, data: null };
        })
      ]);

      if (assetRes.success) {
        setAsset(assetRes.data);
      } else {
        setError(assetRes.message || 'Asset Not Found');
      }

      if (qrRes && qrRes.success) {
        const qrData = qrRes.data?.qrCode || qrRes.data;
        setQrCode(qrData);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Asset Not Found');
      } else {
        setError(err.response?.data?.message || 'Unable to load asset.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  return {
    asset,
    qrCode,
    isLoading,
    error,
    refetch: fetchAssetDetails
  };
};
export default useAsset;
