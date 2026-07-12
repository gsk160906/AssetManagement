import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createMaintenance } from '../../services/assetService';

interface MaintenanceModalProps {
  assetId: string;
  assetTag: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ assetId, assetTag, isOpen, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 3) {
      return toast.error('Description must be at least 3 characters');
    }
    
    setIsSubmitting(true);
    try {
      const res = await createMaintenance(assetId, {
        description,
        priority
      });
      if (res.success) {
        toast.success('Maintenance ticket created successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to file maintenance request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
        <h3 className="font-bold text-sm text-base-content mb-4">File Maintenance Ticket ({assetTag})</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Problem Description</label>
            <textarea
              placeholder="e.g. Screen back-lighting failing or hardware over-heating during loads"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full text-xs h-24"
              required
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Ticket Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="select select-sm select-bordered w-full text-xs"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="modal-action gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm btn-primary text-white font-semibold shadow-md shadow-primary/20 px-5 normal-case text-xs"
            >
              {isSubmitting ? 'Submitting...' : 'File Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default MaintenanceModal;
