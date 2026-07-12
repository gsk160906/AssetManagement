import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OrganizationPage } from '../pages/organization/OrganizationPage';
import { AssetsPage } from '../pages/assets/AssetsPage';
import { CreateAssetPage } from '../pages/assets/CreateAssetPage';
import { EditAssetPage } from '../pages/assets/EditAssetPage';
import { AssetDetails } from '../pages/assets/AssetDetails';
import { AllocationsPage } from '../pages/allocations/AllocationsPage';
import { BookingsPage } from '../pages/bookings/BookingsPage';
import { BookingDetails } from '../pages/bookings/BookingDetails';
import { MaintenancePage } from '../pages/maintenance/MaintenancePage';
import { MaintenanceDetails } from '../pages/maintenance/MaintenanceDetails';
import { AuditsPage } from '../pages/audits/AuditsPage';
import { AuditDetails } from '../pages/audits/AuditDetails';
import { AuditReport } from '../pages/audits/AuditReport';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage';
import { DepartmentDetails } from '../pages/departments/DepartmentDetails';
import { AssetReport } from '../pages/reports/AssetReport';
import { MaintenanceReport } from '../pages/reports/MaintenanceReport';
import { AuditReport as AuditReportSummary } from '../pages/reports/AuditReport';
import { BookingReport } from '../pages/reports/BookingReport';
import { ExpenseReport } from '../pages/reports/ExpenseReport';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { EditProfilePage } from '../pages/profile/EditProfilePage';
import { SecurityPage } from '../pages/profile/SecurityPage';
import { PreferencesPage } from '../pages/profile/PreferencesPage';
import { SessionsPage } from '../pages/profile/SessionsPage';
import { NotificationPreferences } from '../pages/notifications/NotificationPreferences';

import { NotFoundPage } from '../pages/errors/NotFoundPage';
import { ForbiddenPage } from '../pages/errors/ForbiddenPage';
import { ROUTES } from '../constants/routes';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect to Dashboard */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ORGANIZATION} element={<OrganizationPage />} />
          <Route path={ROUTES.ASSETS} element={<AssetsPage />} />
          <Route path={ROUTES.ASSET_CREATE} element={<CreateAssetPage />} />
          <Route path={ROUTES.ASSET_EDIT} element={<EditAssetPage />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          <Route path={ROUTES.ALLOCATION} element={<AllocationsPage />} />
          <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetails />} />
          <Route path={ROUTES.AUDITS} element={<AuditsPage />} />
          <Route path="/audits/:id" element={<AuditDetails />} />
          <Route path="/audits/:id/report" element={<AuditReport />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path="/reports/assets" element={<AssetReport />} />
          <Route path="/reports/maintenance" element={<MaintenanceReport />} />
          <Route path="/reports/audits" element={<AuditReportSummary />} />
          <Route path="/reports/bookings" element={<BookingReport />} />
          <Route path="/reports/expenses" element={<ExpenseReport />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/:id" element={<DepartmentDetails />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path="/settings/notifications" element={<NotificationPreferences />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/security" element={<SecurityPage />} />
          <Route path="/profile/preferences" element={<PreferencesPage />} />
          <Route path="/profile/sessions" element={<SessionsPage />} />
        </Route>
      </Route>

      {/* Error Pages */}
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
