import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { serializeBigIntArray } from '@/utils/serialize';

// GET /api/hr/leave-requests/pending - Lấy danh sách đơn xin nghỉ chờ duyệt
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
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
                },
            }
        });

        if (!currentUser?.employees?.[0]) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const currentEmployee = currentUser.employees[0];

        // Kiểm tra quyền admin dựa trên permissions
        const isAdmin = session.user.permissions?.includes('leave_request.update') ||
            session.user.permissions?.includes('employee.update');

        let whereClause: any = {
            status: 'PENDING'
        };

        // Nếu không phải admin, chỉ xem được đơn của nhân viên trong đơn vị
        if (!isAdmin) {
            // Lecturer chỉ xem được đơn của mình
            whereClause.employee_id = currentEmployee.id;
        }

        const [leaveRequests, total] = await Promise.all([
            db.leaveRequest.findMany({
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
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: offset,
                take: limit
            }),
            db.leaveRequest.count({ where: whereClause })
        ]);

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
        console.error('Error fetching pending leave requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
