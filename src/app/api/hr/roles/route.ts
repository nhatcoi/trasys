import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
                        users_user_role_user_idTousers: true
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
                granted_by: rp.granted_by?.toString() || null,
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
                assigned_by: ur.assigned_by?.toString() || null,
                users_user_role_user_idTousers: ur.users_user_role_user_idTousers ? {
                    ...ur.users_user_role_user_idTousers,
                    id: ur.users_user_role_user_idTousers.id.toString()
                } : null
            })) || []
        }));

        return NextResponse.json({ success: true, data: serializedRoles });
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
        const { name, description, is_system_role } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        const role = await db.roles.create({
            data: {
                name,
                description,
                is_system_role: is_system_role || false
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...role,
                id: role.id.toString()
            }
        });
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