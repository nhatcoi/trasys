import { db } from '@/lib/db';
import { CreateOrgUnitInput, UpdateOrgUnitInput, OrgUnitQuery } from './org.schema';

export class OrgUnitRepository {
  // Get all organization units without relations (lazy)
  // async findAll() {
  //   return await db.orgUnit.findMany();
  // }

  // Search and filter with pagination, sorting, and relations
  async findAll(options: OrgUnitQuery) {
    // Build where clause
    const where: any = {};
    
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { code: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    
    if (options.status) {
      where.status = options.status;
    }
    
    if (options.type) {
      where.type = options.type;
    }
    
    if (options.fromDate || options.toDate) {
      where.effective_from = {};
      if (options.fromDate) {
        where.effective_from.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.effective_from.lte = new Date(options.toDate);
      }
    }

    // Build include clause
    const include: any = {};
    if (options.include_children) include.children = true;
    if (options.include_employees) include.OrgAssignment = true;
    if (options.include_parent) include.parent = true;

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
    
    if (Object.keys(include).length > 0) {
      queryOptions.include = include;
    }

    const [items, total] = await Promise.all([
      db.orgUnit.findMany(queryOptions),
      db.orgUnit.count({ where })
    ]);
    
    // Serialize BigInt fields
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      parent_id: item.parent_id?.toString(),
      campus_id: item.campus_id?.toString(),
      // Serialize nested BigInt fields in OrgAssignment
      org_assignment: item.OrgAssignment?.map((assignment: any) => ({
        ...assignment,
        id: assignment.id?.toString(),
        employee_id: assignment.employee_id?.toString(),
        org_unit_id: assignment.org_unit_id?.toString(),
        position_id: assignment.position_id?.toString(),
      })) || [],
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
  async count(options: OrgUnitQuery) {
    const where: any = {};
    
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { code: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    
    if (options.status) {
      where.status = options.status;
    }
    
    if (options.type) {
      where.type = options.type;
    }
    
    if (options.fromDate || options.toDate) {
      where.effective_from = {};
      if (options.fromDate) {
        where.effective_from.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.effective_from.lte = new Date(options.toDate);
      }
    }

    return await db.orgUnit.count({ where });
  }

  // Get organization unit by ID
  async findById(id: number) {
    const result = await db.orgUnit.findUnique({
      where: { id },
    });

    if (!result) return null;

    // Serialize BigInt fields
    return {
      ...result,
      id: result.id.toString(),
      parent_id: result.parent_id?.toString(),
      campus_id: result.campus_id?.toString(),
    };
  }

  // Create new organization unit
  async create(data: CreateOrgUnitInput) {
    const result = await db.orgUnit.create({
      data: {
        name: data.name,
        code: data.code,
        parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        type: data.type,
        description: data.description,
        status: data.status,
        effective_from: data.effective_from ? new Date(data.effective_from) : null,
        effective_to: data.effective_to ? new Date(data.effective_to) : null,
        campus_id: data.campus_id ? BigInt(data.campus_id) : null,
        planned_establishment_date: data.planned_establishment_date ? new Date(data.planned_establishment_date) : null,
      },
    });

    // Serialize BigInt fields
    return {
      ...result,
      id: result.id.toString(),
      parent_id: result.parent_id?.toString(),
      campus_id: result.campus_id?.toString(),
    };
  }

  // Update organization unit
  async update(id: number, data: any) {
    const result = await db.orgUnit.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        parent_id: data.parent_id ? BigInt(data.parent_id) : undefined,
        type: data.type,
        description: data.description,
        status: data.status,
        effective_from: data.effective_from ? new Date(data.effective_from) : undefined,
        effective_to: data.effective_to ? new Date(data.effective_to) : undefined,
        campus_id: data.campus_id ? BigInt(data.campus_id) : undefined,
      },
    });

    // Serialize BigInt fields
    return {
      ...result,
      id: result.id.toString(),
      parent_id: result.parent_id?.toString(),
      campus_id: result.campus_id?.toString(),
    };
  }

  // "Delete" organization unit: update status to 'deleted'
  async delete(id: number) {
    const result = await db.orgUnit.update({
      where: { id },
      data: { status: 'deleted' },
    });

    // Serialize BigInt fields
    return {
      ...result,
      id: result.id.toString(),
      parent_id: result.parent_id?.toString(),
      campus_id: result.campus_id?.toString(),
    };
  }

  // Get organization units by parent ID
  async findByParentId(parentId: number) {
    return await db.orgUnit.findMany({
      where: { parent_id: parentId },
      include: {
        children: true,
        employees: true,
      },
    });
  }

  // Get status counts for statistics
  async getStatusCounts() {
    const counts = await db.orgUnit.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Transform to object with status as key
    const statusCounts: Record<string, number> = {};
    counts.forEach(count => {
      statusCounts[count.status || 'unknown'] = count._count.status;
    });

    return statusCounts;
  }

}
