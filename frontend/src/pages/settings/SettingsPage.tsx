import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  User, 
  Settings, 
  Shield, 
  HardDrive, 
  Mail, 
  Globe, 
  Cpu, 
  Network
} from 'lucide-react';

export const SettingsPage: React.FC = () => {

  const settingsSections = [
    {
      title: 'Profile Settings',
      description: 'Update your personal details, biography, avatar image, and designation.',
      icon: <User size={22} />,
      color: 'bg-primary/10 text-primary border-primary/20',
      link: '/profile/edit',
      buttonText: 'Manage Profile'
    },
    {
      title: 'Application Preferences',
      description: 'Personalize themes (Light/Dark/System), page sizes, layout density, and languages.',
      icon: <Settings size={22} />,
      color: 'bg-secondary/10 text-secondary border-secondary/20',
      link: '/profile/preferences',
      buttonText: 'Edit Preferences'
    },
    {
      title: 'Security & Password',
      description: 'Update your account password, check strength rules, and configure security guidelines.',
      icon: <Shield size={22} />,
      color: 'bg-error/10 text-error border-error/20',
      link: '/profile/security',
      buttonText: 'Security Settings'
    },
    {
      title: 'Active Sessions',
      description: 'Monitor, inspect, and revoke active login sessions on other devices and browsers.',
      icon: <HardDrive size={22} />,
      color: 'bg-info/10 text-info border-info/20',
      link: '/profile/sessions',
      buttonText: 'Manage Sessions'
    }
  ];

  // Admin-only system integrations (read-only / mock management for premium experience)
  const systemIntegrations = [
    {
      title: 'SMTP Email Delivery',
      status: 'Active',
      description: 'SMTP mail gateway configured to smtp.assetflow.com on port 587.',
      icon: <Mail size={18} />
    },
    {
      title: 'LDAP Directory Service',
      status: 'Disabled',
      description: 'Active Directory / LDAP integration is not enabled in this instance.',
      icon: <Network size={18} />
    },
    {
      title: 'Global Localization',
      status: 'English (US)',
      description: 'Fallback language set to English, fallback timezone set to UTC.',
      icon: <Globe size={18} />
    },
    {
      title: 'API Version',
      status: 'v1.4.2',
      description: 'REST API core running in development mode with token-session mapping.',
      icon: <Cpu size={18} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure user preferences, security credentials, active sessions, and global integrations."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Settings' }]}
      />

      {/* User settings section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, idx) => (
          <div 
            key={idx} 
            className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="flex gap-4">
              <div className={`p-3 rounded-xl border flex items-center justify-center h-12 w-12 ${section.color}`}>
                {section.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-base-content">{section.title}</h3>
                <p className="text-xs text-base-content/50 leading-relaxed max-w-sm">
                  {section.description}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link 
                to={section.link} 
                className="btn btn-outline btn-primary btn-sm rounded-xl text-xs px-4"
              >
                {section.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="divider opacity-40 my-8"></div>

      {/* System Integration Settings (Visible generally, but highlights admin level metadata) */}
      <div className="space-y-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-base-content">Global Integrations</h2>
          <p className="text-xs text-base-content/45">System-level background services status information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemIntegrations.map((item, idx) => (
            <Card key={idx} className="bg-base-100/30 border border-base-300/40 p-4 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-base-200 text-base-content/60">
                  {item.icon}
                </div>
                <span className={`badge badge-sm font-bold scale-90 ${
                  item.status === 'Active' 
                    ? 'badge-success text-success-content' 
                    : item.status === 'Disabled' 
                    ? 'badge-ghost text-base-content/40' 
                    : 'badge-outline border-base-300 text-base-content/70'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-1 mt-4">
                <h4 className="font-bold text-xs text-base-content">{item.title}</h4>
                <p className="text-[10px] text-base-content/45 leading-normal">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
