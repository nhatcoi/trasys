import { db } from '@/lib/db';
import { 
  CourseSchema, 
  CreateCourseSchema, 
  UpdateCourseSchema,
  CourseQuerySchema,
  type Course,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseQuery
} from './courses.schema';

export class CourseRepository {
  // Find all courses with pagination and filters
  async findAllWithOptions(options: CourseQuery) {
    const { page, size, sort, order, search, org_unit_id, type } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name_vi: { contains: search } },
        { name_en: { contains: search } },
      ];
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }
    
    if (type) {
      where.type = type;
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.courses.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.courses.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id.toString(),
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
  async findById(id: string): Promise<Course | null> {
    const item = await db.courses.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    };
  }

  // Create new course
  async create(data: CreateCourseInput): Promise<Course> {
    const created = await db.courses.create({
      data: {
        code: data.code,
        name_vi: data.name_vi,
        name_en: data.name_en,
        credits: data.credits,
        org_unit_id: BigInt(data.org_unit_id),
        type: data.type,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      org_unit_id: created.org_unit_id.toString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
    };
  }

  // Update course
  async update(id: string, data: UpdateCourseInput): Promise<Course> {
    const updated = await db.courses.update({
      where: { id: BigInt(id) },
      data: {
        code: data.code,
        name_vi: data.name_vi,
        name_en: data.name_en,
        credits: data.credits,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        type: data.type,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      org_unit_id: updated.org_unit_id.toString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
    };
  }

  // Delete course
  async delete(id: string): Promise<void> {
    await db.courses.delete({
      where: { id: BigInt(id) },
    });
  }
}
