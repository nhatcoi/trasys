import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const rolePermissions = await db.role_permission.findMany({
            include: {
                roles: true,
                permissions: true,
                users: true
            },
            orderBy: {
                granted_at: 'desc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedRolePermissions = rolePermissions.map((rolePermission: any) => ({
            ...rolePermission,
            id: rolePermission.id.toString(),
            role_id: rolePermission.role_id.toString(),
            permission_id: rolePermission.permission_id.toString(),
            granted_by: rolePermission.granted_by?.toString() || null,
            roles: rolePermission.roles ? {
                ...rolePermission.roles,
                id: rolePermission.roles.id.toString()
            } : null,
            permissions: rolePermission.permissions ? {
                ...rolePermission.permissions,
                id: rolePermission.permissions.id.toString()
            } : null,
            users: rolePermission.users ? {
                ...rolePermission.users,
                id: rolePermission.users.id.toString()
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedRolePermissions });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Database connection failed'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { role_id, permission_id, granted_by } = body;

        if (!role_id || !permission_id) {
            return NextResponse.json(
                { success: false, error: 'role_id and permission_id are required' },
                { status: 400 }
            );
        }

        const rolePermission = await db.role_permission.create({
            data: {
                role_id: BigInt(role_id),
                permission_id: BigInt(permission_id),
                granted_by: granted_by ? BigInt(granted_by) : null
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...rolePermission,
                id: rolePermission.id.toString(),
                role_id: rolePermission.role_id.toString(),
                permission_id: rolePermission.permission_id.toString(),
                granted_by: rolePermission.granted_by?.toString() || null
            }
        });
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