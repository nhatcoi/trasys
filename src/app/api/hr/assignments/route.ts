import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to serialize BigInt to string
const serializeAssignment = (assignment: any) => {
    if (!assignment) return null;
    return {
        ...assignment,
        id: assignment.id.toString(),
        employee_id: assignment.employee_id.toString(),
        org_unit_id: assignment.org_unit_id.toString(),
        position_id: assignment.position_id?.toString() || null,
        allocation: assignment.allocation.toString(),
    };
};

export async function GET() {
    try {
        const assignments = await db.orgAssignment.findMany({
            include: {
                employee: {
                    include: {
                        user: true,
                    },
                },
                org_unit: true,
            },
        });

        // Convert BigInt to string for JSON serialization
        const serializedAssignments = assignments.map((assignment: any) => ({
            ...serializeAssignment(assignment),
            employee: assignment.employee ? {
                ...assignment.employee,
                id: assignment.employee.id.toString(),
                user_id: assignment.employee.user_id?.toString() || null,
                user: assignment.employee.user ? {
                    ...assignment.employee.user,
                    id: assignment.employee.user.id.toString()
                } : null
            } : null,
            org_unit: assignment.org_unit ? {
                ...assignment.org_unit,
                id: assignment.org_unit.id.toString(),
                parent_id: assignment.org_unit.parent_id?.toString() || null,
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedAssignments });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Database connection failed',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            employee_id,
            org_unit_id,
            position_id,
            is_primary,
            assignment_type,
            allocation,
            start_date,
            end_date,
        } = body;

        // Validate required fields
        if (!employee_id || !org_unit_id || !start_date) {
            return NextResponse.json(
                { success: false, error: 'employee_id, org_unit_id, and start_date are required' },
                { status: 400 }
            );
        }

        const assignment = await db.orgAssignment.create({
            data: {
                employee_id: BigInt(employee_id),
                org_unit_id: BigInt(org_unit_id),
                position_id: position_id ? BigInt(position_id) : null,
                is_primary: is_primary ?? true,
                assignment_type: assignment_type || 'admin',
                allocation: allocation ? parseFloat(allocation) : 1.00,
                start_date: new Date(start_date),
                end_date: end_date ? new Date(end_date) : null,
            },
        });

        return NextResponse.json({ success: true, data: serializeAssignment(assignment) });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create assignment'
            },
            { status: 500 }
        );
    }
}
