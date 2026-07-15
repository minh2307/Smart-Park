import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requiredPermission,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Admin role automatically has all permissions. Other roles check permission array.
  const hasPermission =
    user.role === 'SYSTEM_ADMIN' || 
    (user.permissions && user.permissions.includes(requiredPermission));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
