import { OrgUnitRoleRepository } from './org-unit-role.repo';
import {
  OrgUnitRoleSchema,
  CreateOrgUnitRoleSchema,
  UpdateOrgUnitRoleSchema,
  OrgUnitRoleQuerySchema,
  type OrgUnitRole,
  type CreateOrgUnitRoleInput,
  type UpdateOrgUnitRoleInput,
  type OrgUnitRoleQuery,
  type OrgUnitRoleResponse,
  type OrgUnitRoleListResponse,
} from './org-unit-role.schema';

export class OrgUnitRoleService {
  private orgUnitRoleRepo: OrgUnitRoleRepository;

  constructor() {
    this.orgUnitRoleRepo = new OrgUnitRoleRepository();
  }

  // Get all org unit roles with options
  async getAllOrgUnitRolesWithOptions(options: OrgUnitRoleQuery): Promise<OrgUnitRoleListResponse> {
    try {
      const validatedOptions = OrgUnitRoleQuerySchema.parse(options);
      const result = await this.orgUnitRoleRepo.findAllWithOptions(validatedOptions);
      
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
        error: error instanceof Error ? error.message : 'Failed to fetch org unit roles',
      };
    }
  }

  // Get org unit role by ID
  async getOrgUnitRoleById(id: string): Promise<OrgUnitRoleResponse> {
    try {
      const orgUnitRole = await this.orgUnitRoleRepo.findById(id);
      
      if (!orgUnitRole) {
        return {
          success: false,
          error: 'Org unit role not found',
        };
      }

      return {
        success: true,
        data: orgUnitRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch org unit role',
      };
    }
  }

  // Create new org unit role
  async createOrgUnitRole(data: CreateOrgUnitRoleInput): Promise<OrgUnitRoleResponse> {
    try {
      const validatedData = CreateOrgUnitRoleSchema.parse(data);
      const orgUnitRole = await this.orgUnitRoleRepo.create(validatedData);
      
      return {
        success: true,
        data: orgUnitRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create org unit role',
      };
    }
  }

  // Update org unit role
  async updateOrgUnitRole(id: string, data: UpdateOrgUnitRoleInput): Promise<OrgUnitRoleResponse> {
    try {
      const validatedData = UpdateOrgUnitRoleSchema.parse(data);
      const orgUnitRole = await this.orgUnitRoleRepo.update(id, validatedData);
      
      return {
        success: true,
        data: orgUnitRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update org unit role',
      };
    }
  }

  // Delete org unit role
  async deleteOrgUnitRole(id: string): Promise<OrgUnitRoleResponse> {
    try {
      await this.orgUnitRoleRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete org unit role',
      };
    }
  }
}
