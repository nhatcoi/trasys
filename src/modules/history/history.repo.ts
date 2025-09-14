import { db } from '@/lib/db';
import { HistoryQuery } from './history.schema';

export class HistoryRepository {
  // Get history records with filtering and pagination
  async findAll(options: HistoryQuery) {
    // Build where clause
    const where: any = {};
    
    if (options.org_unit_id) {
      where.org_unit_id = parseInt(options.org_unit_id, 10);
    }
    
    if (options.change_type) {
      where.change_type = options.change_type;
    }
    
    if (options.from_date || options.to_date) {
      where.changed_at = {};
      if (options.from_date) {
        where.changed_at.gte = new Date(options.from_date);
      }
      if (options.to_date) {
        where.changed_at.lte = new Date(options.to_date);
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[options.sort] = options.order;

    // Calculate pagination
    const skip = (options.page - 1) * options.size;

    // Build query options
    const queryOptions: any = {
      where,
      orderBy,
      skip,
      take: options.size,
    };

    const [items, total] = await Promise.all([
      db.orgUnitHistory.findMany(queryOptions),
      db.orgUnitHistory.count({ where })
    ]);

    // Serialize BigInt fields
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id.toString(),
    }));

    return {
      items: serializedItems,
      total,
      page: options.page,
      size: options.size,
      totalPages: Math.ceil(total / options.size)
    };
  }

  // Count total records for pagination
  async count(options: HistoryQuery) {
    const where: any = {};
    
    if (options.org_unit_id) {
      where.org_unit_id = parseInt(options.org_unit_id, 10);
    }
    
    if (options.change_type) {
      where.change_type = options.change_type;
    }
    
    if (options.from_date || options.to_date) {
      where.changed_at = {};
      if (options.from_date) {
        where.changed_at.gte = new Date(options.from_date);
      }
      if (options.to_date) {
        where.changed_at.lte = new Date(options.to_date);
      }
    }

    return await db.orgUnitHistory.count({ where });
  }

  // Get history by ID
  async findById(id: number) {
    return db.orgUnitHistory.findUnique({
        where: {id},
        include: {
            org_units: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                }
            }
        }
    });
  }

  // Create new history record
  async create(data: {
    org_unit_id: number;
    old_name?: string;
    new_name?: string;
    change_type: string;
    details?: any;
  }) {
    return db.orgUnitHistory.create({
        data: {
            org_unit_id: data.org_unit_id,
            old_name: data.old_name,
            new_name: data.new_name,
            change_type: data.change_type,
            details: data.details,
        },
        include: {
            org_units: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                }
            }
        }
    });
  }
}
