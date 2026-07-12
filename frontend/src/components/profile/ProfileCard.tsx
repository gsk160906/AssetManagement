import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Shield, HardDrive } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';
import type { UserProfile } from '../../types/profile';

interface ProfileCardProps {
  profile: UserProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6 text-center flex flex-col items-center">
      <ProfileAvatar url={profile.profile_image_url} name={profile.name} size="xl" />
      
      <h3 className="text-xl font-bold text-base-content mt-4 leading-tight">{profile.name}</h3>
      <p className="text-xs font-semibold text-primary mt-1 uppercase tracking-wider">{profile.role.replace('_', ' ')}</p>
      
      {profile.designation && (
        <p className="text-sm text-base-content/60 mt-1">{profile.designation}</p>
      )}

      {profile.department_name && (
        <span className="badge badge-outline mt-3 font-semibold text-xs px-3 py-2 border-base-300 text-base-content/70">
          {profile.department_name}
        </span>
      )}

      {profile.bio && (
        <p className="text-xs text-base-content/50 mt-4 px-4 line-clamp-3 italic">
          "{profile.bio}"
        </p>
      )}

      <div className="divider my-6 opacity-60"></div>

      <div className="w-full space-y-2">
        <Link 
          to="/profile/edit" 
          className="btn btn-ghost btn-sm w-full justify-start text-xs font-bold text-base-content/80 hover:text-base-content hover:bg-base-200/50 rounded-xl"
        >
          <User size={15} className="mr-3 text-primary" />
          Edit Profile Details
        </Link>
        <Link 
          to="/profile/preferences" 
          className="btn btn-ghost btn-sm w-full justify-start text-xs font-bold text-base-content/80 hover:text-base-content hover:bg-base-200/50 rounded-xl"
        >
          <Settings size={15} className="mr-3 text-secondary" />
          User Preferences
        </Link>
        <Link 
          to="/profile/security" 
          className="btn btn-ghost btn-sm w-full justify-start text-xs font-bold text-base-content/80 hover:text-base-content hover:bg-base-200/50 rounded-xl"
        >
          <Shield size={15} className="mr-3 text-error" />
          Account & Security
        </Link>
        <Link 
          to="/profile/sessions" 
          className="btn btn-ghost btn-sm w-full justify-start text-xs font-bold text-base-content/80 hover:text-base-content hover:bg-base-200/50 rounded-xl"
        >
          <HardDrive size={15} className="mr-3 text-info" />
          Manage Active Sessions
        </Link>
      </div>
    </div>
  );
};
export default ProfileCard;
