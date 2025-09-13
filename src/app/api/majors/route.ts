import { NextRequest, NextResponse } from 'next/server';
import { MajorService } from '@/modules/majors/majors.service';
import { MajorQuerySchema } from '@/modules/majors/majors.schema';

const majorService = new MajorService();

// GET /api/majors - Get all majors with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await majorService.getAllMajorsWithOptions(params);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/majors - Create new major
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await majorService.createMajor(body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
