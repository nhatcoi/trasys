import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      include: {
        user: true,
        assignments: {
          include: {
            org_unit: true,
            position: true
          }
        }
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedEmployees = employees.map((employee: any) => ({
      ...employee,
      id: employee.id.toString(),
      user_id: employee.user_id?.toString() || null,
      created_at: employee.created_at?.toString() || null,
      updated_at: employee.updated_at?.toString() || null,
      user: employee.user ? {
        ...employee.user,
        id: employee.user.id.toString(),
        created_at: employee.user.created_at?.toString() || null,
        updated_at: employee.user.updated_at?.toString() || null
      } : null,
      assignments: employee.assignments?.map((assignment: any) => ({
        ...assignment,
        id: assignment.id.toString(),
        employee_id: assignment.employee_id.toString(),
        org_unit_id: assignment.org_unit_id.toString(),
        position_id: assignment.position_id?.toString() || null,
        allocation: assignment.allocation?.toString() || null,
        created_at: assignment.created_at?.toString() || null,
        updated_at: assignment.updated_at?.toString() || null,
        org_unit: assignment.org_unit ? {
          ...assignment.org_unit,
          id: assignment.org_unit.id.toString()
        } : null,
        position: assignment.position ? {
          ...assignment.position,
          id: assignment.position.id.toString()
        } : null
      })) || []
    }));

    // Use JSON.stringify with replacer to handle BigInt
    const jsonString = JSON.stringify({ success: true, data: serializedEmployees }, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return new Response(jsonString, {
      headers: { 'Content-Type': 'application/json' }
    });
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
      user_id,
      employee_no,
      employment_type,
      status,
      hired_at,
    } = body;

    // Get current user from session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? BigInt(session.user.id) : undefined;

    const employee = await db.employee.create({
      data: {
        user: user_id ? { connect: { id: BigInt(user_id) } } : undefined,
        employee_no,
        employment_type,
        status,
        hired_at: hired_at ? new Date(hired_at) : null,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedEmployee = {
      ...employee,
      id: employee.id.toString(),
      user_id: employee.user_id?.toString() || null,
    };

    // Log the creation activity
    const actorInfo = getActorInfo(request);
    await logEmployeeActivity({
      employee_id: employee.id,
      action: 'CREATE',
      entity_type: 'employees',
      entity_id: employee.id,
      new_value: JSON.stringify(serializedEmployee),
      actor_id: currentUserId,
      ...actorInfo,
    });

    return NextResponse.json({ success: true, data: serializedEmployee });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create employee'
      },
      { status: 500 }
    );
  }
}
