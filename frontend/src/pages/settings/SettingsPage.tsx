import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        subtitle="Manage configurations, system preferences, and theme options."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Settings' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Settings size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">System Settings</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Configure system themes, email notification rules, LDAP integrations, and localized settings.
          </p>
        </div>
      </Card>
    </div>
  );
};
