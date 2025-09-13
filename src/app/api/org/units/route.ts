import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitService } from '@/modules/org/org.service';
import { CreateOrgUnitSchema, OrgUnitQuerySchema } from '@/modules/org/org.schema';

const orgUnitService = new OrgUnitService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse all query parameters
    const queryOptions = {
      // Pagination
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : undefined,
      
      // Sorting
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') as 'asc' | 'desc' || undefined,
      
      // Search & Filter
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      
      // Date range
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      
      // Fetch options
      include_children: searchParams.get('include_children') === 'true',
      include_employees: searchParams.get('include_employees') === 'true',
      include_parent: searchParams.get('include_parent') === 'true',
    };
    
    // Validate query options
    const validatedOptions = OrgUnitQuerySchema.parse(queryOptions);
    
    // Always use options method for consistency
    const result = await orgUnitService.getAll(validatedOptions);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid query parameters' 
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateOrgUnitSchema.parse(body);
    
    // Call service
    const result = await orgUnitService.create(validatedData);
    
    return NextResponse.json(result, { 
      status: result.success ? 201 : 500 
    });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request data' 
      },
      { status: 400 }
    );
  }
}