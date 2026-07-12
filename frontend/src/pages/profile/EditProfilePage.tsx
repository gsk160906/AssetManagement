import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { AvatarUploader } from '../../components/profile/AvatarUploader';
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton';
import { useProfile } from '../../hooks/useProfile';

export const EditProfilePage: React.FC = () => {
  const { profile, isLoading, error, updateProfile, uploadAvatar, deleteAvatar } = useProfile();

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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Profile" 
        subtitle="Modify your personal information and profile picture."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' }, 
          { label: 'Profile', path: '/profile' }, 
          { label: 'Edit' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Profile Photo" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6 text-center">
            <AvatarUploader 
              url={profile.profile_image_url} 
              name={profile.name} 
              onUpload={uploadAvatar} 
              onRemove={deleteAvatar} 
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Personal Information" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <ProfileForm profile={profile} onSave={updateProfile} />
          </Card>
        </div>
      </div>
    </div>
  );
};
export default EditProfilePage;
