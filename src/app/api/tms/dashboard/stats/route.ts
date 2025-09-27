import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/tms/dashboard/stats - Lấy thống kê dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgUnitId = searchParams.get('orgUnitId');

    // Build WHERE conditions
    const courseWhere: any = {};
    const programWhere: any = {};
    const majorWhere: any = {};

    if (orgUnitId) {
      courseWhere.org_unit_id = parseInt(orgUnitId);
      programWhere.org_unit_id = parseInt(orgUnitId);
      majorWhere.org_unit_id = parseInt(orgUnitId);
    }

    // Get courses statistics
    const coursesStats = await db.course.groupBy({
      by: ['status'],
      where: courseWhere,
      _count: { status: true }
    });

    // Get programs statistics
    const programsStats = await db.program.groupBy({
      by: ['status'],
      where: programWhere,
      _count: { status: true }
    });

    // Get majors statistics
    const majorsStats = await db.major.groupBy({
      by: ['degree_level'],
      where: majorWhere,
      _count: { degree_level: true }
    });

    // Get recent activities (last 7 days)
    const recentActivities = await db.course.findMany({
      where: {
        ...courseWhere,
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      select: {
        id: true,
        code: true,
        name_vi: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Transform statistics
    const coursesStatsFormatted = {
      total_courses: await db.course.count({ where: courseWhere }),
      draft_courses: coursesStats.find(s => s.status === 'DRAFT')?._count?.status || 0,
      submitted_courses: coursesStats.find(s => s.status === 'SUBMITTED')?._count?.status || 0,
      reviewing_courses: coursesStats.find(s => s.status === 'REVIEWING')?._count?.status || 0,
      approved_courses: coursesStats.find(s => s.status === 'APPROVED')?._count?.status || 0,
      published_courses: coursesStats.find(s => s.status === 'PUBLISHED')?._count?.status || 0,
      rejected_courses: coursesStats.find(s => s.status === 'REJECTED')?._count?.status || 0
    };

    const programsStatsFormatted = {
      total_programs: await db.program.count({ where: programWhere }),
      draft_programs: programsStats.find(s => s.status === 'DRAFT')?._count?.status || 0,
      active_programs: programsStats.find(s => s.status === 'ACTIVE')?._count?.status || 0,
      archived_programs: programsStats.find(s => s.status === 'ARCHIVED')?._count?.status || 0
    };

    const majorsStatsFormatted = {
      total_majors: await db.major.count({ where: majorWhere }),
      bachelor_majors: majorsStats.find(s => s.degree_level === 'BACHELOR')?._count?.degree_level || 0,
      master_majors: majorsStats.find(s => s.degree_level === 'MASTER')?._count?.degree_level || 0,
      doctorate_majors: majorsStats.find(s => s.degree_level === 'DOCTORATE')?._count?.degree_level || 0
    };

    return NextResponse.json({
      data: {
        courses: coursesStatsFormatted,
        programs: programsStatsFormatted,
        majors: majorsStatsFormatted,
        recent_activities: recentActivities.map(activity => ({
          type: 'course',
          action: 'created',
          item_code: activity.code,
          item_name: activity.name_vi,
          timestamp: activity.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}