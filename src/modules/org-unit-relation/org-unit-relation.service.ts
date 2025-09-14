import { OrgUnitRelationRepository } from './org-unit-relation.repo';
import {
  CreateOrgUnitRelationSchema,
  UpdateOrgUnitRelationSchema,
  OrgUnitRelationQuerySchema,
  type CreateOrgUnitRelationInput,
  type UpdateOrgUnitRelationInput,
  type OrgUnitRelationQuery,
} from './org-unit-relation.schema';

export class OrgUnitRelationService {
  private orgUnitRelationRepo: OrgUnitRelationRepository;

  constructor() {
    this.orgUnitRelationRepo = new OrgUnitRelationRepository();
  }

  async getAll(options: OrgUnitRelationQuery) {
    try {
      const validatedOptions = OrgUnitRelationQuerySchema.parse(options);
      const result = await this.orgUnitRelationRepo.findAll(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org unit relations',
      };
    }
  }

  async getById(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }) {
    try {
      const orgUnitRelation = await this.orgUnitRelationRepo.findById(params);
      
      if (!orgUnitRelation) {
        return { success: false, error: 'Org unit relation not found' };
      }
      
      return { success: true, data: orgUnitRelation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org unit relation',
      };
    }
  }

  async create(data: CreateOrgUnitRelationInput) {
    try {
      const validatedData = CreateOrgUnitRelationSchema.parse(data);
      const orgUnitRelation = await this.orgUnitRelationRepo.create(validatedData);
      
      return { success: true, data: orgUnitRelation };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Foreign key constraint')) {
          if (error.message.includes('parent_id')) {
            return {
              success: false,
              error: `Parent unit với ID "${data.parent_id}" không tồn tại. Vui lòng chọn parent_id hợp lệ.`,
            };
          }
          
          if (error.message.includes('child_id')) {
            return {
              success: false,
              error: `Child unit với ID "${data.child_id}" không tồn tại. Vui lòng chọn child_id hợp lệ.`,
            };
          }
          
          return {
            success: false,
            error: `Foreign key constraint violated. Vui lòng kiểm tra parent_id và child_id.`,
          };
        }
        
        if (error.message.includes('Unique constraint failed')) {
          return {
            success: false,
            error: `Quan hệ giữa đơn vị "${data.parent_id}" và "${data.child_id}" với loại "${data.relation_type}" đã tồn tại trong khoảng thời gian này.`,
          };
        }
        
        if (error.message.includes('parent_id and child_id must be different')) {
          return {
            success: false,
            error: 'Không thể tạo quan hệ giữa đơn vị với chính nó. Parent ID và Child ID phải khác nhau.',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to create org unit relation',
      };
    }
  }

  async update(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }, data: UpdateOrgUnitRelationInput) {
    try {
      const validatedData = UpdateOrgUnitRelationSchema.parse(data);
      const orgUnitRelation = await this.orgUnitRelationRepo.update(params, validatedData);
      
      return { success: true, data: orgUnitRelation };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Record to update not found')) {
          return {
            success: false,
            error: 'Không tìm thấy quan hệ cần cập nhật.',
          };
        }
        
        if (error.message.includes('Unique constraint failed')) {
          return {
            success: false,
            error: `Quan hệ với thông tin cập nhật đã tồn tại. Vui lòng kiểm tra lại thông tin.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to update org unit relation',
      };
    }
  }

  async delete(params: {
    parent_id: string;
    child_id: string;
    relation_type: string;
    effective_from: string;
  }) {
    try {
      await this.orgUnitRelationRepo.delete(params);
      
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete org unit relation',
      };
    }
  }
}

