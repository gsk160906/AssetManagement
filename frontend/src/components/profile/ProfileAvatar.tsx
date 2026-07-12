import React from 'react';

interface ProfileAvatarProps {
  url?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ url, name, size = 'md' }) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const initials = getInitials(name);

  if (url) {
    const isRelative = url.startsWith('/');
    const src = isRelative ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/../..${url}` : url;
    
    return (
      <div className="avatar">
        <div className={`${sizeClasses[size]} rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2 overflow-hidden transition-all duration-300 hover:ring-primary`}>
          <img src={src} alt={`${name} Avatar`} className="object-cover w-full h-full" />
        </div>
      </div>
    );
  }

  // Fallback with beautiful background gradient initials
  return (
    <div className="avatar placeholder">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-secondary text-primary-content ring ring-primary/30 ring-offset-base-100 ring-offset-2 font-bold uppercase tracking-wider`}>
        <span>{initials}</span>
      </div>
    </div>
  );
};
