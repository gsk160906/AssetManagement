import React, { useState } from 'react';
import { Trash2, FileDown } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedIds: string[];
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onCSVExport: () => void;
  isProcessing?: boolean;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedIds,
  onBulkDelete,
  onBulkStatusUpdate,
  onCSVExport,
  isProcessing = false
}) => {
  const [status, setStatus] = useState('AVAILABLE');

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-base-100/90 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-50 w-[90%] max-w-4xl animate-slide-up">
      <div className="flex items-center gap-2">
        <span className="badge badge-primary text-white font-extrabold text-xs">{selectedIds.length}</span>
        <span className="text-xs font-semibold text-base-content/75">Assets Selected</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={onCSVExport}
          className="btn btn-outline btn-xs gap-1 font-semibold rounded-lg text-xs"
        >
          <FileDown size={13} />
          Export CSV
        </button>

        <div className="flex items-center gap-1.5 border-l border-base-300 pl-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-xs select-bordered font-medium text-xs"
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNDER_MAINTENANCE">MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
            <option value="DISPOSED">DISPOSED</option>
          </select>
          <button
            onClick={() => onBulkStatusUpdate(status)}
            disabled={isProcessing}
            className="btn btn-primary btn-xs text-white font-semibold rounded-lg text-xs"
          >
            {isProcessing ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        <button
          onClick={onBulkDelete}
          disabled={isProcessing}
          className="btn btn-error btn-xs text-white gap-1 font-semibold rounded-lg text-xs"
        >
          <Trash2 size={13} />
          Delete Selected
        </button>
      </div>
    </div>
  );
};
export default BulkActionToolbar;
