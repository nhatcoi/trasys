import { OrgStructureRequestRepository } from './org-structure-request.repo';
import {
  OrgStructureRequestSchema,
  CreateOrgStructureRequestSchema,
  UpdateOrgStructureRequestSchema,
  OrgStructureRequestQuerySchema,
  type OrgStructureRequest,
  type CreateOrgStructureRequestInput,
  type UpdateOrgStructureRequestInput,
  type OrgStructureRequestQuery,
  type OrgStructureRequestResponse,
  type OrgStructureRequestListResponse,
} from './org-structure-request.schema';

export class OrgStructureRequestService {
  private orgStructureRequestRepo: OrgStructureRequestRepository;

  constructor() {
    this.orgStructureRequestRepo = new OrgStructureRequestRepository();
  }

  // Get all org structure requests with options
  async getAllOrgStructureRequestsWithOptions(options: OrgStructureRequestQuery): Promise<OrgStructureRequestListResponse> {
    try {
      const validatedOptions = OrgStructureRequestQuerySchema.parse(options);
      const result = await this.orgStructureRequestRepo.findAllWithOptions(validatedOptions);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            page: 1,
            size: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        error: error instanceof Error ? error.message : 'Failed to fetch org structure requests',
      };
    }
  }

  // Get org structure request by ID
  async getOrgStructureRequestById(id: string): Promise<OrgStructureRequestResponse> {
    try {
      const orgStructureRequest = await this.orgStructureRequestRepo.findById(id);
      
      if (!orgStructureRequest) {
        return {
          success: false,
          error: 'Org structure request not found',
        };
      }

      return {
        success: true,
        data: orgStructureRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org structure request',
      };
    }
  }

  // Create new org structure request
  async createOrgStructureRequest(data: CreateOrgStructureRequestInput): Promise<OrgStructureRequestResponse> {
    try {
      const validatedData = CreateOrgStructureRequestSchema.parse(data);
      const orgStructureRequest = await this.orgStructureRequestRepo.create(validatedData);
      
      return {
        success: true,
        data: orgStructureRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create org structure request',
      };
    }
  }

  // Update org structure request
  async updateOrgStructureRequest(id: string, data: UpdateOrgStructureRequestInput): Promise<OrgStructureRequestResponse> {
    try {
      const validatedData = UpdateOrgStructureRequestSchema.parse(data);
      const orgStructureRequest = await this.orgStructureRequestRepo.update(id, validatedData);
      
      return {
        success: true,
        data: orgStructureRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update org structure request',
      };
    }
  }

  // Delete org structure request
  async deleteOrgStructureRequest(id: string): Promise<OrgStructureRequestResponse> {
    try {
      await this.orgStructureRequestRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete org structure request',
      };
    }
  }
}
