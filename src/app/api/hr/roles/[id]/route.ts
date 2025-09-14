import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getToken } from 'next-auth/jwt';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roleId = BigInt(id);

        const role = await db.roles.findUnique({
            where: { id: roleId as any },
            include: {
                role_permission: {
                    include: {
                        permissions: true
                    }
                },
                user_role: {
                    include: {
                        users: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Role not found'
                },
                { status: 404 }
            );
        }

        // Convert BigInt to string for JSON serialization
        const serializedRole = {
            ...role,
            id: role.id.toString(),
            role_permission: role.role_permission?.map((rp: any) => ({
                ...rp,
                id: rp.id.toString(),
                role_id: rp.role_id.toString(),
                permission_id: rp.permission_id.toString(),
                permissions: rp.permissions ? {
                    ...rp.permissions,
                    id: rp.permissions.id.toString()
                } : null
            })) || [],
            user_role: role.user_role?.map((ur: any) => ({
                ...ur,
                id: ur.id.toString(),
                user_id: ur.user_id.toString(),
                role_id: ur.role_id.toString(),
                users: ur.users ? {
                    ...ur.users,
                    id: ur.users.id.toString()
                } : null
            })) || []
        };

        return NextResponse.json({ success: true, data: serializedRole });
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roleId = BigInt(id);
        const body = await request.json();
        const { code, name } = body;

        // Get current user from token
        const token = await getToken({ req: request });
        const currentUserId = token?.sub ? BigInt(token.sub) : undefined;

        // Get old data for logging
        const oldRole = await db.roles.findUnique({
            where: { id: roleId as any },
        });

        const role = await db.roles.update({
            where: { id: roleId as any },
            data: {
                code,
                name
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedRole = {
            ...role,
            id: role.id.toString()
        };

        // Log the update activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1),
            action: 'UPDATE',
            entity_type: 'roles',
            entity_id: role.id,
            old_value: oldRole ? JSON.stringify({
                ...oldRole,
                id: oldRole.id.toString()
            }) : undefined,
            new_value: JSON.stringify(serializedRole),
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({
            success: true,
            data: serializedRole
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update role'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roleId = BigInt(id);

        // Get current user from token
        const token = await getToken({ req: request });
        const currentUserId = token?.sub ? BigInt(token.sub) : undefined;

        // Get old data for logging
        const oldRole = await db.roles.findUnique({
            where: { id: roleId as any },
        });

        await db.roles.delete({
            where: { id: roleId as any },
        });

        // Log the deletion activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1),
            action: 'DELETE',
            entity_type: 'roles',
            entity_id: roleId,
            old_value: oldRole ? JSON.stringify({
                ...oldRole,
                id: oldRole.id.toString()
            }) : undefined,
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete role'
            },
            { status: 500 }
        );
    }
}
