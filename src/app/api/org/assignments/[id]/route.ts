import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = BigInt(id);

    const assignment = await db.orgAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        Employee: {
          include: {
            User: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
        OrgUnit: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        JobPosition: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Serialize response
    const serializedAssignment = {
      id: assignment.id.toString(),
      employee_id: assignment.employee_id.toString(),
      org_unit_id: assignment.org_unit_id.toString(),
      job_position_id: assignment.position_id?.toString(),
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      assignment_type: assignment.assignment_type,
      is_primary: assignment.is_primary,
      allocation: assignment.allocation.toString(),
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      Employee: {
        id: assignment.Employee.id.toString(),
        employee_no: assignment.Employee.employee_no,
        User: assignment.Employee.User ? {
          id: assignment.Employee.User.id.toString(),
          full_name: assignment.Employee.User.full_name,
          email: assignment.Employee.User.email,
        } : null,
      },
      OrgUnit: assignment.OrgUnit ? {
        id: assignment.OrgUnit.id.toString(),
        name: assignment.OrgUnit.name,
        code: assignment.OrgUnit.code,
        type: assignment.OrgUnit.type,
      } : null,
      JobPosition: assignment.JobPosition ? {
        id: assignment.JobPosition.id.toString(),
        title: assignment.JobPosition.title,
        code: assignment.JobPosition.code,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedAssignment,
    });

  } catch (error: any) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = BigInt(id);
    const body = await request.json();
    const { employee_id, org_unit_id, job_position_id, start_date, end_date, assignment_type, is_primary, allocation } = body;

    // Check if assignment exists
    const existingAssignment = await db.orgAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!employee_id || !org_unit_id || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await db.employee.findUnique({
      where: { id: BigInt(employee_id) },
    });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if org unit exists
    const orgUnit = await db.OrgUnit.findUnique({
      where: { id: BigInt(org_unit_id) },
    });
    if (!orgUnit) {
      return NextResponse.json(
        { success: false, error: 'Organization unit not found' },
        { status: 404 }
      );
    }

    // Check if job position exists (if provided)
    if (job_position_id) {
      const jobPosition = await db.JobPosition.findUnique({
        where: { id: BigInt(job_position_id) },
      });
      if (!jobPosition) {
        return NextResponse.json(
          { success: false, error: 'Job position not found' },
          { status: 404 }
        );
      }
    }

    // Check for existing active assignment (excluding current one)
    const conflictingAssignment = await db.orgAssignment.findFirst({
      where: {
        employee_id: BigInt(employee_id),
        org_unit_id: BigInt(org_unit_id),
        is_primary: true,
        id: { not: assignmentId },
        OR: [
          { end_date: null },
          { end_date: { gte: new Date(start_date) } },
        ],
      },
    });

    if (conflictingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Employee already has an active assignment to this unit' },
        { status: 400 }
      );
    }

    // Update assignment
    const assignment = await db.orgAssignment.update({
      where: { id: assignmentId },
      data: {
        employee_id: BigInt(employee_id),
        org_unit_id: BigInt(org_unit_id),
        position_id: job_position_id ? BigInt(job_position_id) : null,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        assignment_type: assignment_type || 'admin',
        is_primary: is_primary !== undefined ? is_primary : true,
        allocation: allocation ? parseFloat(allocation) : 1.00,
      },
      include: {
        Employee: {
          include: {
            User: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
        OrgUnit: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        JobPosition: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
    });

    // Serialize response
    const serializedAssignment = {
      id: assignment.id.toString(),
      employee_id: assignment.employee_id.toString(),
      org_unit_id: assignment.org_unit_id.toString(),
      job_position_id: assignment.position_id?.toString(),
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      assignment_type: assignment.assignment_type,
      is_primary: assignment.is_primary,
      allocation: assignment.allocation.toString(),
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      Employee: {
        id: assignment.Employee.id.toString(),
        employee_no: assignment.Employee.employee_no,
        User: assignment.Employee.User ? {
          id: assignment.Employee.User.id.toString(),
          full_name: assignment.Employee.User.full_name,
          email: assignment.Employee.User.email,
        } : null,
      },
      OrgUnit: assignment.OrgUnit ? {
        id: assignment.OrgUnit.id.toString(),
        name: assignment.OrgUnit.name,
        code: assignment.OrgUnit.code,
        type: assignment.OrgUnit.type,
      } : null,
      JobPosition: assignment.JobPosition ? {
        id: assignment.JobPosition.id.toString(),
        title: assignment.JobPosition.title,
        code: assignment.JobPosition.code,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedAssignment,
      message: 'Assignment updated successfully',
    });

  } catch (error: any) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update assignment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = BigInt(id);

    // Check if assignment exists
    const existingAssignment = await db.orgAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Delete assignment
    await db.orgAssignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete assignment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
