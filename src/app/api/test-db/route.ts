import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection by querying org_unit_types
    const types = await db.OrgUnitType.findMany({
      take: 3
    });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: types.map(type => ({
        id: type.id.toString(),
        code: type.code,
        name: type.name
      })),
      count: types.length
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: error
      },
      { status: 500 }
    );
  }
}
