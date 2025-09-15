import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { serializeBigIntArray } from '@/utils/serialize';

// GET /api/hr/leave-requests - Lấy danh sách đơn xin nghỉ
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');
        const status = searchParams.get('status');
        const leaveType = searchParams.get('leave_type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Lấy thông tin user hiện tại
        const currentUser = await db.users.findUnique({
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
                }
            }
        });

        if (!currentUser?.employees?.[0]) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const currentEmployee = currentUser.employees[0];

        // Kiểm tra quyền admin dựa trên permissions
        const isAdmin = session.user.permissions?.includes('leave_request.update') ||
            session.user.permissions?.includes('employee.update');

        let whereClause: any = {};

        // Nếu không phải admin, chỉ xem được đơn của mình hoặc đơn của nhân viên trong đơn vị
        if (!isAdmin) {
            if (employeeId) {
                // Kiểm tra quyền xem đơn của nhân viên khác
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

                // Kiểm tra xem có phải đơn của chính mình không
                if (targetEmployee.id !== currentEmployee.id) {
                    // Kiểm tra xem có phải cấp trên không
                    const canView = await checkSupervisorPermission(currentEmployee, targetEmployee);
                    if (!canView) {
                        return NextResponse.json({ error: 'No permission to view this employee\'s requests' }, { status: 403 });
                    }
                }

                whereClause.employee_id = BigInt(employeeId);
            } else {
                // Nếu không chỉ định employee_id, chỉ xem đơn của mình
                whereClause.employee_id = currentEmployee.id;
            }
        } else {
            // Admin có thể xem tất cả
            if (employeeId) {
                whereClause.employee_id = BigInt(employeeId);
            }
        }

        if (status) {
            whereClause.status = status;
        }

        if (leaveType) {
            whereClause.leave_type = leaveType;
        }

        if (startDate && endDate) {
            whereClause.start_date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const leaveRequests = await db.leaveRequest.findMany({
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
                        }
                    }
                },
            },
            orderBy: {
                created_at: 'desc'
            },
            skip: offset,
            take: limit
        });

        const total = await db.leaveRequest.count({ where: whereClause });

        // Serialize BigInt fields
        const serializedLeaveRequests = serializeBigIntArray(leaveRequests);

        return NextResponse.json({
            data: serializedLeaveRequests,
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/hr/leave-requests - Tạo đơn xin nghỉ mới
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { leave_type, start_date, end_date, reason } = body;

        // Validation
        if (!leave_type || !start_date || !end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
            return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
        }

        // Lấy thông tin employee
        const employee = await db.employee.findFirst({
            where: { user_id: BigInt(session.user.id) }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Tạo đơn xin nghỉ
        const leaveRequest = await db.leaveRequest.create({
            data: {
                employee_id: employee.id,
                leave_type,
                start_date: startDate,
                end_date: endDate,
                reason: reason || null,
                status: 'PENDING'
            },
            include: {
                employees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                full_name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Tạo lịch sử trong employee_log
        await db.employeeLog.create({
            data: {
                employee_id: employee.id,
                action: 'CREATE',
                entity_type: 'leave_request',
                entity_id: leaveRequest.id,
                reason: 'Đơn xin nghỉ được tạo',
                actor_id: BigInt(session.user.id),
                actor_role: 'EMPLOYEE'
            }
        });

        // Serialize BigInt fields
        const serializedLeaveRequest = {
            ...leaveRequest,
            id: leaveRequest.id.toString(),
            employee_id: leaveRequest.employee_id.toString(),
            employees: {
                ...leaveRequest.employees,
                id: leaveRequest.employees.id.toString(),
                user_id: leaveRequest.employees.user_id.toString(),
                user: {
                    ...leaveRequest.employees.user,
                    id: leaveRequest.employees.user.id.toString()
                }
            }
        };

        return NextResponse.json(serializedLeaveRequest, { status: 201 });

    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function để kiểm tra quyền cấp trên
async function checkSupervisorPermission(supervisor: any, employee: any): Promise<boolean> {
    // Logic kiểm tra quyền cấp trên
    // Có thể dựa vào org_unit hierarchy hoặc role-based permission

    // Tạm thời return true để test
    // TODO: Implement proper supervisor permission logic
    return true;
}
