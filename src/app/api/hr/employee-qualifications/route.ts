import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Lấy danh sách bằng cấp của nhân viên
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');

        let whereClause = {};
        if (employeeId) {
            whereClause = {
                employee_id: BigInt(employeeId)
            };
        }

        const employeeQualifications = await db.employee_qualification.findMany({
            where: whereClause,
            include: {
                employees: {
                    include: {
                        user: true
                    }
                },
                qualifications: true
            },
            orderBy: {
                awarded_date: 'desc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedData = employeeQualifications.map((eq: any) => ({
            ...eq,
            id: eq.id.toString(),
            employee_id: eq.employee_id.toString(),
            qualification_id: eq.qualification_id.toString(),
            employees: eq.employees ? {
                ...eq.employees,
                id: eq.employees.id.toString(),
                user_id: eq.employees.user_id?.toString() || null,
                user: eq.employees.user ? {
                    ...eq.employees.user,
                    id: eq.employees.user.id.toString()
                } : null
            } : null,
            qualifications: eq.qualifications ? {
                ...eq.qualifications,
                id: eq.qualifications.id.toString()
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedData });
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

// POST - Thêm bằng cấp cho nhân viên
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employee_id, qualification_id, major_field, institution, awarded_date } = body;

        if (!employee_id || !qualification_id || !major_field || !institution || !awarded_date) {
            return NextResponse.json(
                { success: false, error: 'Tất cả các trường là bắt buộc' },
                { status: 400 }
            );
        }

        const employeeQualification = await db.employee_qualification.create({
            data: {
                employee_id: BigInt(employee_id),
                qualification_id: BigInt(qualification_id),
                major_field,
                institution,
                awarded_date: new Date(awarded_date)
            },
            include: {
                employees: {
                    include: {
                        user: true
                    }
                },
                qualifications: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...employeeQualification,
                id: employeeQualification.id.toString(),
                employee_id: employeeQualification.employee_id.toString(),
                qualification_id: employeeQualification.qualification_id.toString(),
                employees: employeeQualification.employees ? {
                    ...employeeQualification.employees,
                    id: employeeQualification.employees.id.toString(),
                    user_id: employeeQualification.employees.user_id?.toString() || null,
                    user: employeeQualification.employees.user ? {
                        ...employeeQualification.employees.user,
                        id: employeeQualification.employees.user.id.toString()
                    } : null
                } : null,
                qualifications: employeeQualification.qualifications ? {
                    ...employeeQualification.qualifications,
                    id: employeeQualification.qualifications.id.toString()
                } : null
            }
        });
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
