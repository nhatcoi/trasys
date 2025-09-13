import { db } from '@/lib/db';
import { 
  CreateMajorSchema, 
  UpdateMajorSchema,
  MajorQuerySchema,
  type CreateMajorInput,
  type UpdateMajorInput,
  type MajorQuery
} from './majors.schema';

export class MajorRepository {
  // Simplified find all with pagination
  async findAllWithOptions(options: MajorQuery) {
    const { page, size, org_unit_id, search } = options;
    const skip = (page - 1) * size;

    // Simple where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name_vi: { contains: search } },
      ];
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.majors.findMany({
        where,
        skip,
        take: size,
        orderBy: { created_at: 'desc' },
      }),
      db.majors.count({ where }),
    ]);

    // Simple serialization
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      parent_major_id: item.parent_major_id?.toString(),
      established_at: item.established_at?.toISOString(),
      closed_at: item.closed_at?.toISOString(),
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

  // Find by ID - simplified
  async findById(id: string) {
    const item = await db.majors.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      parent_major_id: item.parent_major_id?.toString(),
      established_at: item.established_at?.toISOString(),
      closed_at: item.closed_at?.toISOString(),
    };
  }

  // Create new major - simplified
  async create(data: CreateMajorInput) {
    const created = await db.majors.create({
      data: {
        code: data.code,
        name_vi: data.name_vi,
        name_en: data.name_en,
        short_name: data.short_name,
        degree_level: data.degree_level,
        org_unit_id: BigInt(data.org_unit_id),
        status: data.status,
        duration_years: data.duration_years,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      org_unit_id: created.org_unit_id.toString(),
      parent_major_id: created.parent_major_id?.toString(),
      established_at: created.established_at?.toISOString(),
      closed_at: created.closed_at?.toISOString(),
    };
  }

  // Update major - simplified
  async update(id: string, data: UpdateMajorInput) {
    const updated = await db.majors.update({
      where: { id: BigInt(id) },
      data: {
        code: data.code,
        name_vi: data.name_vi,
        name_en: data.name_en,
        short_name: data.short_name,
        degree_level: data.degree_level,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        status: data.status,
        duration_years: data.duration_years,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      org_unit_id: updated.org_unit_id.toString(),
      parent_major_id: updated.parent_major_id?.toString(),
      established_at: updated.established_at?.toISOString(),
      closed_at: updated.closed_at?.toISOString(),
    };
  }

  // Delete major
  async delete(id: string): Promise<void> {
    await db.majors.delete({
      where: { id: BigInt(id) },
    });
  }
}
