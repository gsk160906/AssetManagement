import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { allocateAsset } from '../../services/assetService';

interface AllocationModalProps {
  assetId: string;
  assetTag: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({ assetId, assetTag, isOpen, onClose, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState('e1000000-0000-0000-0000-000000000002'); // Sarah Jenkins by default
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [conditionBefore, setConditionBefore] = useState('GOOD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seeded list of users for easy allocation demo
  const mockEmployees = [
    { id: 'e1000000-0000-0000-0000-000000000002', name: 'Sarah Jenkins (IT)' },
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
      const res = await allocateAsset(assetId, {
        employee_id: employeeId,
        expected_return_date: expectedReturnDate || null,
        condition_before: conditionBefore,
        notes
      });
      if (res.success) {
        toast.success('Asset allocated successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allocate asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
        <h3 className="font-bold text-sm text-base-content mb-4">Allocate Asset {assetTag}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Select Assignee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="select select-sm select-bordered w-full text-xs"
            >
              {mockEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Expected Return Date</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="input input-sm input-bordered w-full text-xs"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Handout Condition</label>
            <select
              value={conditionBefore}
              onChange={(e) => setConditionBefore(e.target.value)}
              className="select select-sm select-bordered w-full text-xs"
            >
              <option value="EXCELLENT">EXCELLENT</option>
              <option value="GOOD">GOOD</option>
              <option value="FAIR">FAIR</option>
              <option value="POOR">POOR</option>
              <option value="DAMAGED">DAMAGED</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Notes</label>
            <textarea
              placeholder="e.g. Standard handout with chargers and protective casing"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full text-xs h-16"
            ></textarea>
          </div>

          <div className="modal-action gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm btn-primary text-white font-semibold shadow-md shadow-primary/20 px-5 normal-case text-xs"
            >
              {isSubmitting ? 'Allocating...' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AllocationModal;
