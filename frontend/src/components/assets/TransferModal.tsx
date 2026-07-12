import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { requestTransfer } from '../../services/assetService';

interface TransferModalProps {
  assetId: string;
  assetTag: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ assetId, assetTag, isOpen, onClose, onSuccess }) => {
  const [toEmployeeId, setToEmployeeId] = useState('e1000000-0000-0000-0000-000000000004'); // Michael Chang by default
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seeded list of users for easy transfer destination demo
  const mockEmployees = [
    { id: 'e1000000-0000-0000-0000-000000000004', name: 'Michael Chang (HR)' },
    { id: 'e1000000-0000-0000-0000-000000000005', name: 'Olivia Davis (HR)' },
    { id: 'e1000000-0000-0000-0000-000000000007', name: 'Robert Miller (Finance)' },
    { id: 'e1000000-0000-0000-0000-000000000008', name: 'Sophia Taylor (Finance)' },
    { id: 'e1000000-0000-0000-0000-000000000009', name: 'William Brown (Unassigned)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await requestTransfer(assetId, {
        to_employee_id: toEmployeeId,
        remarks
      });
      if (res.success) {
        toast.success('Asset transfer requested successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
        <h3 className="font-bold text-sm text-base-content mb-4">Request Asset Transfer ({assetTag})</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Destination Employee</label>
            <select
              value={toEmployeeId}
              onChange={(e) => setToEmployeeId(e.target.value)}
              className="select select-sm select-bordered w-full text-xs"
            >
              {mockEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Transfer Remarks</label>
            <textarea
              placeholder="e.g. Employee reallocation to HR department workspace"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full text-xs h-20"
            ></textarea>
          </div>

          <div className="modal-action gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm btn-primary text-white font-semibold shadow-md shadow-primary/20 px-5 normal-case text-xs"
            >
              {isSubmitting ? 'Requesting...' : 'Request Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TransferModal;
