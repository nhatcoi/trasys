import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { z } from 'zod';
import { transformMajorsForAPI, transformMajorForAPI } from '@/lib/api/bigint-utils';

const createMajorSchema = z.object({
  code: z.string().min(1).max(32),
  name_vi: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  short_name: z.string().max(100).optional(),
  slug: z.string().max(255).optional(),
  national_code: z.string().max(32).optional(),
  is_moet_standard: z.boolean().optional(),
  degree_level: z.string().min(1).max(32),
  field_cluster: z.string().max(64).optional(),
  specialization_model: z.string().max(32).optional(),
  org_unit_id: z.number(),
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

// GET /api/tms/majors - Lấy danh sách majors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const degree_level = searchParams.get('degree_level') || '';
    const org_unit_id = searchParams.get('org_unit_id') || '';
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name_vi: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { short_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (degree_level) {
      where.degree_level = degree_level;
    }

    if (org_unit_id) {
      where.org_unit_id = parseInt(org_unit_id);
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Get majors with pagination
    const [majors, total] = await Promise.all([
      prisma.major.findMany({
        where,
        include: {
          OrgUnit: {
            select: {
              id: true,
              name: true,
              code: true,
            }
          },
          Major: {
            select: {
              id: true,
              code: true,
              name_vi: true,
            }
          },
          _count: {
            select: {
              Program: true,
              MajorOutcome: true,
              MajorQuotaYear: true,
              MajorTuition: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.major.count({ where })
    ]);

    // Transform majors to include JSON fields and convert BigInt to Number
    const transformedMajors = transformMajorsForAPI(majors);

    return NextResponse.json({
      success: true,
      data: transformedMajors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching majors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch majors' },
      { status: 500 }
    );
  }
}

// POST /api/tms/majors - Tạo major mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMajorSchema.parse(body);

    // Check if code already exists for this org unit
    const existingMajor = await prisma.major.findFirst({
      where: {
        org_unit_id: validatedData.org_unit_id,
        code: validatedData.code,
      }
    });

    if (existingMajor) {
      return NextResponse.json(
        { success: false, error: 'Major code already exists for this organization unit' },
        { status: 400 }
      );
    }

    // Create major
    const major = await prisma.major.create({
      data: {
        ...validatedData,
        campuses: JSON.stringify(validatedData.campuses || []),
        languages: JSON.stringify(validatedData.languages || [{ lang: 'vi', level: 'main' }]),
        modalities: JSON.stringify(validatedData.modalities || [{ modality: 'fulltime' }]),
        accreditations: JSON.stringify(validatedData.accreditations || []),
        aliases: JSON.stringify(validatedData.aliases || []),
        documents: JSON.stringify(validatedData.documents || []),
        status: validatedData.status || 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      } as any,
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
    const transformedMajor = transformMajorForAPI(major);

    return NextResponse.json({
      success: true,
      data: transformedMajor,
      message: 'Major created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating major:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create major' },
      { status: 500 }
    );
  }
}
