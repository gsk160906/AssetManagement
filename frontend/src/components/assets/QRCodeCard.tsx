import React, { useState, useEffect } from 'react';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { getQRCode } from '../../services/assetService';

interface QRCodeCardProps {
  assetId: string;
  assetTag: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ assetId, assetTag }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getQRCode(assetId);
      if (res.success) {
        setQrCode(res.data.qrCode);
      } else {
        setError('Failed to load QR code');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating QR code');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [assetId]);

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col items-center text-center justify-between min-h-[260px]">
      <div className="w-full pb-2 border-b border-base-300/30 flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
          <QrCode size={14} className="text-primary" />
          Asset QR Label
        </h3>
        <button onClick={fetchQRCode} className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content">
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="loading loading-spinner text-primary"></div>
        ) : error ? (
          <div className="text-[10px] text-error font-semibold p-2">{error}</div>
        ) : qrCode ? (
          <img src={qrCode} alt={`QR Label ${assetTag}`} className="w-32 h-32 border border-base-300/30 rounded-xl p-1 bg-white" />
        ) : null}
      </div>

      {qrCode && !isLoading && (
        <a
          href={qrCode}
          download={`Asset-QR-${assetTag}.png`}
          className="btn btn-primary btn-xs w-full rounded-lg mt-3 flex items-center gap-1 text-white font-semibold shadow-md shadow-primary/20 normal-case"
        >
          <Download size={12} />
          Download QR
        </a>
      )}
    </div>
  );
};
export default QRCodeCard;
