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
    if (options.include_employees) include.employees = true;
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

    return await db.orgUnit.findMany(queryOptions);
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
    return await db.orgUnit.findUnique({
      where: { id },
      include: {
        children: true,
        employees: true,
        // Include relations where this unit is a child
        parentRelations: {
          include: {
            parent: true,
          },
          where: {
            effective_to: null, // Only active relations
          },
        },
        // Include relations where this unit is a parent
        childRelations: {
          include: {
            child: true,
          },
          where: {
            effective_to: null, // Only active relations
          },
        },
      },
    });
  }

  // Create new organization unit
  async create(data: CreateOrgUnitInput) {
    return await db.orgUnit.create({
      data: {
        name: data.name,
        code: data.code,
        parent_id: data.parent_id,
        type: data.type,
        description: data.description,
        status: data.status,
        effective_from: data.effective_from ? new Date(data.effective_from) : null,
        effective_to: data.effective_to ? new Date(data.effective_to) : null,
      },
    });
  }

  // Update organization unit
  async update(id: number, data: UpdateOrgUnitInput) {
    return await db.orgUnit.update({
      where: { id },
      data: {
        ...data,
        effective_from: data.effective_from ? new Date(data.effective_from) : undefined,
        effective_to: data.effective_to ? new Date(data.effective_to) : undefined,
      },
    });
  }

  // "Delete" organization unit: update status to 'deleted'
  async delete(id: number) {
    return await db.orgUnit.update({
      where: { id },
      data: { status: 'deleted' },
    });
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

}
