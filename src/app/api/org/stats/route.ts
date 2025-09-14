import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/org/stats - Get organization statistics for dashboard
export async function GET(request: NextRequest) {
  try {
    // Get total units count
    const totalUnits = await db.orgUnit.count();

    // Get active/inactive units count
    const activeUnits = await db.orgUnit.count({
      where: { status: 'active' }
    });
    
    const inactiveUnits = await db.orgUnit.count({
      where: { status: 'inactive' }
    });

    // Get units by type
    const [departments, divisions, teams, branches] = await Promise.all([
      db.orgUnit.count({ where: { type: 'department' } }),
      db.orgUnit.count({ where: { type: 'division' } }),
      db.orgUnit.count({ where: { type: 'team' } }),
      db.orgUnit.count({ where: { type: 'branch' } })
    ]);

    // Get total employees count from org_assignment
    const totalEmployees = await db.orgAssignment.count({
      where: {
        end_date: null // Only active assignments
      }
    });

    // Get top 5 units by employee count
    const topUnits = await db.orgUnit.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        _count: {
          select: {
            OrgAssignment: {
              where: {
                end_date: null // Only active assignments
              }
            }
          }
        }
      },
      orderBy: {
        OrgAssignment: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Serialize BigInt fields and format top units
    const serializedTopUnits = topUnits.map(unit => ({
      id: unit.id.toString(),
      name: unit.name,
      code: unit.code,
      type: unit.type || 'unknown',
      employeeCount: unit._count.OrgAssignment
    }));

    const stats = {
      totalUnits,
      totalEmployees,
      activeUnits,
      inactiveUnits,
      departments,
      divisions,
      teams,
      branches,
      topUnits: serializedTopUnits
    };

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('org-stats GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org stats' 
      },
      { status: 500 }
    );
  }
}
