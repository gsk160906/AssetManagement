import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  SlidersHorizontal 
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import { NotificationEmpty } from '../../components/notifications/NotificationEmpty';
import { NotificationSkeleton } from '../../components/notifications/NotificationSkeleton';
import { NotificationFilters } from '../../components/notifications/NotificationFilters';
import { NotificationSearch } from '../../components/notifications/NotificationSearch';
import { NotificationTabs } from '../../components/notifications/NotificationTabs';
import { NotificationPagination } from '../../components/notifications/NotificationPagination';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    total,
    unreadCount,
    isLoading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    refetch,
    markRead,
    markUnread,
    markAllRead,
    deleteNotification,
    deleteReadNotifications,
    setPage,
    setLimit,
    setCategory,
    setPriority,
    setStatus
  } = useNotifications({ limit: 10 });

  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleTabChange = (tab: 'ALL' | 'UNREAD' | 'READ') => {
    setActiveTab(tab);
    if (tab === 'ALL') setStatus(undefined);
    else if (tab === 'UNREAD') setStatus('UNREAD');
    else if (tab === 'READ') setStatus('READ');
  };

  const handleResetFilters = () => {
    setCategory(undefined);
    setPriority(undefined);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader 
          title="Notification Center" 
          subtitle="Track, filter, and manage your system and transactional alerts."
          breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Notifications' }]}
        />
        
        {/* Bulk Toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead} 
            disabled={unreadCount === 0 || isLoading}
            className="btn btn-xs btn-outline btn-primary rounded-xl font-bold uppercase text-[9px] gap-1 py-2"
          >
            <CheckCheck size={12} /> Mark All Read
          </button>
          <button 
            onClick={deleteReadNotifications}
            disabled={isLoading}
            className="btn btn-xs btn-outline btn-error rounded-xl font-bold uppercase text-[9px] gap-1 py-2"
          >
            <Trash2 size={12} /> Clear Read
          </button>
          <button 
            onClick={refetch} 
            disabled={isLoading}
            className="btn btn-xs btn-outline rounded-xl font-bold uppercase text-[9px] gap-1 py-2"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Search, Tabs, List */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search box */}
                <div className="flex-1">
                  <NotificationSearch value={searchQuery} onChange={setSearchQuery} />
                </div>
                
                {/* Tabs */}
                <div className="shrink-0">
                  <NotificationTabs 
                    activeTab={activeTab} 
                    onChange={handleTabChange} 
                    unreadCount={unreadCount} 
                  />
                </div>

                {/* Mobile Filters Trigger */}
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="btn btn-sm btn-bordered rounded-xl lg:hidden gap-1.5 text-xs text-base-content/75 font-semibold"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>

              {/* Mobile Filters Panel */}
              {showMobileFilters && (
                <div className="lg:hidden border-t border-base-300/35 pt-4">
                  <NotificationFilters
                    category={filters.category}
                    priority={filters.priority}
                    limit={filters.limit}
                    onCategoryChange={setCategory}
                    onPriorityChange={setPriority}
                    onLimitChange={setLimit}
                    onReset={handleResetFilters}
                  />
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="alert alert-error text-xs rounded-xl flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={refetch} className="btn btn-xs btn-ghost text-white">Retry</button>
                </div>
              )}

              {/* List */}
              {isLoading ? (
                <NotificationSkeleton />
              ) : notifications.length === 0 ? (
                <NotificationEmpty 
                  title={searchQuery ? 'No Results Found' : 'All Caught Up!'}
                  message={searchQuery ? 'Try clearing or modifying your search query.' : 'You have no new alerts in this section.'}
                />
              ) : (
                <div className="space-y-3">
                  {notifications.map((note) => (
                    <NotificationCard
                      key={note.id}
                      notification={note}
                      onMarkRead={markRead}
                      onMarkUnread={markUnread}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && (
                <NotificationPagination
                  page={filters.page}
                  limit={filters.limit}
                  total={total}
                  onPageChange={setPage}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <NotificationFilters
            category={filters.category}
            priority={filters.priority}
            limit={filters.limit}
            onCategoryChange={setCategory}
            onPriorityChange={setPriority}
            onLimitChange={setLimit}
            onReset={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;
