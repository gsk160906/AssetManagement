import {
  LayoutDashboard,
  Building2,
  Package,
  UserCheck,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  User,
  type LucideIcon
} from 'lucide-react';
import { ROUTES } from './routes';

export interface SidebarNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const SIDEBAR_NAVIGATION: SidebarNavItem[] = [
  {
    name: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Organization Management',
    path: ROUTES.ORGANIZATION,
    icon: Building2,
  },
  {
    name: 'Assets',
    path: ROUTES.ASSETS,
    icon: Package,
  },
  {
    name: 'Asset Allocation',
    path: ROUTES.ALLOCATION,
    icon: UserCheck,
  },
  {
    name: 'Bookings',
    path: ROUTES.BOOKINGS,
    icon: CalendarDays,
  },
  {
    name: 'Maintenance',
    path: ROUTES.MAINTENANCE,
    icon: Wrench,
  },
  {
    name: 'Audits',
    path: ROUTES.AUDITS,
    icon: ClipboardCheck,
  },
  {
    name: 'Reports',
    path: ROUTES.REPORTS,
    icon: BarChart3,
  },
  {
    name: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
    icon: Bell,
  },
  {
    name: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
  },
  {
    name: 'Profile',
    path: ROUTES.PROFILE,
    icon: User,
  },
];
