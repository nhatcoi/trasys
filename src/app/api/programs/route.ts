import { NextRequest, NextResponse } from 'next/server';
import { ProgramService } from '@/modules/programs/programs.service';
import { ProgramQuerySchema } from '@/modules/programs/programs.schema';

const programService = new ProgramService();

// GET /api/programs - Get all programs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await programService.getAllProgramsWithOptions(params);
    
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

// POST /api/programs - Create new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await programService.createProgram(body);
    
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
