import { db } from '@/lib/db';
import { 
  type CreateSectionsInput,
  type UpdateSectionsInput,
  type SectionsQuery
} from './sections.schema';

export class SectionRepository {
  // Find all sections with pagination and filters
  async findAll(options: SectionsQuery) {
    const { page = 1, size = 20, sort = 'id', order = 'desc', search, org_unit_id, status } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search } },
      ];
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
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

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      course_id: item.course_id.toString(),
      term_id: item.term_id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      instructor_id: item.instructor_id?.toString(),
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

  // Find section by ID
  async findById(id: string) {
    const section = await db.sections.findUnique({
      where: { id: parseInt(id) },
    });

    if (!section) return null;

    // Serialize all IDs for consistency
    return {
      ...section,
      id: section.id.toString(),
      course_id: section.course_id.toString(),
      term_id: section.term_id.toString(),
      org_unit_id: section.org_unit_id.toString(),
      instructor_id: section.instructor_id?.toString(),
    };
  }

  // Create new section
  async create(data: CreateSectionsInput) {
    const created = await db.sections.create({
      data: {
        code: data.code,
        course_id: parseInt(data.course_id),
        term_id: parseInt(data.term_id),
        org_unit_id: BigInt(data.org_unit_id),
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
    };
  }

  // Update section
  async update(id: string, data: UpdateSectionsInput) {
    const updated = await db.sections.update({
      where: { id: parseInt(id) },
      data: {
        code: data.code,
        course_id: data.course_id ? parseInt(data.course_id) : undefined,
        term_id: data.term_id ? parseInt(data.term_id) : undefined,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
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
    };
  }

  // Delete section
  async delete(id: string) {
    await db.sections.delete({
      where: { id: parseInt(id) },
    });
  }
}