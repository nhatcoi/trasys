import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/org/types - Get all organization unit types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    // Try to fetch from database first, fallback to mock data
    try {
      const whereClause = includeInactive ? {} : { is_active: true };

      const types = await db.OrgUnitType.findMany({
        where: whereClause,
        orderBy: [
          { sort_order: 'asc' },
          { name: 'asc' }
        ]
      });

      // Serialize BigInt fields
      const serializedTypes = types.map(type => ({
        ...type,
        id: type.id.toString(),
      }));

      return NextResponse.json({
        success: true,
        data: serializedTypes,
        total: serializedTypes.length,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not ready, using mock data:', dbError);
      
      // Mock data fallback
      const mockTypes = [
        {
          id: "1",
          code: "UNIVERSITY",
          name: "Đại học",
          description: "Cấp trường đại học",
          color: "#1976d2",
          is_active: true,
          sort_order: 1,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "2", 
          code: "FACULTY",
          name: "Khoa",
          description: "Cấp khoa",
          color: "#2e7d32",
          is_active: true,
          sort_order: 2,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "3",
          code: "DEPARTMENT", 
          name: "Bộ môn",
          description: "Cấp bộ môn",
          color: "#ed6c02",
          is_active: true,
          sort_order: 3,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "4",
          code: "DIVISION", 
          name: "Phòng ban",
          description: "Cấp phòng ban",
          color: "#9c27b0",
          is_active: true,
          sort_order: 4,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "5",
          code: "CENTER", 
          name: "Trung tâm",
          description: "Cấp trung tâm",
          color: "#0288d1",
          is_active: true,
          sort_order: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "6",
          code: "INSTITUTE", 
          name: "Viện",
          description: "Cấp viện",
          color: "#d32f2f",
          is_active: true,
          sort_order: 6,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "7",
          code: "OFFICE", 
          name: "Văn phòng",
          description: "Cấp văn phòng",
          color: "#795548",
          is_active: true,
          sort_order: 7,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ];

      const filteredTypes = includeInactive 
        ? mockTypes 
        : mockTypes.filter(type => type.is_active);

      return NextResponse.json({
        success: true,
        data: filteredTypes,
        total: filteredTypes.length,
        source: 'mock',
        note: 'Database tables not created yet. Run scripts/create-tables.sql to enable real data.'
      });
    }

  } catch (error) {
    console.error('Error fetching org unit types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit types' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org/types - Create new organization unit type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, color, sort_order } = body;

    // Simple validation
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Code and name are required' },
        { status: 400 }
      );
    }

    // Try to create in database first, fallback to mock response
    try {
      const newType = await db.OrgUnitType.create({
        data: {
          code: code.toUpperCase(),
          name,
          description: description || null,
          color: color || '#1976d2',
          sort_order: sort_order || 0,
          is_active: true
        }
      });

      const serializedType = {
        ...newType,
        id: newType.id.toString(),
      };

      return NextResponse.json({
        success: true,
        data: serializedType,
        source: 'database'
      }, { status: 201 });
    } catch (dbError) {
      console.log('Database not ready, returning mock response:', dbError);
      
      // Mock response
      const mockType = {
        id: Date.now().toString(),
        code: code.toUpperCase(),
        name,
        description: description || null,
        color: color || '#1976d2',
        sort_order: sort_order || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: mockType,
        source: 'mock',
        note: 'Database tables not created yet. Run scripts/create-tables.sql to enable real data.'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating org unit type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org unit type' 
      },
      { status: 500 }
    );
  }
}