import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id);
    
    const unit = await db.orgUnit.findUnique({
      where: { id: unitId },
      include: {
        children: true,
        employees: true,
        parent: true,
      },
    });
    
    if (!unit) {
      return NextResponse.json(
        { success: false, error: 'Organization unit not found' },
        { status: 404 }
      );
    }
    
    // Convert BigInt to string for JSON serialization
    const serializedUnit = JSON.parse(JSON.stringify(unit, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ success: true, data: serializedUnit });
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
    const unitId = parseInt(params.id);
    const body = await request.json();
    const { name, code, parent_id, type, description, status, effective_from, effective_to } = body;
    
    const unit = await db.orgUnit.update({
      where: { id: unitId },
      data: {
        name,
        code,
        parent_id,
        type,
        description,
        status,
        effective_from: effective_from ? new Date(effective_from) : null,
        effective_to: effective_to ? new Date(effective_to) : null,
      },
    });
    
    // Convert BigInt to string for JSON serialization
    const serializedUnit = JSON.parse(JSON.stringify(unit, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ success: true, data: serializedUnit });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update organization unit' 
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
    const unitId = parseInt(params.id);
    
    await db.orgUnit.delete({
      where: { id: unitId },
    });
    
    return NextResponse.json({ success: true, message: 'Organization unit deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete organization unit' 
      },
      { status: 500 }
    );
  }
}