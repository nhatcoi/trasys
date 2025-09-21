// Simple permission utilities
import { useSession } from 'next-auth/react';

/**
 * Check if user has a specific permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Hook to check permissions from session
 */
export function usePermissions() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions || [];

  return {
    permissions,
    hasPermission: (permission: string) => hasPermission(permissions, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(permissions, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(permissions, permissions),
    // Role checking (if roles are available in session)
    hasRole: (role: string) => hasRole(session?.user?.roles || [], role),
    hasAnyRole: (roles: string[]) => hasAnyRole(session?.user?.roles || [], roles),
    // Common permission checks
    canReadOrgUnits: () => hasPermission(permissions, 'org_unit.read'),
    canCreateOrgUnits: () => hasPermission(permissions, 'org_unit.create'),
    canUpdateOrgUnits: () => hasPermission(permissions, 'org_unit.update'),
    canDeleteOrgUnits: () => hasPermission(permissions, 'org_unit.delete'),
    canAdminOrgUnits: () => hasPermission(permissions, 'org_unit.admin'),
    isAdmin: () => hasPermission(permissions, 'admin'),
  };
}