import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitService } from '@/modules/org/org.service';
import { UpdateOrgUnitSchema, OrgUnitParamsSchema } from '@/modules/org/org.schema';

const orgUnitService = new OrgUnitService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate params
    const { id } = OrgUnitParamsSchema.parse(params);
    
    // Call service
    const result = await orgUnitService.getById(id);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : (result.error?.includes('not found') ? 404 : 500)
    });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request parameters' 
      },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate params
    const { id } = OrgUnitParamsSchema.parse(params);
    
    // Validate body
    const body = await request.json();
    const validatedData = UpdateOrgUnitSchema.parse(body);
    
    // Call service
    const result = await orgUnitService.update(id, validatedData);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate params
    const { id } = OrgUnitParamsSchema.parse(params);
    
    // Call service
    const result = await orgUnitService.delete(id);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request parameters' 
      },
      { status: 400 }
    );
  }
}