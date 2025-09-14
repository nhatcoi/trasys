'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface PermissionGuardProps {
    children: ReactNode;
    requiredPermissions: string[];
    fallback?: ReactNode;
}

export function PermissionGuard({
    children,
    requiredPermissions,
    fallback = null
}: PermissionGuardProps) {
    const { data: session } = useSession();

    if (!session?.user?.permissions) {
        return <>{fallback}</>;
    }

    const userPermissions = session.user.permissions;
    const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
    );

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

// Hook để check permission
export function usePermissions() {
    const { data: session } = useSession();

    const hasPermission = (requiredPermissions: string | string[]) => {
        if (!session?.user?.permissions) return false;

        const permissions = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        return permissions.some(permission =>
            session.user.permissions.includes(permission)
        );
    };

    const hasAnyPermission = (requiredPermissions: string[]) => {
        if (!session?.user?.permissions) return false;
        return requiredPermissions.some(permission =>
            session.user.permissions.includes(permission)
        );
    };

    const hasAllPermissions = (requiredPermissions: string[]) => {
        if (!session?.user?.permissions) return false;
        return requiredPermissions.every(permission =>
            session.user.permissions.includes(permission)
        );
    };

    return {
        permissions: session?.user?.permissions || [],
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
}
