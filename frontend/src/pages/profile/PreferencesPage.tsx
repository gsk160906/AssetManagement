import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ThemeSelector } from '../../components/profile/ThemeSelector';
import { LanguageSelector } from '../../components/profile/LanguageSelector';
import { TimezoneSelector } from '../../components/profile/TimezoneSelector';
import { PreferencesCard } from '../../components/profile/PreferencesCard';
import { usePreferences } from '../../hooks/usePreferences';
import { useProfile } from '../../hooks/useProfile';
import { Loader2, Layout, Sliders, Mail, Eye } from 'lucide-react';

export const PreferencesPage: React.FC = () => {
  const { preferences, isLoading: isPrefLoading, error: prefError, updatePreferences } = usePreferences();
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile();

  const isLoading = isPrefLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (prefError || !preferences) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-error font-semibold mb-4">{prefError || 'Failed to load user preferences.'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary rounded-xl text-xs">
          Retry Loading
        </button>
      </div>
    );
  }

  const handleToggle = async (key: keyof typeof preferences) => {
    try {
      await updatePreferences({ [key]: !preferences[key] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = async (key: keyof typeof preferences, value: any) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (err) {
      console.error(err);
    }
  };

  const categoriesOptions = [
    { key: 'maintenance_notifications', label: 'Maintenance Alerts', desc: 'Repairs, schedules, and overdue tasks', checked: preferences.maintenance_notifications },
    { key: 'booking_notifications', label: 'Resource Booking', desc: 'Approvals, cancellations, and reminders', checked: preferences.booking_notifications },
    { key: 'audit_notifications', label: 'Audit & Inventory', desc: 'Audit creation, progress, and mismatch alerts', checked: preferences.audit_notifications },
    { key: 'report_notifications', label: 'Export Reports', desc: 'Completion status for CSV and PDF reports', checked: preferences.report_notifications },
    { key: 'system_notifications', label: 'System & Security', desc: 'Security alerts, profile updates, and maintenance announcements', checked: preferences.system_notifications }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Preferences" 
        subtitle="Personalize your app theme, language, and notification channels."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' }, 
          { label: 'Profile', path: '/profile' }, 
          { label: 'Preferences' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Appearance and Localization */}
        <div className="space-y-6">
          <Card title="Appearance" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-bold text-base-content/70">Interface Theme</span>
                </label>
                <ThemeSelector 
                  value={preferences.theme} 
                  onChange={(val) => handleSelect('theme', val)} 
                />
              </div>

              <div className="form-control flex-row justify-between items-center py-2 border-t border-base-300/30">
                <div>
                  <h4 className="font-bold text-xs text-base-content">Compact Mode</h4>
                  <p className="text-[10px] text-base-content/40">Density optimized layout rows</p>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary toggle-sm" 
                  checked={preferences.compact_mode}
                  onChange={() => handleToggle('compact_mode')}
                />
              </div>
            </div>
          </Card>

          <Card title="Localization & Formats" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-bold text-base-content/70">Language</span>
                </label>
                <LanguageSelector 
                  value={profile?.language || 'English'} 
                  onChange={(val) => updateProfile({ language: val })} 
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-bold text-base-content/70">Timezone</span>
                </label>
                <TimezoneSelector 
                  value={profile?.timezone || 'UTC'} 
                  onChange={(val) => updateProfile({ timezone: val })} 
                />
              </div>
            </div>
          </Card>

          <Card title="Interface Presets" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-bold text-base-content/70">Default Landing View</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    <Layout size={15} />
                  </span>
                  <select
                    value={preferences.default_dashboard}
                    onChange={(e) => handleSelect('default_dashboard', e.target.value)}
                    className="select select-bordered w-full pl-10 rounded-xl text-sm select-sm"
                  >
                    <option value="dashboard">Dashboard Overview</option>
                    <option value="assets">Assets Inventory</option>
                    <option value="bookings">Resource Bookings</option>
                    <option value="reports">Operational Reports</option>
                    <option value="notifications">Notification Alerts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-bold text-base-content/70">Default Table Page Size</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    <Sliders size={15} />
                  </span>
                  <select
                    value={preferences.default_page_size}
                    onChange={(e) => handleSelect('default_page_size', parseInt(e.target.value, 10))}
                    className="select select-bordered w-full pl-10 rounded-xl text-sm select-sm"
                  >
                    <option value={10}>10 records</option>
                    <option value={20}>20 records</option>
                    <option value={50}>50 records</option>
                    <option value={100}>100 records</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Notification Preferences */}
        <div className="space-y-6">
          <Card title="Notification Channels" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-base-200 text-info">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-base-content">Email Notifications</h4>
                    <p className="text-[10px] text-base-content/40">Send digest updates via email</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary toggle-sm" 
                  checked={preferences.email_notifications}
                  onChange={() => handleToggle('email_notifications')}
                />
              </div>

              <div className="flex justify-between items-center py-2 border-t border-base-300/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-base-200 text-secondary">
                    <Eye size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-base-content">Browser Alerts</h4>
                    <p className="text-[10px] text-base-content/40">Show popups inside web dashboard</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary toggle-sm" 
                  checked={preferences.browser_notifications}
                  onChange={() => handleToggle('browser_notifications')}
                />
              </div>
            </div>
          </Card>

          <PreferencesCard 
            title="Notification Categories" 
            options={categoriesOptions} 
            onToggle={handleToggle} 
          />
        </div>
      </div>
    </div>
  );
};
export default PreferencesPage;
