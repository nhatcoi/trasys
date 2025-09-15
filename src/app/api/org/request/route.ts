import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestType = searchParams.get('request_type') || 'created';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: { [key: string]: unknown } = {
      request_type: requestType,
    };

    if (status) {
      whereClause.status = status;
    }

    // Fetch requests with related data
    const requests = await db.OrgStructureRequest.findMany({
      where: whereClause,
      include: {
        org_units: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.OrgStructureRequest.count({
      where: whereClause,
    });

    // Serialize BigInt fields
    const serializedRequests = requests.map((request) => ({
      id: request.id.toString(),
      requester_id: request.requester_id?.toString() || null,
      request_type: request.request_type,
      target_org_unit_id: request.target_org_unit_id?.toString() || null,
      payload: request.payload,
      status: request.status,
      workflow_step: request.workflow_step,
      created_at: request.created_at,
      updated_at: request.updated_at,
      owner_org_id: request.owner_org_id?.toString() || null,
      attachments: request.attachments,
      org_units: request.org_units ? {
        id: request.org_units.id.toString(),
        name: request.org_units.name,
        code: request.org_units.code,
        type: request.org_units.type,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching org requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization requests',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
