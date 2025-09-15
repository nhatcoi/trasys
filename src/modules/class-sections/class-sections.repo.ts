import { db } from '@/lib/db';

// Types
interface ClassSectionQuery {
  page: number;
  size: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  course_id?: string;
  org_unit_id?: string;
  term_academic_id?: string;
}

interface CreateClassSectionInput {
  course_id: string;
  org_unit_id: string;
  term_academic_id: string;
  section_name: string;
  section_code: string;
  max_students?: number;
  is_active?: boolean;
}

interface UpdateClassSectionInput {
  section_name?: string;
  section_code?: string;
  max_students?: number;
  is_active?: boolean;
}

interface ClassSection {
  id: string;
  course_id: string;
  org_unit_id: string;
  term_academic_id: string;
  section_name: string;
  section_code: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ClassSectionRepository {
  // Find all class sections with pagination and filters
  async findAllWithOptions(options: ClassSectionQuery) {
    const { page, size, sort, order, search, course_id, org_unit_id, term_academic_id } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { section_code: { contains: search } },
      ];
    }
    
    if (course_id) {
      where.course_id = BigInt(course_id);
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }
    
    if (term_academic_id) {
      where.term_academic_id = BigInt(term_academic_id);
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.classSection.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.classSection.count({ where }),
    ]);

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      course_id: item.course_id.toString(),
      course_version_id: item.course_version_id?.toString(),
      term_academic_id: item.term_academic_id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
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
  async findById(id: string): Promise<ClassSection | null> {
    const item = await db.classSection.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      course_id: item.course_id.toString(),
      course_version_id: item.course_version_id?.toString(),
      term_academic_id: item.term_academic_id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    };
  }

  // Create new class section
  async create(data: CreateClassSectionInput): Promise<ClassSection> {
    const created = await db.classSection.create({
      data: {
        course_id: BigInt(data.course_id),
        course_version_id: data.course_version_id ? BigInt(data.course_version_id) : null,
        term_academic_id: BigInt(data.term_academic_id),
        section_code: data.section_code,
        capacity: data.capacity,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : null,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      course_id: created.course_id.toString(),
      course_version_id: created.course_version_id?.toString(),
      term_academic_id: created.term_academic_id.toString(),
      org_unit_id: created.org_unit_id?.toString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
    };
  }

  // Update class section
  async update(id: string, data: UpdateClassSectionInput): Promise<ClassSection> {
    const updated = await db.classSection.update({
      where: { id: BigInt(id) },
      data: {
        course_id: data.course_id ? BigInt(data.course_id) : undefined,
        course_version_id: data.course_version_id ? BigInt(data.course_version_id) : undefined,
        term_academic_id: data.term_academic_id ? BigInt(data.term_academic_id) : undefined,
        section_code: data.section_code,
        capacity: data.capacity,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      course_id: updated.course_id.toString(),
      course_version_id: updated.course_version_id?.toString(),
      term_academic_id: updated.term_academic_id.toString(),
      org_unit_id: updated.org_unit_id?.toString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
    };
  }

  // Delete class section
  async delete(id: string): Promise<void> {
    await db.classSection.delete({
      where: { id: BigInt(id) },
    });
  }
}
