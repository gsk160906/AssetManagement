import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Package } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Assets Management" 
        subtitle="Manage and track company physical assets."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Assets' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4 shadow-inner">
            <Package size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Assets Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            This module will contain the asset inventory, lifecycle tracking, categories, serial numbers, and check-in/check-out tools in Phase 2.
          </p>
        </div>
      </Card>
    </div>
  );
};
