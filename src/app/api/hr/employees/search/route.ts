import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get current user session and permissions
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? BigInt(session.user.id) : null;
    const userPermissions = session?.user?.permissions || [];

    // Check if user has admin permissions (can see all employees)
    const isRector = userPermissions.includes('employee.delete');
    const isDeanOrManager = userPermissions.includes('employee.update') && !userPermissions.includes('employee.delete');
    const isAdmin = isRector || (userPermissions.includes('hr.employees.view') &&
      (userPermissions.includes('hr.employees.create') ||
        userPermissions.includes('hr.employees.update') ||
        userPermissions.includes('hr.employees.delete')));

    let whereClause = {};

    if (isRector) {
      // Rector can see all employees - no filtering needed
      whereClause = {};
    } else if (isDeanOrManager && currentUserId) {
      // Dean/Manager should see employees in their organizational scope
      const currentUserEmployee = await db.employee.findFirst({
        where: { user_id: currentUserId },
        include: {
          OrgAssignment: {
            include: {
              OrgUnit: true
            }
          }
        }
      });

      if (currentUserEmployee && currentUserEmployee.OrgAssignment.length > 0) {
        // Get all org units that current user manages (including sub-units)
        const userOrgUnitIds = currentUserEmployee.OrgAssignment.map(a => a.org_unit_id);

        // Find all sub-units of user's org units
        const subOrgUnits = await db.orgUnit.findMany({
          where: {
            parent_id: { in: userOrgUnitIds }
          }
        });

        const allOrgUnitIds = [
          ...userOrgUnitIds,
          ...subOrgUnits.map(unit => unit.id)
        ];

        // Filter employees to only those in user's organizational scope
        whereClause = {
          OrgAssignment: {
            some: {
              org_unit_id: { in: allOrgUnitIds }
            }
          }
        };
      } else {
        // If Dean/Manager has no org assignments, they can only see themselves
        whereClause = { user_id: currentUserId };
      }
    } else if (!isAdmin && currentUserId) {
      // Regular users can only see themselves
      whereClause = { user_id: currentUserId };
    }

    // Add search condition if query is provided
    if (query.trim()) {
      whereClause = {
        ...whereClause,
        User: {
          OR: [
            { full_name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }
      };
    } else {
      // If no query, just get all employees (with existing permissions)
      whereClause = {
        ...whereClause
      };
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    
    const employees = await db.employee.findMany({
      where: whereClause,
      include: {
        User: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true
          }
        }
      },
      take: limit,
      orderBy: {
        User: {
          full_name: 'asc'
        }
      }
    });
    
    console.log('Found employees:', employees.length);

    // Convert BigInt to string for JSON serialization
    console.log('Raw employees:', employees.length);
    const serializedEmployees = employees.map(employee => ({
      id: employee.id.toString(),
      user_id: employee.user_id?.toString(),
      employee_no: employee.employee_no,
      User: employee.User ? {
        ...employee.User,
        id: employee.User.id.toString()
      } : null,
      OrgAssignment: [] // Simplified for now
    }));

    return NextResponse.json({
      success: true,
      data: serializedEmployees,
      total: serializedEmployees.length
    });

  } catch (error) {
    console.error('Employee search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search employees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
