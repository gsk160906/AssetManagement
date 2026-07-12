import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { UserCheck } from 'lucide-react';

export const AllocationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Asset Allocation" 
        subtitle="Track asset custody, handovers, and assignment histories."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Allocation' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <UserCheck size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Allocation Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Assign resources to departments or users, generate handover slips, and monitor asset custody limits.
          </p>
        </div>
      </Card>
    </div>
  );
};
