import { db } from '@/lib/db';
import {
  type CreateProgramsInput,
  type UpdateProgramsInput,
  type ProgramsQuery
} from './programs.schema';

export class ProgramRepository {
  // Simplified find all with pagination
  async findAll(options: ProgramsQuery) {
    const { page, size, org_unit_id, search, status } = options;
    const skip = (page - 1) * size;

    // Build where clause
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
    
    if (status) {
      where.status = status;
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.programs.findMany({
        where,
        skip,
        take: size,
        orderBy: { created_at: 'desc' },
      }),
      db.programs.count({ where }),
    ]);

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      major_id: item.major_id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
      created_by: item.created_by?.toString(),
      updated_by: item.updated_by?.toString(),
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

  // Find by ID - simplified
  async findById(id: string) {
    const item = await db.programs.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      major_id: item.major_id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
      created_by: item.created_by?.toString(),
      updated_by: item.updated_by?.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    };
  }

  // Create new program - simplified
  async create(data: CreateProgramsInput) {
    const created = await db.programs.create({
      data: {
        major_id: data.major_id ? BigInt(data.major_id) : BigInt(1), // Use default major_id for now
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : null,
        version: data.version,
        total_credits: data.total_credits,
        plo: data.plo,
        status: data.status,
        effective_from: data.effective_from ? new Date(data.effective_from) : null,
        effective_to: data.effective_to ? new Date(data.effective_to) : null,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      major_id: created.major_id.toString(),
      org_unit_id: created.org_unit_id?.toString(),
      created_by: created.created_by?.toString(),
      updated_by: created.updated_by?.toString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
    };
  }

  // Update program - simplified
  async update(id: string, data: UpdateProgramsInput) {
    const updated = await db.programs.update({
      where: { id: BigInt(id) },
      data: {
        major_id: data.major_id ? BigInt(data.major_id) : undefined,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        version: data.version,
        total_credits: data.total_credits,
        plo: data.plo,
        status: data.status,
        effective_from: data.effective_from ? new Date(data.effective_from) : undefined,
        effective_to: data.effective_to ? new Date(data.effective_to) : undefined,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      major_id: updated.major_id.toString(),
      org_unit_id: updated.org_unit_id?.toString(),
      created_by: updated.created_by?.toString(),
      updated_by: updated.updated_by?.toString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
    };
  }

  // Delete program
  async delete(id: string): Promise<void> {
    await db.programs.delete({
      where: { id: BigInt(id) },
    });
  }
}
