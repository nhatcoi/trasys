import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getToken } from 'next-auth/jwt';

export async function GET() {
    try {
        const roles = await db.roles.findMany({
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
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedRoles = roles.map((role: any) => ({
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
        }));

        return NextResponse.json({ success: true, data: serializedRoles });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch roles'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name } = body;

        // Get current user from token
        const token = await getToken({ req: request });
        const currentUserId = token?.sub ? BigInt(token.sub) : undefined;

        const role = await db.roles.create({
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

        // Log the creation activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1), // Use current user or system user
            action: 'CREATE',
            entity_type: 'roles',
            entity_id: role.id,
            new_value: JSON.stringify(serializedRole),
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({ success: true, data: serializedRole });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create role'
            },
            { status: 500 }
        );
    }
}
