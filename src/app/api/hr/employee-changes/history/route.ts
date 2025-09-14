import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/hr/employee-changes/history - Lấy lịch sử sửa đổi thông tin nhân viên
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');
        const action = searchParams.get('action');
        const entityType = searchParams.get('entity_type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Lấy thông tin user hiện tại
        const currentUser = await db.user.findUnique({
            where: { id: BigInt(session.user.id) },
            include: {
                employees: {
                    include: {
                        assignments: {
                            include: {
                                org_unit: true,
                                job_positions: true
                            }
                        }
                    }
                },
                user_role: {
                    include: {
                        roles: true
                    }
                }
            }
        });

        if (!currentUser?.employees?.[0]) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const currentEmployee = currentUser.employees[0];
        const userRoles = currentUser.user_role.map(ur => ur.roles.code);
        const isAdmin = userRoles.includes('ADMIN');

        let whereClause: any = {};

        // Nếu không phải admin, chỉ xem được lịch sử của mình hoặc nhân viên trong đơn vị
        if (!isAdmin) {
            if (employeeId) {
                // Kiểm tra quyền xem lịch sử của nhân viên khác
                const targetEmployee = await db.employee.findUnique({
                    where: { id: BigInt(employeeId) },
                    include: {
                        assignments: {
                            include: {
                                org_unit: true
                            }
                        }
                    }
                });

                if (!targetEmployee) {
                    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
                }

                // Kiểm tra xem có phải lịch sử của chính mình không
                if (targetEmployee.id !== currentEmployee.id) {
                    // TODO: Implement supervisor permission check
                    return NextResponse.json({ error: 'No permission to view this employee\'s history' }, { status: 403 });
                }

                whereClause.employee_id = BigInt(employeeId);
            } else {
                // Nếu không chỉ định employee_id, chỉ xem lịch sử của mình
                whereClause.employee_id = currentEmployee.id;
            }
        } else {
            // Admin có thể xem tất cả
            if (employeeId) {
                whereClause.employee_id = BigInt(employeeId);
            }
        }

        // Thêm các filter khác
        if (action) {
            whereClause.action = action;
        }

        if (entityType) {
            whereClause.entity_type = entityType;
        }

        if (startDate && endDate) {
            whereClause.created_at = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const [employeeLogs, total] = await Promise.all([
            db.employee_log.findMany({
                where: whereClause,
                include: {
                    employees: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    full_name: true,
                                    email: true
                                }
                            },
                            assignments: {
                                include: {
                                    org_unit: true,
                                    job_positions: true
                                }
                            }
                        }
                    },
                    users: {
                        select: {
                            id: true,
                            full_name: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: offset,
                take: limit
            }),
            db.employee_log.count({ where: whereClause })
        ]);

        // Serialize BigInt fields
        const serializedEmployeeLogs = employeeLogs.map(log => ({
            ...log,
            id: log.id.toString(),
            employee_id: log.employee_id.toString(),
            entity_id: log.entity_id.toString(),
            actor_id: log.actor_id.toString(),
            employees: {
                ...log.employees,
                id: log.employees.id.toString(),
                user_id: log.employees.user_id.toString(),
                user: {
                    ...log.employees.user,
                    id: log.employees.user.id.toString()
                },
                assignments: log.employees.assignments.map(assignment => ({
                    ...assignment,
                    id: assignment.id.toString(),
                    employee_id: assignment.employee_id.toString(),
                    org_unit_id: assignment.org_unit_id.toString(),
                    position_id: assignment.position_id.toString(),
                    org_unit: {
                        ...assignment.org_unit,
                        id: assignment.org_unit.id.toString()
                    },
                    job_positions: {
                        ...assignment.job_positions,
                        id: assignment.job_positions.id.toString()
                    }
                }))
            },
            users: {
                ...log.users,
                id: log.users.id.toString()
            }
        }));

        return NextResponse.json({
            data: serializedEmployeeLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching employee change history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
