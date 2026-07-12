import React, { useState } from 'react';
import { 
  Layers, CheckCircle, UserCheck, Wrench, Bookmark, Archive, Trash2, Users, 
  Building2, ArrowLeftRight, AlertCircle, BellRing 
} from 'lucide-react';

import { 
  useDashboardOverview, 
  useDashboardCharts, 
  useDashboardActivities, 
  useDashboardBookings, 
  useDashboardMaintenance, 
  useDashboardNotifications 
} from '../../hooks/useDashboard';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCards/StatCard';
import QuickActions from '../../components/dashboard/QuickActions/QuickActions';
import AssetStatusChart from '../../components/dashboard/Charts/AssetStatusChart';
import DepartmentChart from '../../components/dashboard/Charts/DepartmentChart';
import CategoryChart from '../../components/dashboard/Charts/CategoryChart';
import MaintenanceChart from '../../components/dashboard/Charts/MaintenanceChart';
import RecentActivities from '../../components/dashboard/Tables/RecentActivities';
import BookingsTable from '../../components/dashboard/Tables/BookingsTable';
import MaintenanceOverview from '../../components/dashboard/MaintenanceOverview';
import NotificationsPanel from '../../components/dashboard/Notifications/NotificationsPanel';
import DashboardSkeleton from '../../components/dashboard/Skeletons/DashboardSkeleton';

const SectionError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-error/5 border border-error/20 rounded-2xl h-full text-center min-h-[150px]">
    <p className="text-xs font-semibold text-error mb-2">{message}</p>
    <button onClick={onRetry} className="btn btn-xs btn-error btn-outline rounded-lg">
      Retry
    </button>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  // Hook integrations
  const overview = useDashboardOverview();
  const charts = useDashboardCharts();
  const activities = useDashboardActivities(activitiesPage, 10, range);
  const bookings = useDashboardBookings(bookingsPage, 5);
  const maintenance = useDashboardMaintenance();
  const notifications = useDashboardNotifications(1, 5);

  const handleRefreshAll = () => {
    overview.refresh();
    charts.refresh();
    activities.refresh();
    bookings.refresh();
    maintenance.refresh();
    notifications.refresh();
  };

  const isPageLoading = 
    overview.isLoading && 
    charts.isLoading && 
    activities.isLoading && 
    bookings.isLoading && 
    maintenance.isLoading && 
    notifications.isLoading;

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          range={range} 
          onRangeChange={setRange} 
          onRefresh={handleRefreshAll} 
          isRefreshing={true} 
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        range={range} 
        onRangeChange={(newRange) => {
          setRange(newRange);
          setActivitiesPage(1); // Reset page on filter shift
        }} 
        onRefresh={handleRefreshAll} 
        isRefreshing={overview.isLoading || charts.isLoading} 
      />

      {/* Overview Cards Block */}
      {overview.error ? (
        <SectionError message={overview.error} onRetry={overview.refresh} />
      ) : overview.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-base-100/30 rounded-2xl p-5 h-24 border border-base-300/40"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Assets" 
            count={overview.data?.totalAssets ?? 0} 
            icon={<Layers size={20} />} 
            colorClass="primary" 
          />
          <StatCard 
            title="Available" 
            count={overview.data?.availableAssets ?? 0} 
            icon={<CheckCircle size={20} />} 
            colorClass="success" 
          />
          <StatCard 
            title="Allocated" 
            count={overview.data?.allocatedAssets ?? 0} 
            icon={<UserCheck size={20} />} 
            colorClass="info" 
          />
          <StatCard 
            title="Under Maintenance" 
            count={overview.data?.underMaintenanceAssets ?? 0} 
            icon={<Wrench size={20} />} 
            colorClass="warning" 
          />
          <StatCard 
            title="Reserved" 
            count={overview.data?.reservedAssets ?? 0} 
            icon={<Bookmark size={20} />} 
            colorClass="secondary" 
          />
          <StatCard 
            title="Retired" 
            count={overview.data?.retiredAssets ?? 0} 
            icon={<Archive size={20} />} 
            colorClass="accent" 
          />
          <StatCard 
            title="Disposed" 
            count={overview.data?.disposedAssets ?? 0} 
            icon={<Trash2 size={20} />} 
            colorClass="error" 
          />
          <StatCard 
            title="Total Employees" 
            count={overview.data?.totalEmployees ?? 0} 
            icon={<Users size={20} />} 
            colorClass="primary" 
          />
          <StatCard 
            title="Departments" 
            count={overview.data?.totalDepartments ?? 0} 
            icon={<Building2 size={20} />} 
            colorClass="secondary" 
          />
          <StatCard 
            title="Pending Transfers" 
            count={overview.data?.pendingTransfers ?? 0} 
            icon={<ArrowLeftRight size={20} />} 
            colorClass="accent" 
          />
          <StatCard 
            title="Pending Maintenance" 
            count={overview.data?.pendingMaintenance ?? 0} 
            icon={<AlertCircle size={20} />} 
            colorClass="warning" 
          />
          <StatCard 
            title="Unread Alerts" 
            count={overview.data?.unreadNotifications ?? 0} 
            icon={<BellRing size={20} />} 
            colorClass="error" 
          />
        </div>
      )}

      {/* Navigational Quick Actions */}
      <QuickActions />

      {/* Recharts Analytics Grid */}
      {charts.error ? (
        <SectionError message={charts.error} onRetry={charts.refresh} />
      ) : charts.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-base-100/30 rounded-2xl h-[320px] border border-base-300/40"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AssetStatusChart data={charts.data?.assetStatus ?? []} />
          </div>
          <div className="lg:col-span-1">
            <DepartmentChart data={charts.data?.departmentAssets ?? []} />
          </div>
          <div className="lg:col-span-1">
            <CategoryChart data={charts.data?.categoryAssets ?? []} />
          </div>
          <div className="lg:col-span-1">
            <MaintenanceChart data={charts.data?.maintenanceTrend ?? []} />
          </div>
        </div>
      )}

      {/* Activity Streams & Schedulers Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activities.error ? (
            <SectionError message={activities.error} onRetry={activities.refresh} />
          ) : (
            <RecentActivities 
              activities={activities.data ?? []} 
              page={activitiesPage} 
              onPageChange={setActivitiesPage} 
              isLoading={activities.isLoading} 
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {notifications.error ? (
            <SectionError message={notifications.error} onRetry={notifications.refresh} />
          ) : (
            <NotificationsPanel 
              notifications={notifications.data?.latest ?? []} 
              count={notifications.data?.count ?? 0} 
              onRefresh={notifications.refresh} 
              isLoading={notifications.isLoading} 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {bookings.error ? (
            <SectionError message={bookings.error} onRetry={bookings.refresh} />
          ) : (
            <BookingsTable 
              bookings={bookings.data ?? []} 
              page={bookingsPage} 
              onPageChange={setBookingsPage} 
              isLoading={bookings.isLoading} 
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {maintenance.error ? (
            <SectionError message={maintenance.error} onRetry={maintenance.refresh} />
          ) : (
            <MaintenanceOverview summary={maintenance.data} />
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
