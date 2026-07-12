import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const EmptySessions: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-base-300 rounded-2xl bg-base-100/10 text-center">
      <div className="p-3 rounded-full bg-success/10 text-success mb-3">
        <ShieldCheck size={24} />
      </div>
      <h4 className="font-bold text-sm text-base-content">No other active sessions</h4>
      <p className="text-xs text-base-content/40 max-w-xs mt-1">
        You are not signed in on any other devices or browsers.
      </p>
    </div>
  );
};
export default EmptySessions;
