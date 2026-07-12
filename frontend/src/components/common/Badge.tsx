import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  outline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  outline = false,
}) => {
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    neutral: 'badge-neutral text-white',
    success: 'badge-success text-white',
    warning: 'badge-warning text-white',
    error: 'badge-error text-white',
    info: 'badge-info text-white',
  };

  const sizeClasses = {
    sm: 'badge-sm py-2 text-xs',
    md: 'badge-md py-2.5 text-xs',
    lg: 'badge-lg py-3 text-sm',
  };

  const outlineClass = outline ? 'badge-outline' : '';

  return (
    <span className={`badge font-medium border ${variantClasses[variant]} ${sizeClasses[size]} ${outlineClass} ${className}`}>
      {children}
    </span>
  );
};
