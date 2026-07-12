import React from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton';
import { useProfile } from '../../hooks/useProfile';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-error font-semibold mb-4">{error || 'Failed to load profile details.'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary rounded-xl text-xs">
          Retry Loading
        </button>
      </div>
    );
  }

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your identity, settings, and active sessions."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Profile' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Account Overview" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">First Name</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.first_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Last Name</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.last_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.phone_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Department</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.department_name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Designation</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.designation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Timezone</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.timezone}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">Language</span>
                <span className="text-sm font-semibold text-base-content block mt-1.5">{profile.language}</span>
              </div>
            </div>
          </Card>

          <Card title="Activity & System Audit" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-base-200 text-base-content/60">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Account Created</p>
                  <p className="text-xs font-semibold text-base-content mt-0.5">{formatTimestamp(profile.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-base-200 text-base-content/60">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Last Profile Update</p>
                  <p className="text-xs font-semibold text-base-content mt-0.5">{formatTimestamp(profile.last_profile_update)}</p>
                </div>
              </div>
              {profile.bio && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-base-200 text-base-content/60 mt-0.5">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Biography</p>
                    <p className="text-xs text-base-content/70 mt-1 leading-relaxed">{profile.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
