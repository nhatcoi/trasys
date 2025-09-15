import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get campuses from database
    const campuses = await db.campus.findMany({
      where,
      select: {
        id: true,
        code: true,
        name_vi: true,
        name_en: true,
        address: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        name_vi: 'asc'
      },
    });

    // Serialize BigInt fields
    const serializedCampuses = campuses.map(campus => ({
      ...campus,
      id: campus.id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedCampuses,
      total: serializedCampuses.length,
    });

  } catch (error) {
    console.error('Campuses GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campuses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
