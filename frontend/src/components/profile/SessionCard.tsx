import React from 'react';
import { Monitor, Smartphone, Globe, LogOut, CheckCircle } from 'lucide-react';
import type { UserSession } from '../../types/profile';

interface SessionCardProps {
  session: UserSession;
  onTerminate: (id: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onTerminate }) => {
  const isMobile = session.device_name === 'Mobile';

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={`card p-5 border shadow-sm rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ${
      session.isCurrent 
        ? 'bg-primary/5 border-primary/40' 
        : 'bg-base-100/40 border-base-300/50'
    }`}>
      <div className="flex gap-4 items-start">
        <div className={`p-3 rounded-xl flex items-center justify-center ${
          session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/60'
        }`}>
          {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-base-content">
              {session.device_name || 'Unknown Device'} • {session.operating_system || 'Unknown OS'}
            </h4>
            {session.isCurrent && (
              <span className="badge badge-primary text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle size={10} />
                Current Session
              </span>
            )}
          </div>
          
          <p className="text-xs text-base-content/50 flex items-center gap-1.5">
            <Globe size={12} />
            {session.browser || 'Unknown Browser'} • IP: {session.ip_address || 'Unknown'}
          </p>
          
          <p className="text-[11px] text-base-content/40">
            Last active: {formatLastActive(session.last_activity)}
          </p>
        </div>
      </div>

      <div className="self-end md:self-center">
        {session.isCurrent ? (
          <button
            onClick={() => onTerminate(session.id)}
            className="btn btn-outline btn-error btn-xs rounded-lg flex items-center gap-1"
          >
            <LogOut size={12} />
            Log Out
          </button>
        ) : (
          <button
            onClick={() => onTerminate(session.id)}
            className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg flex items-center gap-1"
          >
            <LogOut size={12} />
            Revoke
          </button>
        )}
      </div>
    </div>
  );
};
export default SessionCard;
