import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth/auth';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get course statistics by status
    const stats = await db.course.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Transform the results into a more usable format
    const result = {
      pending: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      const count = stat._count.id;
      result.total += count;
      
      switch (stat.status) {
        case 'DRAFT':
        case 'SUBMITTED':
          result.pending += count;
          break;
        case 'REVIEWING':
          result.reviewing += count;
          break;
        case 'APPROVED':
        case 'PUBLISHED':
          result.approved += count;
          break;
        case 'REJECTED':
        case 'CANCELLED':
          result.rejected += count;
          break;
        default:
          result.pending += count;
      }
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching course stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course statistics', details: error.message },
      { status: 500 }
    );
  }
}
