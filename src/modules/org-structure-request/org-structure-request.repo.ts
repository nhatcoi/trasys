import { db } from '@/lib/db';
import { 
  OrgStructureRequestSchema, 
  CreateOrgStructureRequestSchema, 
  UpdateOrgStructureRequestSchema,
  OrgStructureRequestQuerySchema,
  type OrgStructureRequest,
  type CreateOrgStructureRequestInput,
  type UpdateOrgStructureRequestInput,
  type OrgStructureRequestQuery
} from './org-structure-request.schema';

export class OrgStructureRequestRepository {
  // Find all org structure requests with pagination and filters
  async findAll(options: OrgStructureRequestQuery) {
    const { page, size, sort, order, search, request_type, status, target_org_unit_id, requester_id } = options;
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { request_type: { contains: search } },
        { status: { contains: search } },
      ];
    }
    
    if (request_type) {
      where.request_type = request_type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (target_org_unit_id) {
      where.target_org_unit_id = BigInt(target_org_unit_id);
    }
    
    if (requester_id) {
      where.requester_id = BigInt(requester_id);
    }

    // Execute query
    const [items, total] = await Promise.all([
      db.orgStructureRequest.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sort]: order },
      }),
      db.orgStructureRequest.count({ where }),
    ]);

    // Serialize all IDs for consistency
    const serializedItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
      requester_id: item.requester_id?.toString(),
      target_org_unit_id: item.target_org_unit_id?.toString(),
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
  async findById(id: string): Promise<OrgStructureRequest | null> {
    const item = await db.orgStructureRequest.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) return null;

    return {
      ...item,
      id: item.id.toString(),
      requester_id: item.requester_id?.toString(),
      target_org_unit_id: item.target_org_unit_id?.toString(),
      created_at: item.created_at?.toISOString(),
      updated_at: item.updated_at?.toISOString(),
    };
  }

  // Create new org structure request
  async create(data: CreateOrgStructureRequestInput): Promise<OrgStructureRequest> {
    const created = await db.orgStructureRequest.create({
      data: {
        requester_id: data.requester_id ? BigInt(data.requester_id) : null,
        request_type: data.request_type,
        target_org_unit_id: data.target_org_unit_id ? BigInt(data.target_org_unit_id) : null,
        payload: data.payload,
        status: data.status,
        workflow_step: data.workflow_step,
      },
    });

    return {
      ...created,
      id: created.id.toString(),
      requester_id: created.requester_id?.toString(),
      target_org_unit_id: created.target_org_unit_id?.toString(),
      created_at: created.created_at?.toISOString(),
      updated_at: created.updated_at?.toISOString(),
    };
  }

  // Update org structure request
  async update(id: string, data: UpdateOrgStructureRequestInput): Promise<OrgStructureRequest> {
    const updated = await db.orgStructureRequest.update({
      where: { id: BigInt(id) },
      data: {
        requester_id: data.requester_id ? BigInt(data.requester_id) : undefined,
        request_type: data.request_type,
        target_org_unit_id: data.target_org_unit_id ? BigInt(data.target_org_unit_id) : undefined,
        payload: data.payload,
        status: data.status,
        workflow_step: data.workflow_step,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      requester_id: updated.requester_id?.toString(),
      target_org_unit_id: updated.target_org_unit_id?.toString(),
      created_at: updated.created_at?.toISOString(),
      updated_at: updated.updated_at?.toISOString(),
    };
  }

  // Delete org structure request
  async delete(id: string): Promise<void> {
    await db.orgStructureRequest.delete({
      where: { id: BigInt(id) },
    });
  }
}
