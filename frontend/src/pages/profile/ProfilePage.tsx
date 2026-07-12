import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';

export const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Admin User", "email": "admin@assetflow.com"}');

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
          <h3 className="text-lg font-bold text-base-content">{user.name}</h3>
          <span className="badge badge-primary text-xs mt-1 font-semibold">{user.role || 'ADMIN'}</span>
          <p className="text-sm text-base-content/50 mt-2 truncate w-full px-4">{user.email}</p>
        </Card>
        
        <Card title="Account Details" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Full Name</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{user.name}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Email Address</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{user.email}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">User Role</span>
              <span className="text-sm font-semibold text-base-content block mt-1">{user.role || 'ADMIN'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-base-content/40 uppercase block">Session Token Status</span>
              <span className="text-sm font-semibold text-success block mt-1">Active Mock JWT</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
