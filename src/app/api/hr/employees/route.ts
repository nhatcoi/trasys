import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      include: {
        user: true,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedEmployees = employees.map((employee: any) => ({
      ...employee,
      id: employee.id.toString(),
      user_id: employee.user_id?.toString() || null,
      user: employee.user ? {
        ...employee.user,
        id: employee.user.id.toString()
      } : null
    }));

    return NextResponse.json({ success: true, data: serializedEmployees });
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

    const employee = await db.employee.create({
      data: {
        user_id: user_id ? BigInt(user_id) : null,
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
