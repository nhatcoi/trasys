import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionService } from '@/modules/class-sections/class-sections.service';
import { ClassSectionQuerySchema } from '@/modules/class-sections/class-sections.schema';

const classSectionService = new ClassSectionService();

// GET /api/class-sections - Get all class sections with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await classSectionService.getAllClassSectionsWithOptions(params);
    
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

// POST /api/class-sections - Create new class section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await classSectionService.createClassSection(body);
    
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
