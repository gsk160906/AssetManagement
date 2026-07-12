import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (s: string) => {
    switch (s.toUpperCase()) {
      case 'AVAILABLE': return 'badge-success text-success-content';
      case 'ALLOCATED': return 'badge-info text-info-content';
      case 'RESERVED': return 'badge-secondary text-secondary-content';
      case 'UNDER_MAINTENANCE': return 'badge-warning text-warning-content';
      case 'LOST': return 'badge-error text-error-content animate-pulse';
      case 'RETIRED': return 'badge-neutral text-neutral-content';
      case 'DISPOSED': return 'badge-outline opacity-60';
      default: return 'badge-ghost';
    }
  };

  return (
    <span className={`badge badge-sm font-bold tracking-wide uppercase px-2.5 py-1 ${getBadgeClass(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
export default StatusBadge;
