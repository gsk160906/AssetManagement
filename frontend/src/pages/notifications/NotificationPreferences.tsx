import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Package, 
  Settings, 
  Mail, 
  Bell,
  ShieldAlert
} from 'lucide-react';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { NotificationPreferenceCard } from '../../components/notifications/NotificationPreferenceCard';

export const NotificationPreferences: React.FC = () => {
  const { preferences, isLoading, error, updatePreference, refetch } = useNotificationPreferences();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notification Settings" 
        subtitle="Manage your alert delivery channels and event category subscriptions."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Settings', path: '/settings' },
          { label: 'Notifications' }
        ]}
      />

      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="alert alert-error text-xs rounded-xl flex items-center justify-between mb-4">
            <span>{error}</span>
            <button onClick={refetch} className="btn btn-xs btn-ghost text-white">Retry</button>
          </div>
        )}

        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-base-content/85">Notification Preferences</h3>
              <p className="text-xs text-base-content/40 mt-0.5">Control which updates you receive. Changes are saved automatically.</p>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full rounded-xl opacity-60" />
                ))}
              </div>
            ) : !preferences ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-base-content/40 space-y-3">
                <ShieldAlert size={28} />
                <span>Unable to load preferences rules. Please reload.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maintenance */}
                <NotificationPreferenceCard
                  label="Maintenance Updates"
                  description="Receive scheduled repairs and completion alerts."
                  icon={<Wrench size={16} />}
                  enabled={preferences.maintenance_enabled}
                  onChange={(val) => updatePreference('maintenance_enabled', val)}
                />

                {/* Bookings */}
                <NotificationPreferenceCard
                  label="Resource Bookings"
                  description="Notifications for approvals, rejections, and reminders."
                  icon={<Calendar size={16} />}
                  enabled={preferences.booking_enabled}
                  onChange={(val) => updatePreference('booking_enabled', val)}
                />

                {/* Audits */}
                <NotificationPreferenceCard
                  label="Inventory Audits"
                  description="Get alerts when assigned to verify active assets."
                  icon={<ClipboardCheck size={16} />}
                  enabled={preferences.audit_enabled}
                  onChange={(val) => updatePreference('audit_enabled', val)}
                />

                {/* Reports */}
                <NotificationPreferenceCard
                  label="Reports & Exports"
                  description="Notifies you when your PDF or CSV exports are ready."
                  icon={<FileText size={16} />}
                  enabled={preferences.report_enabled}
                  onChange={(val) => updatePreference('report_enabled', val)}
                />

                {/* Assets */}
                <NotificationPreferenceCard
                  label="Asset Allocations"
                  description="Alerts for new asset custody assignments or return dues."
                  icon={<Package size={16} />}
                  enabled={preferences.asset_enabled}
                  onChange={(val) => updatePreference('asset_enabled', val)}
                />

                {/* System */}
                <NotificationPreferenceCard
                  label="System & Security"
                  description="Crucial security, password resets, and account logs."
                  icon={<Settings size={16} />}
                  enabled={preferences.system_enabled}
                  onChange={(val) => updatePreference('system_enabled', val)}
                />

                <div className="col-span-1 md:col-span-2 my-2 border-t border-base-300/40 pt-4">
                  <h4 className="text-xs font-bold text-base-content/75 uppercase tracking-wide mb-1">Delivery Channels</h4>
                  <p className="text-[10px] text-base-content/40">Select where notifications are delivered.</p>
                </div>

                {/* Email Channel */}
                <NotificationPreferenceCard
                  label="Email Delivery"
                  description="Send a digest of pending items directly to your inbox."
                  icon={<Mail size={16} />}
                  enabled={preferences.email_enabled}
                  onChange={(val) => updatePreference('email_enabled', val)}
                />

                {/* Browser alerts */}
                <NotificationPreferenceCard
                  label="Browser Alerts"
                  description="Show real-time toast popups inside your active browser."
                  icon={<Bell size={16} />}
                  enabled={preferences.browser_enabled}
                  onChange={(val) => updatePreference('browser_enabled', val)}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default NotificationPreferences;
