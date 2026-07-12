import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  const name = user?.name || 'User';
  const email = user?.email || '';
  const role = user?.role || 'EMPLOYEE';
  const employeeCode = user?.employee_code || 'N/A';

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your account credentials and personal preferences."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Profile' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center flex flex-col items-center justify-center py-8">
          <div className="avatar mb-4">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile Avatar"
              />
            </div>
          </div>
          <h3 className="text-lg font-bold text-base-content">{name}</h3>
          <span className="badge badge-primary text-xs mt-1 font-semibold">{role}</span>
          <p className="text-sm text-base-content/50 mt-2 truncate w-full px-4">{email}</p>
        </Card>
        
        <Card title="Account Details" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Full Name</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{name}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Email Address</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{email}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">User Role</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{role}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Employee Code</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{employeeCode}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
