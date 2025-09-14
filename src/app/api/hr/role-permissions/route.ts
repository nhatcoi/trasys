import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roleId = searchParams.get('role_id');

        let whereClause = {};
        if (roleId) {
            whereClause = { role_id: BigInt(roleId) };
        }

        const rolePermissions = await db.role_permission.findMany({
            where: whereClause,
            include: {
                roles: true,
                permissions: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedRolePermissions = rolePermissions.map((rp: any) => ({
            ...rp,
            id: rp.id.toString(),
            role_id: rp.role_id.toString(),
            permission_id: rp.permission_id.toString(),
            roles: rp.roles ? {
                ...rp.roles,
                id: rp.roles.id.toString()
            } : null,
            permissions: rp.permissions ? {
                ...rp.permissions,
                id: rp.permissions.id.toString()
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedRolePermissions });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch role permissions'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { role_id, permission_id } = body;

        // Get current user from token
        const token = await getToken({ req: request });
        const currentUserId = token?.sub ? BigInt(token.sub) : undefined;

        const rolePermission = await db.role_permission.create({
            data: {
                role_id: BigInt(role_id),
                permission_id: BigInt(permission_id)
            },
            include: {
                roles: true,
                permissions: true
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedRolePermission = {
            ...rolePermission,
            id: rolePermission.id.toString(),
            role_id: rolePermission.role_id.toString(),
            permission_id: rolePermission.permission_id.toString(),
            roles: rolePermission.roles ? {
                ...rolePermission.roles,
                id: rolePermission.roles.id.toString()
            } : null,
            permissions: rolePermission.permissions ? {
                ...rolePermission.permissions,
                id: rolePermission.permissions.id.toString()
            } : null
        };

        // Log the creation activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1),
            action: 'CREATE',
            entity_type: 'role_permission',
            entity_id: rolePermission.id,
            new_value: JSON.stringify(serializedRolePermission),
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({ success: true, data: serializedRolePermission });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create role permission'
            },
            { status: 500 }
        );
    }
}
