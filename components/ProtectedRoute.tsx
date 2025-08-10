import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Spinner } from './ui';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    // Store the intended path to redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
     alert('У вас нет разрешения на просмотр этой страницы.');
    // Redirect to their own dashboard or home if they try to access a restricted page
    const homePath = 
        currentUser.role === UserRole.CLIENT ? "/client" :
        currentUser.role === UserRole.MANUFACTURER ? "/manufacturer" :
        currentUser.role === UserRole.ADMIN ? "/admin" : "/";
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />; 
};