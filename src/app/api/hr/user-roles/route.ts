import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const userRoles = await db.user_role.findMany({
            include: {
                roles: true,
                users_user_role_user_idTousers: true,
                users_user_role_assigned_byTousers: true
            },
            orderBy: {
                assigned_at: 'desc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedUserRoles = userRoles.map((userRole: any) => ({
            ...userRole,
            id: userRole.id.toString(),
            user_id: userRole.user_id.toString(),
            role_id: userRole.role_id.toString(),
            assigned_by: userRole.assigned_by?.toString() || null,
            roles: userRole.roles ? {
                ...userRole.roles,
                id: userRole.roles.id.toString()
            } : null,
            users_user_role_user_idTousers: userRole.users_user_role_user_idTousers ? {
                ...userRole.users_user_role_user_idTousers,
                id: userRole.users_user_role_user_idTousers.id.toString()
            } : null,
            users_user_role_assigned_byTousers: userRole.users_user_role_assigned_byTousers ? {
                ...userRole.users_user_role_assigned_byTousers,
                id: userRole.users_user_role_assigned_byTousers.id.toString()
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedUserRoles });
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
        const { user_id, role_id, assigned_by, expires_at, is_active } = body;

        if (!user_id || !role_id) {
            return NextResponse.json(
                { success: false, error: 'user_id and role_id are required' },
                { status: 400 }
            );
        }

        const userRole = await db.user_role.create({
            data: {
                user_id: BigInt(user_id),
                role_id: BigInt(role_id),
                assigned_by: assigned_by ? BigInt(assigned_by) : null,
                expires_at: expires_at ? new Date(expires_at) : null,
                is_active: is_active !== undefined ? is_active : true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...userRole,
                id: userRole.id.toString(),
                user_id: userRole.user_id.toString(),
                role_id: userRole.role_id.toString(),
                assigned_by: userRole.assigned_by?.toString() || null
            }
        });
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