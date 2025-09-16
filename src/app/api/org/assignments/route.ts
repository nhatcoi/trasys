import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '50');
    const employee_id = searchParams.get('employee_id');
    const org_unit_id = searchParams.get('org_unit_id');
    const assignment_type = searchParams.get('assignment_type');

    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    if (employee_id) where.employee_id = BigInt(employee_id);
    if (org_unit_id) where.org_unit_id = BigInt(org_unit_id);
    if (assignment_type) where.assignment_type = assignment_type;

    const [assignments, total] = await Promise.all([
      db.orgAssignment.findMany({
        where,
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
        orderBy: {
          start_date: 'desc',
        },
        skip,
        take: size,
      }),
      db.orgAssignment.count({ where }),
    ]);

    // Serialize BigInt fields
    const serializedAssignments = assignments.map(assignment => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: serializedAssignments,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    });

  } catch (error: any) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { employee_id, org_unit_id, job_position_id, start_date, end_date, assignment_type, is_primary, allocation } = body;

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
    const orgUnit = await db.orgUnit.findUnique({
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
      const jobPosition = await db.jobPosition.findUnique({
        where: { id: BigInt(job_position_id) },
      });
      if (!jobPosition) {
        return NextResponse.json(
          { success: false, error: 'Job position not found' },
          { status: 404 }
        );
      }
    }

    // Check for existing active assignment
    const existingAssignment = await db.orgAssignment.findFirst({
      where: {
        employee_id: BigInt(employee_id),
        org_unit_id: BigInt(org_unit_id),
        is_primary: true,
        OR: [
          { end_date: null },
          { end_date: { gte: new Date(start_date) } },
        ],
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Employee already has an active assignment to this unit' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await db.orgAssignment.create({
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
      message: 'Assignment created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assignment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
