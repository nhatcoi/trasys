import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRepository } from '@/modules/org/org.repo';

const orgUnitRepo = new OrgUnitRepository();

// GET /api/org/units/audit - Get all units with their status for audit/monitoring
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '50');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';

    // Build where clause
    const where: { [key: string]: unknown } = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    // Build orderBy clause
    const orderBy: { [key: string]: unknown } = {};
    orderBy[sort] = order;

    // Calculate pagination
    const skip = (page - 1) * size;

    // Get units with pagination
    const result = await orgUnitRepo.findAll({
      status,
      type,
      page,
      size,
      sort,
      order,
    });

    // Get status counts for statistics
    const statusCounts = await orgUnitRepo.getStatusCounts();

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Audit route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch audit data' 
      },
      { status: 500 }
    );
  }
}
