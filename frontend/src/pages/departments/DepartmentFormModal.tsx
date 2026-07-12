import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';
import { createDepartment, updateDepartment } from '../../services/departmentService';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: any | null; // If editing
  departmentsList: any[];
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen, onClose, onSuccess, department, departmentsList
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isEdit = !!department;

  // Load eligible managers
  useEffect(() => {
    if (!isOpen) return;
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.get('/auth/users');
        if (res.data.success) {
          setUsers(res.data.data.users ?? []);
        }
      } catch {
        toast.error('Failed to load employee list.');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [isOpen]);

  // Set form defaults when editing
  useEffect(() => {
    if (department) {
      setName(department.name || '');
      setParentId(department.parent_id || '');
      setManagerId(department.manager_id || '');
      setStatus(department.status || 'ACTIVE');
    } else {
      setName('');
      setParentId('');
      setManagerId('');
      setStatus('ACTIVE');
    }
  }, [department, isOpen]);

  if (!isOpen) return null;

  // Filter out invalid parent selections (the department itself or its children)
  const isDescendantOf = (childId: string, ancestorId: string): boolean => {
    if (!childId || !ancestorId) return false;
    const childDept = departmentsList.find(d => d.id === childId);
    if (!childDept) return false;
    if (childDept.parent_id === ancestorId) return true;
    return isDescendantOf(childDept.parent_id, ancestorId);
  };

  const eligibleParents = departmentsList.filter(d => {
    if (!isEdit) return true;
    if (d.id === department.id) return false; // Cannot parent itself
    return !isDescendantOf(d.id, department.id); // Cannot parent its own children
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter department name.');
    
    setIsProcessing(true);
    try {
      const payload = {
        name: name.trim(),
        parent_id: parentId || null,
        manager_id: managerId || null,
        status
      };

      let res;
      if (isEdit) {
        res = await updateDepartment(department.id, payload);
      } else {
        res = await createDepartment(payload);
      }

      if (res.success) {
        toast.success(isEdit ? 'Department updated successfully!' : 'Department created successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm">{isEdit ? 'Edit Department' : 'Create Department'}</h3>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle text-base-content/50"><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Department Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Software Development..."
              className="input input-sm input-bordered w-full text-xs font-semibold"
            />
          </div>

          {/* Parent Department */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Parent Department</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="select select-sm select-bordered w-full text-xs font-semibold"
            >
              <option value="">(None - Root Department)</option>
              {eligibleParents.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Department Head */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Department Head (Manager)</label>
            <select
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
              disabled={isLoadingUsers}
              className="select select-sm select-bordered w-full text-xs font-semibold"
            >
              <option value="">(Unassigned)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="form-control">
            <label className="label text-xs font-semibold text-base-content/60">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="select select-sm select-bordered w-full text-xs font-semibold"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="modal-action gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
            <Button type="submit" variant="primary" size="sm" isLoading={isProcessing} disabled={isProcessing} className="shadow-md shadow-primary/10">
              <Save size={13} className="mr-1" /> Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
