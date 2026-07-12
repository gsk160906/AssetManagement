import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { BarChart3 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Analyze asset utilization, depreciation, and service logs."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <BarChart3 size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Reports Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Generate custom spreadsheets, track asset depreciation curves, analyze booking rates, and export PDF summaries.
          </p>
        </div>
      </Card>
    </div>
  );
};
