import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { AppLoader } from '../components/feedback/AppLoader';

export const ProtectedRoute: React.FC = () => {
  const { isInitialized } = useSystem();
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for both setup status and auth check to resolve
  if (isInitialized === null || isLoading) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
