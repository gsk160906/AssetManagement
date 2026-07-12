import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Building2, Users, Package, ShieldAlert, User, Mail, Shield
} from 'lucide-react';
import {
  getDepartmentById, getDepartmentEmployees, getDepartmentAssets, getDepartmentTree
} from '../../services/departmentService';

export const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dept, setDept] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'assets' | 'children'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [deptRes, empRes, astRes, treeRes] = await Promise.all([
        getDepartmentById(id),
        getDepartmentEmployees(id).catch(() => ({ success: false, data: { employees: [] } })),
        getDepartmentAssets(id).catch(() => ({ success: false, data: { assets: [] } })),
        getDepartmentTree().catch(() => ({ success: false, data: { tree: [] } }))
      ]);

      if (deptRes.success) setDept(deptRes.data.department);
      if (empRes.success) setEmployees(empRes.data.employees ?? []);
      if (astRes.success) setAssets(astRes.data.assets ?? []);
      
      // Filter child departments from hierarchy
      if (treeRes.success && treeRes.data?.tree) {
        const subDepts = treeRes.data.tree.filter((n: any) => n.parent_id === id);
        setChildren(subDepts);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load department details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !dept) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="p-4 bg-error/10 text-error rounded-2xl"><ShieldAlert size={40} /></div>
        <h2 className="text-lg font-bold text-base-content">{error || 'Department not found.'}</h2>
        <Link to="/departments" className="btn btn-primary btn-sm normal-case font-semibold text-xs">
          <ArrowLeft size={14} className="mr-1" /> Back to Departments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title={dept.name}
        subtitle={`Department Profile Overview`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Departments', path: '/departments' },
          { label: dept.name }
        ]}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/departments')}>
            <ArrowLeft size={13} className="mr-1" /> Back
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-base-300/40 gap-1.5 p-1 bg-base-200/30 rounded-xl max-w-md">
        {(['overview', 'employees', 'assets', 'children'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow btn btn-xs rounded-lg normal-case font-semibold ${activeTab === tab ? 'btn-primary text-white' : 'btn-ghost text-base-content/60'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <Card title="Department Info" className="md:col-span-2">
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-base-300/10">
                <span className="text-base-content/50">Department Name</span>
                <span className="font-bold text-base-content/85">{dept.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-base-300/10">
                <span className="text-base-content/50">Parent Department</span>
                <span className="font-semibold text-base-content/75">{dept.parent_name ?? 'None (Root Node)'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-base-300/10">
                <span className="text-base-content/50">Current Head/Manager</span>
                <span className="font-semibold text-base-content/75 flex items-center gap-1">
                  <User size={12} className="text-primary" /> {dept.manager_name ?? 'Unassigned'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-base-300/10">
                <span className="text-base-content/50">Status</span>
                <span className={`badge badge-xs font-bold uppercase ${dept.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>
                  {dept.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="text-base-content/50">Created Date</span>
                <span>{new Date(dept.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <div className="space-y-4">
            <div className="card bg-base-100/40 border border-base-300/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl"><Users size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase">Active Employees</span>
                <p className="text-xl font-extrabold text-base-content mt-0.5">{employees.length}</p>
              </div>
            </div>
            <div className="card bg-base-100/40 border border-base-300/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-success/10 text-success rounded-xl"><Package size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase">Assigned Assets</span>
                <p className="text-xl font-extrabold text-base-content mt-0.5">{assets.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <Card title="Department Members">
          <div className="overflow-x-auto w-full">
            {employees.length === 0 ? (
              <div className="text-center py-12 text-xs text-base-content/30 italic">No employees belong to this department.</div>
            ) : (
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td>
                        <span className="font-bold text-base-content/85">{emp.name}</span>
                      </td>
                      <td className="text-base-content/60 flex items-center gap-1"><Mail size={11} /> {emp.email}</td>
                      <td>
                        <span className="font-semibold text-primary flex items-center gap-1"><Shield size={11} /> {emp.role}</span>
                      </td>
                      <td>
                        <span className={`badge badge-sm font-bold ${emp.status === 'ACTIVE' ? 'badge-success text-success-content' : 'badge-ghost'}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'assets' && (
        <Card title="Department Assets">
          <div className="overflow-x-auto w-full">
            {assets.length === 0 ? (
              <div className="text-center py-12 text-xs text-base-content/30 italic">No assets assigned to this department.</div>
            ) : (
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                    <th>Asset</th>
                    <th>Serial Number</th>
                    <th>Location</th>
                    <th>Acquisition Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(ast => (
                    <tr key={ast.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td>
                        <span className="font-bold text-base-content/85">{ast.name}</span>
                        <div className="font-mono text-[9px] text-primary">{ast.asset_tag}</div>
                      </td>
                      <td className="text-base-content/60 font-mono">{ast.serial_number}</td>
                      <td className="text-base-content/60">{ast.current_location || '—'}</td>
                      <td className="font-semibold text-base-content/75">${parseFloat(ast.acquisition_cost || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold uppercase ${
                          ast.status === 'AVAILABLE' ? 'badge-success text-success-content' :
                          ast.status === 'ALLOCATED' ? 'badge-info text-info-content' : 'badge-warning text-warning-content'
                        }`}>{ast.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'children' && (
        <Card title="Direct Child Departments">
          <div className="overflow-x-auto w-full">
            {children.length === 0 ? (
              <div className="text-center py-12 text-xs text-base-content/30 italic">No sub-departments belong directly to this department.</div>
            ) : (
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                    <th>Department Name</th>
                    <th>Manager Name</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map(child => (
                    <tr key={child.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td className="font-bold text-base-content/85 flex items-center gap-1.5"><Building2 size={13} className="text-primary/70" /> {child.name}</td>
                      <td className="text-base-content/60 font-semibold">{child.manager_name || '—'}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${child.status === 'ACTIVE' ? 'badge-success text-success-content' : 'badge-ghost'}`}>
                          {child.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link to={`/departments/${child.id}`} className="btn btn-ghost btn-xs text-primary font-semibold normal-case px-2">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DepartmentDetails;
