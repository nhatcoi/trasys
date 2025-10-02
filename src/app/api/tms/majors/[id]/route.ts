import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { z } from 'zod';
import { transformMajorForAPI } from '@/lib/api/bigint-utils';

const updateMajorSchema = z.object({
  code: z.string().min(1).max(32).optional(),
  name_vi: z.string().min(1).max(255).optional(),
  name_en: z.string().max(255).optional(),
  short_name: z.string().max(100).optional(),
  slug: z.string().max(255).optional(),
  national_code: z.string().max(32).optional(),
  is_moet_standard: z.boolean().optional(),
  degree_level: z.string().max(32).optional(),
  field_cluster: z.string().max(64).optional(),
  specialization_model: z.string().max(32).optional(),
  org_unit_id: z.number().optional(),
  parent_major_id: z.number().optional(),
  duration_years: z.number().min(0.1).max(10).optional(),
  total_credits_min: z.number().min(1).max(1000).optional(),
  total_credits_max: z.number().min(1).max(1000).optional(),
  semesters_per_year: z.number().min(1).max(4).optional(),
  start_terms: z.string().max(64).optional(),
  default_quota: z.number().min(0).optional(),
  status: z.enum(['draft', 'proposed', 'active', 'suspended', 'closed']).optional(),
  established_at: z.string().optional(),
  closed_at: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  campuses: z.array(z.object({
    campus_id: z.number(),
    is_primary: z.boolean()
  })).optional(),
  languages: z.array(z.object({
    lang: z.string(),
    level: z.string()
  })).optional(),
  modalities: z.array(z.object({
    modality: z.string(),
    note: z.string().optional()
  })).optional(),
  accreditations: z.array(z.object({
    scheme: z.string(),
    level: z.string().optional(),
    valid_from: z.string().optional(),
    valid_to: z.string().optional(),
    cert_no: z.string().optional(),
    agency: z.string().optional(),
    note: z.string().optional()
  })).optional(),
  aliases: z.array(z.object({
    name: z.string(),
    lang: z.string().optional(),
    valid_from: z.string().optional(),
    valid_to: z.string().optional()
  })).optional(),
  documents: z.array(z.object({
    doc_type: z.string(),
    title: z.string(),
    ref_no: z.string().optional(),
    issued_by: z.string().optional(),
    issued_at: z.string().optional(),
    file_url: z.string().optional(),
    note: z.string().optional()
  })).optional(),
});

// GET /api/tms/majors/[id] - Lấy chi tiết major
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const majorId = parseInt(params.id);

    if (isNaN(majorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid major ID' },
        { status: 400 }
      );
    }

    const major = await prisma.major.findUnique({
      where: { id: majorId },
      include: {
        OrgUnit: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          }
        },
        Major: {
          select: {
            id: true,
            code: true,
            name_vi: true,
            name_en: true,
          }
        },
        other_majors: {
          select: {
            id: true,
            code: true,
            name_vi: true,
            name_en: true,
          }
        },
        Program: {
          select: {
            id: true,
            code: true,
            name_vi: true,
            name_en: true,
            version: true,
            status: true,
            total_credits: true,
            effective_from: true,
            effective_to: true,
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        MajorOutcome: {
          select: {
            id: true,
            code: true,
            content: true,
            version: true,
            is_active: true,
          },
          where: {
            is_active: true
          },
          orderBy: {
            code: 'asc'
          }
        },
        MajorQuotaYear: {
          select: {
            id: true,
            year: true,
            quota: true,
            note: true,
          },
          orderBy: {
            year: 'desc'
          },
          take: 5
        },
        MajorTuition: {
          select: {
            id: true,
            year: true,
            tuition_group: true,
            amount_vnd: true,
            note: true,
          },
          orderBy: {
            year: 'desc'
          },
          take: 5
        },
      }
    });

    if (!major) {
      return NextResponse.json(
        { success: false, error: 'Major not found' },
        { status: 404 }
      );
    }

    // Transform major to include JSON fields and convert BigInt to Number
    const transformedMajor = transformMajorForAPI(major);

    return NextResponse.json({
      success: true,
      data: transformedMajor
    });

  } catch (error) {
    console.error('Error fetching major:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch major' },
      { status: 500 }
    );
  }
}

// PUT /api/tms/majors/[id] - Cập nhật major
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const majorId = parseInt(params.id);

    if (isNaN(majorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid major ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateMajorSchema.parse(body);

    // Check if major exists
    const existingMajor = await prisma.major.findUnique({
      where: { id: majorId }
    });

    if (!existingMajor) {
      return NextResponse.json(
        { success: false, error: 'Major not found' },
        { status: 404 }
      );
    }

    // Check if code already exists for this org unit (if code is being updated)
    if (validatedData.code && validatedData.code !== existingMajor.code) {
      const codeExists = await prisma.major.findFirst({
        where: {
          org_unit_id: validatedData.org_unit_id || existingMajor.org_unit_id,
          code: validatedData.code,
          id: { not: majorId }
        }
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Major code already exists for this organization unit' },
          { status: 400 }
        );
      }
    }

    // Update major
    const updateData: any = { ...validatedData };
    
    // Handle JSON fields
    if (validatedData.campuses !== undefined) {
      updateData.campuses = JSON.stringify(validatedData.campuses);
    }
    if (validatedData.languages !== undefined) {
      updateData.languages = JSON.stringify(validatedData.languages);
    }
    if (validatedData.modalities !== undefined) {
      updateData.modalities = JSON.stringify(validatedData.modalities);
    }
    if (validatedData.accreditations !== undefined) {
      updateData.accreditations = JSON.stringify(validatedData.accreditations);
    }
    if (validatedData.aliases !== undefined) {
      updateData.aliases = JSON.stringify(validatedData.aliases);
    }
    if (validatedData.documents !== undefined) {
      updateData.documents = JSON.stringify(validatedData.documents);
    }

    updateData.updated_at = new Date();

    const updatedMajor = await prisma.major.update({
      where: { id: majorId },
      data: updateData,
      include: {
        OrgUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      }
    });

    // Transform response and convert BigInt to Number
    const transformedMajor = transformMajorForAPI(updatedMajor);

    return NextResponse.json({
      success: true,
      data: transformedMajor,
      message: 'Major updated successfully'
    });

  } catch (error) {
    console.error('Error updating major:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update major' },
      { status: 500 }
    );
  }
}

// DELETE /api/tms/majors/[id] - Xóa major
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const majorId = parseInt(params.id);

    if (isNaN(majorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid major ID' },
        { status: 400 }
      );
    }

    // Check if major exists
    const existingMajor = await prisma.major.findUnique({
      where: { id: majorId },
      include: {
        _count: {
          select: {
            Program: true,
            other_majors: true,
          }
        }
      }
    });

    if (!existingMajor) {
      return NextResponse.json(
        { success: false, error: 'Major not found' },
        { status: 404 }
      );
    }

    // Check if major has dependent records
    if (existingMajor._count.Program > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete major with existing programs' },
        { status: 400 }
      );
    }

    if (existingMajor._count.other_majors > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete major with child majors' },
        { status: 400 }
      );
    }

    // Delete major
    await prisma.major.delete({
      where: { id: majorId }
    });

    return NextResponse.json({
      success: true,
      message: 'Major deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting major:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete major' },
      { status: 500 }
    );
  }
}
