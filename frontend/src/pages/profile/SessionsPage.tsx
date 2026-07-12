import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { SessionCard } from '../../components/profile/SessionCard';
import { EmptySessions } from '../../components/profile/EmptySessions';
import { useSessions } from '../../hooks/useSessions';

export const SessionsPage: React.FC = () => {
  const { 
    currentSession, 
    otherSessions, 
    isLoading, 
    terminateCurrentSession, 
    terminateSession, 
    terminateAllOtherSessions 
  } = useSessions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const handleRevokeAll = () => {
    if (window.confirm('Are you sure you want to log out from all other devices? This will invalidate all active sessions except the current one.')) {
      terminateAllOtherSessions();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Active Sessions" 
        subtitle="Manage the devices and browsers currently logged into your account."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' }, 
          { label: 'Profile', path: '/profile' }, 
          { label: 'Sessions' }
        ]}
      />

      <div className="space-y-6">
        {/* Current Session */}
        {currentSession && (
          <Card title="Current Session" className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
            <SessionCard 
              session={currentSession} 
              onTerminate={() => terminateCurrentSession()} 
            />
          </Card>
        )}

        {/* Other Sessions */}
        <Card 
          title="Other Active Sessions" 
          className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6"
          extra={
            otherSessions.length > 0 ? (
              <button
                onClick={handleRevokeAll}
                className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg flex items-center gap-1"
              >
                <Trash2 size={13} />
                Revoke All Others
              </button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {otherSessions.length === 0 ? (
              <EmptySessions />
            ) : (
              otherSessions.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onTerminate={terminateSession} 
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default SessionsPage;
