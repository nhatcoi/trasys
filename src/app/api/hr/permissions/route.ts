import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const permissions = await db.Permission.findMany({
            include: {
                RolePermission: {
                    include: {
                        Role: true
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
            RolePermission: permission.role_permission?.map((rp: any) => ({
                ...rp,
                id: rp.id.toString(),
                role_id: rp.role_id.toString(),
                permission_id: rp.permission_id.toString(),
                granted_by: rp.granted_by?.toString() || null,
                Role: rp.roles ? {
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
                error: error instanceof Error ? error.message : 'Database connection failed'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, resource, action } = body;

        if (!name || !resource || !action) {
            return NextResponse.json(
                { success: false, error: 'Name, resource, and action are required' },
                { status: 400 }
            );
        }

        const permission = await db.Permission.create({
            data: {
                name,
                description,
                resource,
                action
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...permission,
                id: permission.id.toString()
            }
        });
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