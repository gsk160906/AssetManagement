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
import { AllocationPage } from '../pages/allocation/AllocationPage';
import { BookingsPage } from '../pages/bookings/BookingsPage';
import { MaintenancePage } from '../pages/maintenance/MaintenancePage';
import { AuditsPage } from '../pages/audits/AuditsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

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
          <Route path={ROUTES.ALLOCATION} element={<AllocationPage />} />
          <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
          <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
          <Route path={ROUTES.AUDITS} element={<AuditsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Error Pages */}
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
