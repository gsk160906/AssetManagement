import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { CalendarDays } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bookings & Reservations" 
        subtitle="Manage short-term reservations for conference rooms, vehicles, and shared devices."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Bookings' }]}
      />
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <CalendarDays size={40} />
          </div>
          <h3 className="text-lg font-bold text-base-content">Bookings Module</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-1 leading-relaxed">
            Reserve company vehicles, shared hardware, scheduling rooms, and handle conflict resolutions with calendar grids.
          </p>
        </div>
      </Card>
    </div>
  );
};
