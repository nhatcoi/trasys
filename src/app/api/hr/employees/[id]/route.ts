import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = BigInt(id);

    const employee = await db.employee.findUnique({
      where: { id: employeeId as any },
      include: {
        user: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found'
        },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const serializedEmployee = {
      ...employee,
      id: employee.id.toString(),
      user_id: employee.user_id?.toString() || null,
      user: employee.user ? {
        ...employee.user,
        id: employee.user.id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: serializedEmployee
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = BigInt(id);
    const body = await request.json();
    const {
      user_id,
      employee_no,
      employment_type,
      status,
      hired_at,
      terminated_at,
    } = body;

    const employee = await db.employee.update({
      where: { id: employeeId as any },
      data: {
        user_id: user_id ? BigInt(user_id) : null,
        employee_no,
        employment_type,
        status,
        hired_at: hired_at ? new Date(hired_at) : null,
        terminated_at: terminated_at ? new Date(terminated_at) : null,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedEmployee = {
      ...employee,
      id: employee.id.toString(),
      user_id: employee.user_id?.toString() || null,
    };

    return NextResponse.json({
      success: true,
      data: serializedEmployee
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update employee'
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
    const { id } = await params;
    const employeeId = BigInt(id);

    await db.employee.delete({
      where: { id: employeeId as any },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete employee'
      },
      { status: 500 }
    );
  }
}