import { db } from '@/lib/db';
import { 
  MajorOwnerHistorySchema, 
  CreateMajorOwnerHistorySchema, 
  UpdateMajorOwnerHistorySchema,
  MajorOwnerHistoryQuerySchema,
  type MajorOwnerHistory,
  type CreateMajorOwnerHistoryInput,
  type UpdateMajorOwnerHistoryInput,
  type MajorOwnerHistoryQuery
} from './major-owner-history.schema';

export class MajorOwnerHistoryRepository {
  // Find all major owner histories with pagination and filters
  async findAllWithOptions(options: MajorOwnerHistoryQuery) {
    const { page, size, sort, order, search, major_id, org_unit_id, start_date, end_date } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      // For major owner history, search might be on dates or IDs
      where.OR = [
        { start_date: { contains: search } },
        { end_date: { contains: search } },
      ];
    }
    
    if (major_id) {
      where.major_id = BigInt(major_id);
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }
    
    if (start_date) {
      where.start_date = { gte: new Date(start_date) };
    }
    
    if (end_date) {
      where.end_date = { lte: new Date(end_date) };
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.major_owner_history.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.major_owner_history.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      major_id: item.major_id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      start_date: item.start_date.toISOString(),
      end_date: item.end_date?.toISOString(),
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
  async findById(id: string): Promise<MajorOwnerHistory | null> {
    const item = await db.major_owner_history.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      major_id: item.major_id.toString(),
      org_unit_id: item.org_unit_id.toString(),
      start_date: item.start_date.toISOString(),
      end_date: item.end_date?.toISOString(),
    };
  }

  // Create new major owner history
  async create(data: CreateMajorOwnerHistoryInput): Promise<MajorOwnerHistory> {
    const created = await db.major_owner_history.create({
      data: {
        major_id: BigInt(data.major_id),
        org_unit_id: BigInt(data.org_unit_id),
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      major_id: created.major_id.toString(),
      org_unit_id: created.org_unit_id.toString(),
      start_date: created.start_date.toISOString(),
      end_date: created.end_date?.toISOString(),
    };
  }

  // Update major owner history
  async update(id: string, data: UpdateMajorOwnerHistoryInput): Promise<MajorOwnerHistory> {
    const updated = await db.major_owner_history.update({
      where: { id: BigInt(id) },
      data: {
        major_id: data.major_id ? BigInt(data.major_id) : undefined,
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      major_id: updated.major_id.toString(),
      org_unit_id: updated.org_unit_id.toString(),
      start_date: updated.start_date.toISOString(),
      end_date: updated.end_date?.toISOString(),
    };
  }

  // Delete major owner history
  async delete(id: string): Promise<void> {
    await db.major_owner_history.delete({
      where: { id: BigInt(id) },
    });
  }
}
