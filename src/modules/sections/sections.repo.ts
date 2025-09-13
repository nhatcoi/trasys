import { db } from '@/lib/db';
import { 
  SectionSchema, 
  CreateSectionSchema, 
  UpdateSectionSchema,
  SectionQuerySchema,
  type Section,
  type CreateSectionInput,
  type UpdateSectionInput,
  type SectionQuery
} from './sections.schema';

export class SectionRepository {
  // Find all sections with pagination and filters
  async findAllWithOptions(options: SectionQuery) {
    const { page, size, sort, order, search, course_id, term_id, org_unit_id, instructor_id, status } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { status: { contains: search } },
      ];
    }
    
    if (course_id) {
      where.course_id = parseInt(course_id);
    }
    
    if (term_id) {
      where.term_id = parseInt(term_id);
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }
    
    if (instructor_id) {
      where.instructor_id = parseInt(instructor_id);
    }
    
    if (status) {
      where.status = status;
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.sections.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.sections.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      course_id: item.course_id.toString(),
      term_id: item.term_id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      instructor_id: item.instructor_id?.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    }));

    return {
      items: serializedItems,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
        hasNextPage: page < Math.ceil(total / size),
        hasPrevPage: page > 1,
      },
    };
  }

  // Find by ID
  async findById(id: string): Promise<Section | null> {
    const item = await db.sections.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      course_id: item.course_id.toString(),
      term_id: item.term_id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      instructor_id: item.instructor_id?.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    };
  }

  // Create new section
  async create(data: CreateSectionInput): Promise<Section> {
    const created = await db.sections.create({
      data: {
        course_id: parseInt(data.course_id),
        term_id: parseInt(data.term_id),
        org_unit_id: BigInt(data.org_unit_id),
        code: data.code,
        capacity: data.capacity,
        instructor_id: data.instructor_id ? parseInt(data.instructor_id) : null,
        status: data.status,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      course_id: created.course_id.toString(),
      term_id: created.term_id.toString(),
      org_unit_id: created.org_unit_id.toString(),
      instructor_id: created.instructor_id?.toString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
    };
  }

  // Update section
  async update(id: string, data: UpdateSectionInput): Promise<Section> {
    const updated = await db.sections.update({
      where: { id: parseInt(id) },
      data: {
        course_id: data.course_id ? parseInt(data.course_id) : undefined,
        term_id: data.term_id ? parseInt(data.term_id) : undefined,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        code: data.code,
        capacity: data.capacity,
        instructor_id: data.instructor_id ? parseInt(data.instructor_id) : undefined,
        status: data.status,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      course_id: updated.course_id.toString(),
      term_id: updated.term_id.toString(),
      org_unit_id: updated.org_unit_id.toString(),
      instructor_id: updated.instructor_id?.toString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
    };
  }

  // Delete section
  async delete(id: string): Promise<void> {
    await db.sections.delete({
      where: { id: parseInt(id) },
    });
  }
}
