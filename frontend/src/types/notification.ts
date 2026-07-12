export type NotificationCategory =
  | 'ASSET'
  | 'MAINTENANCE'
  | 'BOOKING'
  | 'AUDIT'
  | 'REPORT'
  | 'SYSTEM'
  | 'SECURITY'
  | 'TRANSFER';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  is_read: boolean;
  is_deleted: boolean;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  maintenance_enabled: boolean;
  booking_enabled: boolean;
  audit_enabled: boolean;
  report_enabled: boolean;
  asset_enabled: boolean;
  system_enabled: boolean;
  email_enabled: boolean;
  browser_enabled: boolean;
}

export interface NotificationFilters {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: 'READ' | 'UNREAD';
  page: number;
  limit: number;
}
