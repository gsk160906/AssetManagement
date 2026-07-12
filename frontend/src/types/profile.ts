export interface UserProfile {
  id: string;
  employee_code: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  status: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  designation: string | null;
  profile_image_url: string | null;
  bio: string | null;
  timezone: string;
  language: string;
  date_format: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  last_profile_update: string;
  created_at: string;
  updated_at: string;
  department_id: string | null;
  department_name: string | null;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_dashboard: string;
  default_page_size: number;
  email_notifications: boolean;
  browser_notifications: boolean;
  maintenance_notifications: boolean;
  booking_notifications: boolean;
  audit_notifications: boolean;
  report_notifications: boolean;
  system_notifications: boolean;
  asset_notifications: boolean;
  compact_mode: boolean;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  device_name: string | null;
  browser: string | null;
  operating_system: string | null;
  ip_address: string | null;
  location: string | null;
  last_activity: string;
  created_at: string;
  expires_at: string;
  isCurrent?: boolean;
}
