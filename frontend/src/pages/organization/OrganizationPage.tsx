import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Building2, Users, Search, Plus, Trash2, Edit2, 
  CheckCircle, XCircle, ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { AddEditUserModal } from '../../components/profile/AddEditUserModal';

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  
  // Custom hook for users fetching, filtering, and paging
  const {
    users,
    isLoading,
    total,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    refetch,
    removeUser
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleEdit = (u: any) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (u: any) => {
    if (window.confirm(`Are you sure you want to delete user ${u.name}? This will revoke all active sessions.`)) {
      await removeUser(u.id);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const maps: Record<string, { label: string; cls: string }> = {
      ADMIN: { label: 'Administrator', cls: 'badge-error text-white font-semibold' },
      ASSET_MANAGER: { label: 'Asset Manager', cls: 'badge-warning font-semibold' },
      DEPARTMENT_HEAD: { label: 'Dept Head', cls: 'badge-info font-semibold' },
      EMPLOYEE: { label: 'Employee', cls: 'badge-neutral' }
    };
    const mapped = maps[roleName] || { label: roleName, cls: 'badge-neutral' };
    return <span className={`badge badge-sm ${mapped.cls}`}>{mapped.label}</span>;
  };

  const getStatusBadge = (statusName: string) => {
    return statusName === 'ACTIVE' ? (
      <span className="badge badge-sm badge-success gap-1 text-white font-semibold">
        <CheckCircle size={10} /> Active
      </span>
    ) : (
      <span className="badge badge-sm badge-ghost gap-1 text-base-content/40 font-semibold">
        <XCircle size={10} /> Inactive
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Setup" 
        subtitle="Manage company structures, departments, and employee accounts."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Organization' }]}
      />

      {/* Tabs Layout */}
      <div className="flex border-b border-base-300">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 text-sm transition-all ${
            activeTab === 'employees'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <Users size={16} />
          Employees ({total})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 text-sm transition-all ${
            activeTab === 'departments'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <Building2 size={16} />
          Departments
        </button>
      </div>

      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4 border border-base-300/60 shadow-sm bg-base-100/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Left filters */}
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, email, code..."
                    className="input input-bordered input-sm rounded-xl pl-9 w-full bg-base-100 border-base-300 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="absolute left-3 top-2.5 text-base-content/40">
                    <Search size={14} />
                  </div>
                </div>

                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setPage(1);
                  }}
                  className="select select-bordered select-sm rounded-xl bg-base-100 border-base-300 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="ASSET_MANAGER">Asset Managers</option>
                  <option value="DEPARTMENT_HEAD">Department Heads</option>
                  <option value="EMPLOYEE">Employees</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="select select-bordered select-sm rounded-xl bg-base-100 border-base-300 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Right Action */}
              {isAdmin && (
                <Button 
                  onClick={handleCreate} 
                  variant="primary" 
                  size="sm" 
                  className="w-full md:w-auto rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  Add Employee
                </Button>
              )}
            </div>
          </Card>

          {/* Table Card */}
          <Card className="overflow-hidden border border-base-300/70 shadow-md">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="loading loading-spinner text-primary loading-lg" />
                <span className="text-xs text-base-content/50 font-semibold">Retrieving employee roster...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-3.5 bg-base-200 rounded-full text-base-content/30 mb-3.5">
                  <Users size={32} />
                </div>
                <h3 className="font-bold text-base text-base-content">No Employees Found</h3>
                <p className="text-xs text-base-content/50 mt-1 max-w-sm">
                  Try adjusting your search criteria or add a new employee account to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50 border-b border-base-300">
                      <th className="text-xs font-bold text-base-content/60">Employee</th>
                      <th className="text-xs font-bold text-base-content/60">Email Address</th>
                      <th className="text-xs font-bold text-base-content/60">Department</th>
                      <th className="text-xs font-bold text-base-content/60">Role</th>
                      <th className="text-xs font-bold text-base-content/60">Status</th>
                      <th className="text-xs font-bold text-base-content/60 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-base-200/20 border-b border-base-300/40 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/10 to-secondary/10 text-primary font-bold text-xs uppercase flex items-center justify-center border border-primary/20">
                                {u.name.substring(0, 2)}
                              </div>
                            </div>
                            <div>
                              <span className="font-bold text-base-content text-sm block">{u.name}</span>
                              <span className="text-[10px] text-base-content/40 font-mono tracking-tight">{u.employee_code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm font-medium text-base-content/75">{u.email}</td>
                        <td>
                          {u.department_name ? (
                            <span className="badge badge-sm badge-outline text-base-content/70 border-base-300 rounded-lg">
                              {u.department_name}
                            </span>
                          ) : (
                            <span className="text-xs text-base-content/30 italic">No department</span>
                          )}
                        </td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>{getStatusBadge(u.status)}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleEdit(u)}
                                  className="btn btn-ghost btn-square btn-xs text-info hover:bg-info/10"
                                  title="Edit Employee"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(u)}
                                  className="btn btn-ghost btn-square btn-xs text-error hover:bg-error/10"
                                  title="Delete Employee"
                                  disabled={u.id === user?.id} // Prevent deleting yourself
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-base-300 bg-base-200/20 flex items-center justify-between">
                <span className="text-xs text-base-content/50 font-semibold">
                  Showing Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-outline btn-xs rounded-lg min-h-0 h-7 border-base-300 font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-outline btn-xs rounded-lg min-h-0 h-7 border-base-300 font-semibold flex items-center gap-1"
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'departments' && (
        <Card className="p-6 border border-base-300/70 shadow-md">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
              <Building2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-base-content">Department Directory</h3>
            <p className="text-xs text-base-content/50 max-w-sm mt-1 leading-relaxed">
              Create sub-departments, map hierarchies, assign managers, and manage department-level asset allocations.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/departments">
                <Button variant="primary" className="rounded-xl flex items-center justify-center gap-1">
                  Go to Departments Workspace
                  <ArrowUpRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Add / Edit Employee Modal */}
      <AddEditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
        userToEdit={selectedUser}
      />
    </div>
  );
};
export default OrganizationPage;
