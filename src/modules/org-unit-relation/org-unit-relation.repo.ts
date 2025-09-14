import { db } from '@/lib/db';
import { 
  CreateOrgUnitRelationSchema, 
  UpdateOrgUnitRelationSchema,
  OrgUnitRelationQuerySchema,
  type CreateOrgUnitRelationInput,
  type UpdateOrgUnitRelationInput,
  type OrgUnitRelationQuery
} from './org-unit-relation.schema';

export class OrgUnitRelationRepository {
  // Find all org unit relations with pagination and filters
  async findAll(options: OrgUnitRelationQuery) {
    const { page, size, sort, order, search, parent_id, child_id, relation_type } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { note: { contains: search } },
        { relation_type: { contains: search } },
      ];
    }
    
    if (parent_id) {
      where.parent_id = BigInt(parent_id);
    }
    
    if (child_id) {
      where.child_id = BigInt(child_id);
    }
    
    if (relation_type) {
      where.relation_type = relation_type;
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.orgUnitRelation.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
        include: {
          parent: true,
          child: true,
        },
      }),
      db.orgUnitRelation.count({ where }),
    ]);

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      parent_id: item.parent_id.toString(),
      child_id: item.child_id.toString(),
      effective_from: item.effective_from?.toISOString(),
      effective_to: item.effective_to?.toISOString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
      parent: item.parent ? {
        ...item.parent,
        id: item.parent.id.toString(),
        parent_id: item.parent.parent_id?.toString(),
      } : null,
      child: item.child ? {
        ...item.child,
        id: item.child.id.toString(),
        parent_id: item.child.parent_id?.toString(),
      } : null,
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

  // Find by composite key (parent_id, child_id, relation_type, effective_from)
  async findById(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }) {
    const relation = await db.orgUnitRelation.findUnique({
      where: {
        parent_id_child_id_relation_type_effective_from: {
          parent_id: BigInt(params.parent_id),
          child_id: BigInt(params.child_id),
          relation_type: params.relation_type as any,
          effective_from: new Date(params.effective_from),
        },
      },
      include: {
        parent: true,
        child: true,
      },
    });

    if (!relation) return null;

    return {
      ...relation,
      parent_id: relation.parent_id.toString(),
      child_id: relation.child_id.toString(),
      effective_from: relation.effective_from?.toISOString(),
      effective_to: relation.effective_to?.toISOString(),
      created_at: relation.created_at?.toISOString(),
      updated_at: relation.updated_at?.toISOString(),
      parent: relation.parent ? {
        ...relation.parent,
        id: relation.parent.id.toString(),
        parent_id: relation.parent.parent_id?.toString(),
      } : null,
      child: relation.child ? {
        ...relation.child,
        id: relation.child.id.toString(),
        parent_id: relation.child.parent_id?.toString(),
      } : null,
    };
  }

  // Create new org unit relation
  async create(data: CreateOrgUnitRelationInput) {
    const created = await db.orgUnitRelation.create({
      data: {
        parent_id: BigInt(data.parent_id),
        child_id: BigInt(data.child_id),
        relation_type: data.relation_type,
        effective_from: data.effective_from ? new Date(data.effective_from) : new Date(),
        effective_to: data.effective_to ? new Date(data.effective_to) : null,
        note: data.note,
      },
      include: {
        parent: true,
        child: true,
      },
    });

    return {
      ...created,
      parent_id: created.parent_id.toString(),
      child_id: created.child_id.toString(),
      effective_from: created.effective_from?.toISOString(),
      effective_to: created.effective_to?.toISOString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
      parent: created.parent ? {
        ...created.parent,
        id: created.parent.id.toString(),
        parent_id: created.parent.parent_id?.toString(),
      } : null,
      child: created.child ? {
        ...created.child,
        id: created.child.id.toString(),
        parent_id: created.child.parent_id?.toString(),
      } : null,
    };
  }

  // Update org unit relation
  async update(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }, data: UpdateOrgUnitRelationInput) {
    const updated = await db.orgUnitRelation.update({
      where: {
        parent_id_child_id_relation_type_effective_from: {
          parent_id: BigInt(params.parent_id),
          child_id: BigInt(params.child_id),
          relation_type: params.relation_type as any,
          effective_from: new Date(params.effective_from),
        },
      },
      data: {
        relation_type: data.relation_type,
        effective_from: data.effective_from ? new Date(data.effective_from) : undefined,
        effective_to: data.effective_to ? new Date(data.effective_to) : undefined,
        note: data.note,
      },
      include: {
        parent: true,
        child: true,
      },
    });

    return {
      ...updated,
      parent_id: updated.parent_id.toString(),
      child_id: updated.child_id.toString(),
      effective_from: updated.effective_from?.toISOString(),
      effective_to: updated.effective_to?.toISOString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
      parent: updated.parent ? {
        ...updated.parent,
        id: updated.parent.id.toString(),
        parent_id: updated.parent.parent_id?.toString(),
      } : null,
      child: updated.child ? {
        ...updated.child,
        id: updated.child.id.toString(),
        parent_id: updated.child.parent_id?.toString(),
      } : null,
    };
  }

  // Delete org unit relation
  async delete(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }) {
    await db.orgUnitRelation.delete({
      where: {
        parent_id_child_id_relation_type_effective_from: {
          parent_id: BigInt(params.parent_id),
          child_id: BigInt(params.child_id),
          relation_type: params.relation_type as any,
          effective_from: new Date(params.effective_from),
        },
      },
    });
  }
}

