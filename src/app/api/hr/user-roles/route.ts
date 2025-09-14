import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        let whereClause = {};
        if (userId) {
            whereClause = { user_id: BigInt(userId) };
        }

        const userRoles = await db.user_role.findMany({
            where: whereClause,
            include: {
                users: true,
                roles: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedUserRoles = userRoles.map((ur: any) => ({
            ...ur,
            id: ur.id.toString(),
            user_id: ur.user_id.toString(),
            role_id: ur.role_id.toString(),
            users: ur.users ? {
                ...ur.users,
                id: ur.users.id.toString()
            } : null,
            roles: ur.roles ? {
                ...ur.roles,
                id: ur.roles.id.toString()
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedUserRoles });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user roles'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, role_id } = body;

        // Get current user from token
        const token = await getToken({ req: request });
        const currentUserId = token?.sub ? BigInt(token.sub) : undefined;

        const userRole = await db.user_role.create({
            data: {
                user_id: BigInt(user_id),
                role_id: BigInt(role_id)
            },
            include: {
                users: true,
                roles: true
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedUserRole = {
            ...userRole,
            id: userRole.id.toString(),
            user_id: userRole.user_id.toString(),
            role_id: userRole.role_id.toString(),
            users: userRole.users ? {
                ...userRole.users,
                id: userRole.users.id.toString()
            } : null,
            roles: userRole.roles ? {
                ...userRole.roles,
                id: userRole.roles.id.toString()
            } : null
        };

        // Log the creation activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: currentUserId || BigInt(1),
            action: 'CREATE',
            entity_type: 'user_role',
            entity_id: userRole.id,
            new_value: JSON.stringify(serializedUserRole),
            actor_id: currentUserId,
            ...actorInfo,
        });

        return NextResponse.json({ success: true, data: serializedUserRole });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create user role'
            },
            { status: 500 }
        );
    }
}
