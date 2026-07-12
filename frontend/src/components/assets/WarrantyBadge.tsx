import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface WarrantyBadgeProps {
  expiryDate: string | null | Date;
}

export const WarrantyBadge: React.FC<WarrantyBadgeProps> = ({ expiryDate }) => {
  if (!expiryDate) {
    return (
      <span className="badge badge-sm badge-ghost text-base-content/40 font-semibold gap-1 py-1 px-2.5">
        <ShieldX size={12} />
        No Warranty
      </span>
    );
  }

  const exp = new Date(expiryDate);
  const now = new Date();
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="badge badge-sm badge-error text-error-content font-bold gap-1 py-1 px-2.5">
        <ShieldAlert size={12} />
        Expired
      </span>
    );
  }

  if (diffDays <= 30) {
    return (
      <span className="badge badge-sm badge-warning text-warning-content font-bold gap-1 py-1 px-2.5 animate-pulse">
        <ShieldAlert size={12} />
        {diffDays} Days Left
      </span>
    );
  }

  return (
    <span className="badge badge-sm badge-success text-success-content font-bold gap-1 py-1 px-2.5">
      <ShieldCheck size={12} />
      Active
    </span>
  );
};
export default WarrantyBadge;
