import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/org/statuses - Get all organization unit statuses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    // Try to fetch from database first, fallback to mock data
    try {
      const whereClause = includeInactive ? {} : { is_active: true };

      const statuses = await db.OrgUnitStatus.findMany({
        where: whereClause,
        orderBy: [
          { workflow_step: 'asc' },
          { name: 'asc' }
        ]
      });

      // Serialize BigInt fields
      const serializedStatuses = statuses.map(status => ({
        ...status,
        id: status.id.toString(),
      }));

      return NextResponse.json({
        success: true,
        data: serializedStatuses,
        total: serializedStatuses.length,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not ready, using mock data:', dbError);
      
      // Mock data fallback
      const mockStatuses = [
        {
          id: "1",
          code: "DRAFT",
          name: "Nháp",
          description: "Trạng thái nháp",
          color: "#757575",
          is_active: true,
          workflow_step: 1,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          code: "REVIEW",
          name: "Thẩm định",
          description: "Đang thẩm định",
          color: "#ff9800",
          is_active: true,
          workflow_step: 2,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "3",
          code: "APPROVED",
          name: "Đã duyệt",
          description: "Đã được phê duyệt",
          color: "#4caf50",
          is_active: true,
          workflow_step: 3,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "4",
          code: "ACTIVE",
          name: "Hoạt động",
          description: "Đang hoạt động",
          color: "#2196f3",
          is_active: true,
          workflow_step: 4,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "5",
          code: "INACTIVE",
          name: "Không hoạt động",
          description: "Tạm dừng hoạt động",
          color: "#f44336",
          is_active: true,
          workflow_step: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "6",
          code: "ARCHIVED",
          name: "Lưu trữ",
          description: "Đã lưu trữ",
          color: "#9e9e9e",
          is_active: true,
          workflow_step: 6,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ];

      const filteredStatuses = includeInactive 
        ? mockStatuses 
        : mockStatuses.filter(status => status.is_active);

      return NextResponse.json({
        success: true,
        data: filteredStatuses,
        total: filteredStatuses.length,
        source: 'mock',
        note: 'Database tables not created yet. Run scripts/create-tables.sql to enable real data.'
      });
    }

  } catch (error) {
    console.error('Error fetching org unit statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit statuses' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org/statuses - Create new organization unit status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, color, workflow_step } = body;

    // Simple validation
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Code and name are required' },
        { status: 400 }
      );
    }

    // Try to create in database first, fallback to mock response
    try {
      const newStatus = await db.OrgUnitStatus.create({
        data: {
          code: code.toUpperCase(),
          name,
          description: description || null,
          color: color || '#757575',
          workflow_step: workflow_step || 0,
          is_active: true
        }
      });

      const serializedStatus = {
        ...newStatus,
        id: newStatus.id.toString(),
      };

      return NextResponse.json({
        success: true,
        data: serializedStatus,
        source: 'database'
      }, { status: 201 });
    } catch (dbError) {
      console.log('Database not ready, returning mock response:', dbError);
      
      // Mock response
      const mockStatus = {
        id: Date.now().toString(),
        code: code.toUpperCase(),
        name,
        description: description || null,
        color: color || '#757575',
        workflow_step: workflow_step || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: mockStatus,
        source: 'mock',
        note: 'Database tables not created yet. Run scripts/create-tables.sql to enable real data.'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating org unit status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org unit status' 
      },
      { status: 500 }
    );
  }
}