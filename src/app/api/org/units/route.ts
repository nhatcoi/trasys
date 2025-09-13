import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const units = await db.orgUnit.findMany({
      include: {
        children: true,
        employees: true,
      },
    });
    
    // Convert BigInt to string for JSON serialization
    const serializedUnits = JSON.parse(JSON.stringify(units, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ success: true, data: serializedUnits });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, parent_id, type, description, status, effective_from, effective_to } = body;
    
    const unit = await db.orgUnit.create({
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
        error: error instanceof Error ? error.message : 'Failed to create organization unit' 
      },
      { status: 500 }
    );
  }
}