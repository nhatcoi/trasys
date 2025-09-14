import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

        let whereClause: any = {
            status: 'PENDING'
        };

        // Nếu không phải admin, chỉ xem được đơn của nhân viên trong đơn vị
        if (!isAdmin) {
            // TODO: Implement logic để lấy danh sách employee_id mà user có quyền duyệt
            // Tạm thời lấy tất cả đơn PENDING
            // whereClause.employee_id = { in: [list of employee IDs] }
        }

        const [leaveRequests, total] = await Promise.all([
            db.leave_requests.findMany({
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
            db.leave_requests.count({ where: whereClause })
        ]);

        return NextResponse.json({
            data: leaveRequests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching pending leave requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
