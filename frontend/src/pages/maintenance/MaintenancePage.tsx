import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Wrench } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Maintenance & Repairs" 
        subtitle="Track resource downtime, scheduling inspections, and breakdown reports."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Maintenance' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Wrench size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Maintenance Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Submit repair tickets, dispatch technicians, schedule preventative maintenance, and record service histories.
          </p>
        </div>
      </Card>
    </div>
  );
};
