import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getToken } from 'next-auth/jwt';

export async function GET() {
    try {
        const permissions = await db.permissions.findMany({
            include: {
                role_permission: {
                    include: {
                        roles: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedPermissions = permissions.map((permission: any) => ({
            ...permission,
            id: permission.id.toString(),
            role_permission: permission.role_permission?.map((rp: any) => ({
                ...rp,
                id: rp.id.toString(),
                role_id: rp.role_id.toString(),
                permission_id: rp.permission_id.toString(),
                roles: rp.roles ? {
                    ...rp.roles,
                    id: rp.roles.id.toString()
                } : null
            })) || []
        }));

        return NextResponse.json({ success: true, data: serializedPermissions });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch permissions'
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

        const permission = await db.permissions.create({
            data: {
                code,
                name
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedPermission = {
            ...permission,
            id: permission.id.toString()
        };

        // Log the creation activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1),
            action: 'CREATE',
            entity_type: 'permissions',
            entity_id: permission.id,
            new_value: JSON.stringify(serializedPermission),
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({ success: true, data: serializedPermission });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create permission'
            },
            { status: 500 }
        );
    }
}
