import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Download } from 'lucide-react';
import { exportReport } from '../../services/reportService';
import { Button } from '../../components/common/Button';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'ASSET_REPORT' | 'MAINTENANCE_REPORT' | 'AUDIT_REPORT' | 'BOOKING_REPORT' | 'EXPENSE_REPORT';
  reportName: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen, onClose, reportType, reportName
}) => {
  const [format, setFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const filters: Record<string, any> = {};
      if (fromDate) filters.from_date = fromDate;
      if (toDate) filters.to_date = toDate;

      const res = await exportReport({
        type: reportType,
        format,
        filters
      });

      if (res.success && res.data?.downloadUrl) {
        toast.success(`${format} export generated successfully!`);
        
        // Resolve absolute URL
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
        const absoluteUrl = apiBase.replace('/api/v1', '') + res.data.downloadUrl;
        
        // Trigger file download
        const link = document.createElement('a');
        link.href = absoluteUrl;
        link.setAttribute('download', res.data.fileName || 'report');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
      } else {
        toast.error(res.message || 'Export generation failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Export failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm">Export Report</h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle text-base-content/50"><X size={14} /></button>
        </div>
        <p className="text-xs text-base-content/50 mb-4">{reportName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Format */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Export File Format *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input type="radio" name="format" checked={format === 'CSV'} onChange={() => setFormat('CSV')} className="radio radio-xs radio-primary" />
                CSV Format
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input type="radio" name="format" checked={format === 'PDF'} onChange={() => setFormat('PDF')} className="radio radio-xs radio-primary" />
                PDF Document
              </label>
            </div>
          </div>

          {/* Date range filters */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input input-sm input-bordered w-full text-xs" />
          </div>
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input input-sm input-bordered w-full text-xs" />
          </div>

          <div className="modal-action gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
            <Button type="submit" variant="primary" size="sm" isLoading={isProcessing} disabled={isProcessing} className="shadow-md shadow-primary/10">
              <Download size={13} className="mr-1" /> Generate File
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
