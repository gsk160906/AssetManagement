import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Bell } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notifications Center" 
        subtitle="Manage and view system notifications, reminders, and alerts."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Notifications' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Bell size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Notifications Center</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Read alerts, check approval requests, filter notifications, and mark messages as read.
          </p>
        </div>
      </Card>
    </div>
  );
};
