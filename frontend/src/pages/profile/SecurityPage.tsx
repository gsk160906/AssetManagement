import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Smartphone, AlertOctagon } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ChangePasswordModal } from '../../components/profile/ChangePasswordModal';
import { useSessions } from '../../hooks/useSessions';

export const SecurityPage: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { otherSessions } = useSessions();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Account Security" 
        subtitle="Manage your credentials, password strength, and active logins."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' }, 
          { label: 'Profile', path: '/profile' }, 
          { label: 'Security' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Login Credentials" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-base-content">Password</h4>
                <p className="text-xs text-base-content/50">
                  Last updated: Checked during password change.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="btn btn-outline btn-primary btn-sm rounded-xl text-xs flex items-center gap-2"
              >
                <KeyRound size={14} />
                Change Password
              </button>
            </div>
          </Card>

          <Card title="Security Guidelines" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex gap-3 items-start text-xs">
                <div className="p-2 rounded-lg bg-base-200 text-primary mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-base-content">Strong Passwords Required</h5>
                  <p className="text-base-content/50 mt-1 leading-relaxed">
                    Passwords must contain at least 8 characters, and include uppercase, lowercase, numbers, and special characters. Avoid reusing old passwords.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs">
                <div className="p-2 rounded-lg bg-base-200 text-secondary mt-0.5">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-base-content">Active Session Monitoring</h5>
                  <p className="text-base-content/50 mt-1 leading-relaxed">
                    Track the devices that are currently logged in to your account. If you spot an unrecognized session, terminate it immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs">
                <div className="p-2 rounded-lg bg-base-200 text-error mt-0.5">
                  <AlertOctagon size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-base-content">Security Incidents</h5>
                  <p className="text-base-content/50 mt-1 leading-relaxed">
                    If you suspect unauthorized access to your account, change your password immediately and contact your system administrator.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card title="Security Status" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6 text-center">
            <div className="radial-progress text-primary mx-auto mb-4" style={{ "--value": 100, "--size": "6rem" } as React.CSSProperties} role="progressbar">
              100%
            </div>
            <h4 className="font-bold text-sm text-base-content">Account is secure</h4>
            <p className="text-xs text-base-content/40 mt-1">
              Active sessions: {otherSessions.length + 1}
            </p>
          </Card>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};
export default SecurityPage;
