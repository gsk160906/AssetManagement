import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ClipboardCheck } from 'lucide-react';

export const AuditsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Asset Audits" 
        subtitle="Schedule and reconcile physical assets with digital records."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Audits' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <ClipboardCheck size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Audits Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Create physical verification tasks, scan QR/RFID tags, view compliance scores, and generate audit reports.
          </p>
        </div>
      </Card>
    </div>
  );
};
