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
    const size = parseInt(searchParams.get('size') || '1000');
    const search = searchParams.get('search');

    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { job_family: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobPositions, total] = await Promise.all([
      db.JobPosition.findMany({
        where,
        orderBy: {
          title: 'asc',
        },
        skip,
        take: size,
      }),
      db.JobPosition.count({ where }),
    ]);

    // Serialize BigInt fields
    const serializedJobPositions = jobPositions.map(position => ({
      id: position.id.toString(),
      code: position.code,
      title: position.title,
      grade: position.grade,
      job_family: position.job_family,
    }));

    return NextResponse.json({
      success: true,
      data: serializedJobPositions,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    });

  } catch (error: any) {
    console.error('Get job positions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job positions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
