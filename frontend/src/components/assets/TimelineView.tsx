import React, { useState, useEffect } from 'react';
import { Clock, Plus, Key, ArrowLeftRight, Wrench, RefreshCw, Undo2 } from 'lucide-react';
import { getAssetTimeline } from '../../services/assetService';

interface TimelineEvent {
  event_date: string;
  event_type: string;
  description: string;
  user_name: string | null;
}

interface TimelineViewProps {
  assetId: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ assetId }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAssetTimeline(assetId);
      if (res.success) {
        setTimeline(res.data);
      } else {
        setError('Failed to load asset timeline');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching timeline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [assetId]);

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CREATED': return <Plus size={12} className="text-success" />;
      case 'ALLOCATED': return <Key size={12} className="text-info" />;
      case 'RETURNED': return <Undo2 size={12} className="text-primary" />;
      case 'TRANSFER_REQUEST':
      case 'TRANSFERRED': return <ArrowLeftRight size={12} className="text-secondary" />;
      case 'MAINTENANCE_CREATED':
      case 'MAINTENANCE_RESOLVED': return <Wrench size={12} className="text-warning" />;
      default: return <Clock size={12} className="text-ghost" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CREATED': return 'bg-success/10 border-success/30';
      case 'ALLOCATED': return 'bg-info/10 border-info/30';
      case 'RETURNED': return 'bg-primary/10 border-primary/30';
      case 'TRANSFER_REQUEST':
      case 'TRANSFERRED': return 'bg-secondary/10 border-secondary/30';
      case 'MAINTENANCE_CREATED':
      case 'MAINTENANCE_RESOLVED': return 'bg-warning/10 border-warning/30';
      default: return 'bg-base-200 border-base-300';
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col min-h-[350px]">
      <div className="w-full pb-2 border-b border-base-300/30 flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
          <Clock size={14} className="text-primary" />
          Asset Lifecycle Timeline
        </h3>
        <button onClick={fetchTimeline} className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content">
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[380px] pr-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="loading loading-spinner text-primary"></div>
          </div>
        ) : error ? (
          <div className="text-xs text-error font-semibold text-center mt-8">{error}</div>
        ) : timeline.length === 0 ? (
          <div className="text-xs text-base-content/40 text-center mt-12">No audit events logged for this asset</div>
        ) : (
          <div className="relative pl-6 border-l border-base-300/60 ml-2.5 space-y-5 py-2">
            {timeline.map((evt, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[32px] top-0 p-1.5 rounded-full border ${getIconBg(evt.event_type)} flex items-center justify-center bg-base-100 z-10`}>
                  {getIcon(evt.event_type)}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-base-content/40">{formatDate(evt.event_date)}</span>
                  <h4 className="font-bold text-xs text-base-content/85">{evt.event_type.replace('_', ' ')}</h4>
                  <p className="text-[11px] text-base-content/65">{evt.description}</p>
                  {evt.user_name && (
                    <span className="text-[9px] font-semibold text-primary/75">By: {evt.user_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default TimelineView;
