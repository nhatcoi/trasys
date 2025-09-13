import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = BigInt(params.id);
    
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      include: {
        org_unit: true,
      },
    });
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
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
        error: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = BigInt(params.id);
    const body = await request.json();
    const { 
      user_id, 
      employee_no, 
      employment_ty, 
      status, 
      hired_at, 
      terminated_at,
      org_unit_id 
    } = body;
    
    const employee = await db.employee.update({
      where: { id: employeeId },
      data: {
        user_id: user_id ? BigInt(user_id) : null,
        employee_no,
        employment_ty,
        status,
        hired_at: hired_at ? new Date(hired_at) : null,
        terminated_at: terminated_at ? new Date(terminated_at) : null,
        org_unit_id,
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
        error: error instanceof Error ? error.message : 'Failed to update employee' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = BigInt(params.id);
    
    await db.employee.delete({
      where: { id: employeeId },
    });
    
    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
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