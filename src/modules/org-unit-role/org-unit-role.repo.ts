import { db } from '@/lib/db';
import { 
  OrgUnitRoleSchema, 
  CreateOrgUnitRoleSchema, 
  UpdateOrgUnitRoleSchema,
  OrgUnitRoleQuerySchema,
  type OrgUnitRole,
  type CreateOrgUnitRoleInput,
  type UpdateOrgUnitRoleInput,
  type OrgUnitRoleQuery
} from './org-unit-role.schema';

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
      db.org_unit_role.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.org_unit_role.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
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
    const item = await db.org_unit_role.findUnique({
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
    const created = await db.org_unit_role.create({
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
    const updated = await db.org_unit_role.update({
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
    await db.org_unit_role.delete({
      where: { id: BigInt(id) },
    });
  }
}
