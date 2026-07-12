import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Building2, Users, Package, ShieldAlert, Search, Plus, List, Network,
  RefreshCw, Trash2, Edit2, Eye
} from 'lucide-react';
import { useDepartments } from '../../hooks/useDepartments';
import { getDepartmentTree, deleteDepartment } from '../../services/departmentService';
import { DepartmentFormModal } from './DepartmentFormModal';
import { DepartmentTree } from './DepartmentTree';
import { useAuth } from '../../contexts/AuthContext';

const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({
  label, value, color, icon
}) => (
  <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-base-content/40 uppercase">{label}</p>
      <p className="text-xl font-extrabold text-base-content">{value}</p>
    </div>
  </div>
);

export const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    departments, isLoading, searchQuery, setSearchQuery,
    statusFilter, setStatusFilter, refetch
  } = useDepartments();

  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);

  // Load Tree hierarchy data
  const loadTree = async () => {
    setIsLoadingTree(true);
    try {
      const res = await getDepartmentTree();
      if (res.success) {
        setTreeData(res.data.tree ?? []);
      }
    } catch {
      toast.error('Failed to load tree structure.');
    } finally {
      setIsLoadingTree(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'tree') {
      loadTree();
    }
  }, [viewMode]);

  const handleEdit = (dept: any) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" department?`)) return;
    try {
      const res = await deleteDepartment(id);
      if (res.success) {
        toast.success('Department deleted successfully.');
        refetch();
        if (viewMode === 'tree') loadTree();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const totalEmployees = departments.reduce((sum, d) => sum + parseInt(d.employee_count || 0, 10), 0);
  const totalAssets = departments.reduce((sum, d) => sum + parseInt(d.asset_count || 0, 10), 0);
  const totalHeads = departments.filter(d => d.manager_id).length;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Department Management"
        subtitle="Manage department heads, parent-child hierarchies, and track dynamic allocations."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Departments' }]}
        action={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus size={13} className="mr-1" /> Add Department
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Departments" value={departments.length} color="bg-primary/10 text-primary" icon={<Building2 size={16} />} />
        <StatCard label="Total Employees" value={totalEmployees} color="bg-success/10 text-success" icon={<Users size={16} />} />
        <StatCard label="Assigned Assets" value={totalAssets} color="bg-info/10 text-info" icon={<Package size={16} />} />
        <StatCard label="Department Heads" value={totalHeads} color="bg-warning/10 text-warning" icon={<ShieldAlert size={16} />} />
      </div>

      {/* Controls: Search & Toggle View Mode */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="join border border-base-300/50 p-0.5 rounded-xl bg-base-200/40">
            <button
              onClick={() => setViewMode('list')}
              className={`join-item btn btn-xs px-3 normal-case border-0 rounded-lg ${viewMode === 'list' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content/65'}`}
            >
              <List size={12} className="mr-1" /> List View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`join-item btn btn-xs px-3 normal-case border-0 rounded-lg ${viewMode === 'tree' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content/65'}`}
            >
              <Network size={12} className="mr-1" /> Tree View
            </button>
          </div>
          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select select-xs select-bordered text-xs rounded-xl font-medium"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          )}
        </div>

        {viewMode === 'list' && (
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search department, head..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-xs input-bordered text-xs rounded-xl w-full pl-8"
            />
            <Search size={12} className="absolute left-2.5 top-2.5 text-base-content/40" />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <Card>
          <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
            <span className="text-[10px] font-bold text-base-content/40 uppercase">{departments.length} departments found</span>
            <button onClick={refetch} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
                ))}
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-12 text-xs text-base-content/30 italic">No departments matches query.</div>
            ) : (
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                    <th>Department</th>
                    <th>Manager (Head)</th>
                    <th>Parent Dept</th>
                    <th>Employees Count</th>
                    <th>Assets Allocated</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td>
                        <button
                          onClick={() => navigate(`/departments/${dept.id}`)}
                          className="font-bold text-base-content hover:text-primary transition-colors text-left font-sans"
                        >
                          {dept.name}
                        </button>
                      </td>
                      <td className="text-base-content/70 font-semibold">{dept.manager_name ?? '—'}</td>
                      <td className="text-base-content/50 font-semibold">{dept.parent_name ?? '—'}</td>
                      <td className="font-bold">{dept.employee_count}</td>
                      <td className="font-bold text-primary">{dept.asset_count}</td>
                      <td>
                        <span className={`badge badge-sm font-bold uppercase ${dept.status === 'ACTIVE' ? 'badge-success text-success-content' : 'badge-ghost text-base-content/45'}`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/departments/${dept.id}`)}
                            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(dept)}
                                className="btn btn-ghost btn-xs btn-circle text-primary"
                                title="Edit Department"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(dept.id, dept.name)}
                                className="btn btn-ghost btn-xs btn-circle text-error"
                                title="Delete Department"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      ) : (
        /* Hierarchy Tree View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoadingTree ? (
              <div className="skeleton h-64 w-full rounded-2xl" />
            ) : (
              <DepartmentTree treeData={treeData} onSelect={(node) => navigate(`/departments/${node.id}`)} />
            )}
          </div>
          <div className="card bg-base-100/40 border border-base-300/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/40">Tree Navigation Tips</h4>
            <p className="text-xs text-base-content/50 leading-relaxed">
              Expand or collapse child organizational tiers using the chevron control buttons. Click on any department node title to open its detail page.
            </p>
          </div>
        </div>
      )}

      {/* Form Dialog Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
          if (viewMode === 'tree') loadTree();
        }}
        department={selectedDept}
        departmentsList={departments}
      />
    </div>
  );
};

export default DepartmentsPage;
