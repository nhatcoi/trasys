import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');

        const employeeAcademicTitles = await db.employeeAcademicTitle.findMany({
            where: employeeId ? { employee_id: BigInt(employeeId) } : {},
            include: {
                employees: {
                    include: {
                        user: true,
                    },
                },
                academic_titles: true,
            },
            orderBy: {
                awarded_date: 'desc',
            },
        });

        const serializedTitles = employeeAcademicTitles.map(item => ({
            ...item,
            id: item.id.toString(),
            employee_id: item.employee_id.toString(),
            academic_title_id: item.academic_title_id.toString(),
            awarded_date: item.awarded_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            employees: item.employees ? {
                ...item.employees,
                id: item.employees.id.toString(),
                user_id: item.employees.user_id?.toString() || null,
                user: item.employees.user ? {
                    ...item.employees.user,
                    id: item.employees.user.id.toString(),
                } : null,
            } : null,
            academic_titles: item.academic_titles ? {
                ...item.academic_titles,
                id: item.academic_titles.id.toString(),
            } : null,
        }));

        return NextResponse.json({ success: true, data: serializedTitles });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch employee academic titles'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employee_id, academic_title_id, awarded_date } = body;

        if (!employee_id || !academic_title_id || !awarded_date) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newEmployeeAcademicTitle = await db.employeeAcademicTitle.create({
            data: {
                employee_id: BigInt(employee_id),
                academic_title_id: BigInt(academic_title_id),
                awarded_date: new Date(awarded_date),
            },
        });

        const serializedTitle = {
            ...newEmployeeAcademicTitle,
            id: newEmployeeAcademicTitle.id.toString(),
            employee_id: newEmployeeAcademicTitle.employee_id.toString(),
            academic_title_id: newEmployeeAcademicTitle.academic_title_id.toString(),
            awarded_date: newEmployeeAcademicTitle.awarded_date.toISOString().split('T')[0],
        };

        return NextResponse.json({ success: true, data: serializedTitle }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create employee academic title'
            },
            { status: 500 }
        );
    }
}
