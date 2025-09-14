import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');
        const action = searchParams.get('action');
        const entityType = searchParams.get('entity_type');
        const actorId = searchParams.get('actor_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (employeeId) {
            where.employee_id = BigInt(employeeId);
        }

        if (action) {
            where.action = action;
        }

        if (entityType) {
            where.entity_type = entityType;
        }

        if (actorId) {
            where.actor_id = BigInt(actorId);
        }

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) {
                where.created_at.gte = new Date(startDate);
            }
            if (endDate) {
                where.created_at.lte = new Date(endDate);
            }
        }

        const [logs, totalCount] = await Promise.all([
            db.employee_log.findMany({
                where,
                include: {
                    employees: {
                        include: {
                            user: true,
                        },
                    },
                    users: true, // actor
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip: offset,
                take: limit,
            }),
            db.employee_log.count({ where }),
        ]);

        const serializedLogs = logs.map(log => ({
            ...log,
            id: log.id.toString(),
            employee_id: log.employee_id.toString(),
            entity_id: log.entity_id?.toString() || null,
            actor_id: log.actor_id?.toString() || null,
            created_at: log.created_at.toISOString(),
            employees: log.employees ? {
                ...log.employees,
                id: log.employees.id.toString(),
                user_id: log.employees.user_id?.toString() || null,
                user: log.employees.user ? {
                    ...log.employees.user,
                    id: log.employees.user.id.toString(),
                } : null,
            } : null,
            users: log.users ? {
                ...log.users,
                id: log.users.id.toString(),
            } : null,
        }));

        return NextResponse.json({
            success: true,
            data: serializedLogs,
            pagination: {
                page,
                limit,
                total: Number(totalCount),
                totalPages: Math.ceil(Number(totalCount) / limit),
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch employee logs'
            },
            { status: 500 }
        );
    }
}