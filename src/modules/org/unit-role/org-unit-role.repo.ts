import { db } from '@/lib/db';

// Types
interface OrgUnitRoleQuery {
  page: number;
  size: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  org_unit_id?: string;
  role_code?: string;
}

interface CreateOrgUnitRoleInput {
  org_unit_id: string;
  role_code: string;
  role_name: string;
  description?: string;
  is_active?: boolean;
}

interface UpdateOrgUnitRoleInput {
  role_name?: string;
  description?: string;
  is_active?: boolean;
}

interface OrgUnitRole {
  id: string;
  org_unit_id: string;
  role_code: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class OrgUnitRoleRepository {
  // Find all org unit roles with pagination and filters
  async findAllWithOptions(options: OrgUnitRoleQuery) {
    const { page, size, sort, order, search, org_unit_id, role_code } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { role_code: { contains: search } },
        { title: { contains: search } },
      ];
    }
    
    if (org_unit_id) {
      where.org_unit_id = BigInt(org_unit_id);
    }
    
    if (role_code) {
      where.role_code = role_code;
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.OrgUnitRole.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.OrgUnitRole.count({ where }),
    ]);

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
      created_at: item.created_at?.toISOString(),
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
  async findById(id: string): Promise<OrgUnitRole | null> {
    const item = await db.OrgUnitRole.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      org_unit_id: item.org_unit_id?.toString(),
      created_at: item.created_at?.toISOString(),
    };
  }

  // Create new org unit role
  async create(data: CreateOrgUnitRoleInput): Promise<OrgUnitRole> {
    const created = await db.OrgUnitRole.create({
      data: {
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : null,
        role_code: data.role_code,
        title: data.title,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      org_unit_id: created.org_unit_id?.toString(),
      created_at: created.created_at?.toISOString(),
    };
  }

  // Update org unit role
  async update(id: string, data: UpdateOrgUnitRoleInput): Promise<OrgUnitRole> {
    const updated = await db.OrgUnitRole.update({
      where: { id: BigInt(id) },
      data: {
        org_unit_id: data.org_unit_id ? BigInt(data.org_unit_id) : undefined,
        role_code: data.role_code,
        title: data.title,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      org_unit_id: updated.org_unit_id?.toString(),
      created_at: updated.created_at?.toISOString(),
    };
  }

  // Delete org unit role
  async delete(id: string): Promise<void> {
    await db.OrgUnitRole.delete({
      where: { id: BigInt(id) },
    });
  }
}
