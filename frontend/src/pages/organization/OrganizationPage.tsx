import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Building2 } from 'lucide-react';

export const OrganizationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Setup" 
        subtitle="Manage company structures, departments, and employee hierarchies."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Organization' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Building2 size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Organization Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Configure branches, sub-organizations, assign managers, and manage organizational trees in future phases.
          </p>
        </div>
      </Card>
    </div>
  );
};
