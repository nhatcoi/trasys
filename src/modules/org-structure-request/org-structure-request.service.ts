import { OrgStructureRequestRepository } from './org-structure-request.repo';
import {
  CreateOrgStructureRequestSchema,
  UpdateOrgStructureRequestSchema,
  OrgStructureRequestQuerySchema,
  type CreateOrgStructureRequestInput,
  type UpdateOrgStructureRequestInput,
  type OrgStructureRequestQuery,
} from './org-structure-request.schema';

export class OrgStructureRequestService {
  private orgStructureRequestRepo: OrgStructureRequestRepository;

  constructor() {
    this.orgStructureRequestRepo = new OrgStructureRequestRepository();
  }

  async getAll(options: OrgStructureRequestQuery) {
    try {
      const validatedOptions = OrgStructureRequestQuerySchema.parse(options);
      const result = await this.orgStructureRequestRepo.findAll(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org structure requests',
      };
    }
  }

  async getById(id: string) {
    try {
      const orgStructureRequest = await this.orgStructureRequestRepo.findById(id);
      
      if (!orgStructureRequest) {
        return { success: false, error: 'Org structure request not found' };
      }
      
      return { success: true, data: orgStructureRequest };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org structure request',
      };
    }
  }

  async create(data: CreateOrgStructureRequestInput) {
    try {
      const validatedData = CreateOrgStructureRequestSchema.parse(data);
      const orgStructureRequest = await this.orgStructureRequestRepo.create(validatedData);
      
      return { success: true, data: orgStructureRequest };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Argument `payload` is missing')) {
          return {
            success: false,
            error: 'Payload là trường bắt buộc. Vui lòng cung cấp dữ liệu JSON cho payload.',
          };
        }
        
        if (error.message.includes('Foreign key constraint')) {
          if (error.message.includes('requester_id')) {
            return {
              success: false,
              error: `Requester với ID "${data.requester_id}" không tồn tại. Vui lòng chọn requester_id hợp lệ.`,
            };
          }
          
          if (error.message.includes('target_org_unit_id')) {
            return {
              success: false,
              error: `Org unit với ID "${data.target_org_unit_id}" không tồn tại. Vui lòng chọn target_org_unit_id hợp lệ.`,
            };
          }
          
          return {
            success: false,
            error: `Foreign key constraint violated. Vui lòng kiểm tra requester_id và target_org_unit_id.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to create org structure request',
      };
    }
  }

  async update(id: string, data: UpdateOrgStructureRequestInput) {
    try {
      const validatedData = UpdateOrgStructureRequestSchema.parse(data);
      const orgStructureRequest = await this.orgStructureRequestRepo.update(id, validatedData);
      
      return { success: true, data: orgStructureRequest };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Foreign key constraint')) {
          if (error.message.includes('requester_id')) {
            return {
              success: false,
              error: `Requester với ID "${data.requester_id}" không tồn tại. Vui lòng chọn requester_id hợp lệ.`,
            };
          }
          
          if (error.message.includes('target_org_unit_id')) {
            return {
              success: false,
              error: `Org unit với ID "${data.target_org_unit_id}" không tồn tại. Vui lòng chọn target_org_unit_id hợp lệ.`,
            };
          }
          
          return {
            success: false,
            error: `Foreign key constraint violated. Vui lòng kiểm tra requester_id và target_org_unit_id.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to update org structure request',
      };
    }
  }

  async delete(id: string) {
    try {
      await this.orgStructureRequestRepo.delete(id);
      
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete org structure request',
      };
    }
  }
}