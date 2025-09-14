import { MajorOwnerHistoryRepository } from './major-owner-history.repo';
import {
  CreateMajorOwnerHistorySchema,
  UpdateMajorOwnerHistorySchema,
  MajorOwnerHistoryQuerySchema,
  type CreateMajorOwnerHistoryInput,
  type UpdateMajorOwnerHistoryInput,
  type MajorOwnerHistoryQuery,
} from './major-owner-history.schema';

export class MajorOwnerHistoryService {
  private majorOwnerHistoryRepo: MajorOwnerHistoryRepository;

  constructor() {
    this.majorOwnerHistoryRepo = new MajorOwnerHistoryRepository();
  }

  async getAll(options: MajorOwnerHistoryQuery) {
    try {
      const validatedOptions = MajorOwnerHistoryQuerySchema.parse(options);
      const result = await this.majorOwnerHistoryRepo.findAll(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch major owner histories',
      };
    }
  }

  async getById(id: string) {
    try {
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.findById(id);
      
      if (!majorOwnerHistory) {
        return { success: false, error: 'Major owner history not found' };
      }
      
      return { success: true, data: majorOwnerHistory };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch major owner history',
      };
    }
  }

  async create(data: CreateMajorOwnerHistoryInput) {
    try {
      const validatedData = CreateMajorOwnerHistorySchema.parse(data);
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.create(validatedData);
      
      return { success: true, data: majorOwnerHistory };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Foreign key constraint')) {
          if (error.message.includes('major_owner_history_major_id_fkey')) {
            return {
              success: false,
              error: `Major với ID "${data.major_id}" không tồn tại. Vui lòng chọn major_id hợp lệ.`,
            };
          }
          
          if (error.message.includes('major_owner_history_org_unit_id_fkey')) {
            return {
              success: false,
              error: `Org unit với ID "${data.org_unit_id}" không tồn tại. Vui lòng chọn org_unit_id hợp lệ.`,
            };
          }
          
          return {
            success: false,
            error: `Foreign key constraint violated. Vui lòng kiểm tra major_id và org_unit_id.`,
          };
        }
        
        if (error.message.includes('Unique constraint failed')) {
          return {
            success: false,
            error: `Major owner history với major_id "${data.major_id}" và org_unit_id "${data.org_unit_id}" đã tồn tại trong khoảng thời gian này.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to create major owner history',
      };
    }
  }

  async update(id: string, data: UpdateMajorOwnerHistoryInput) {
    try {
      const validatedData = UpdateMajorOwnerHistorySchema.parse(data);
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.update(id, validatedData);
      
      return { success: true, data: majorOwnerHistory };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Foreign key constraint')) {
          if (error.message.includes('major_owner_history_major_id_fkey')) {
            return {
              success: false,
              error: `Major với ID "${data.major_id}" không tồn tại. Vui lòng chọn major_id hợp lệ.`,
            };
          }
          
          if (error.message.includes('major_owner_history_org_unit_id_fkey')) {
            return {
              success: false,
              error: `Org unit với ID "${data.org_unit_id}" không tồn tại. Vui lòng chọn org_unit_id hợp lệ.`,
            };
          }
          
          return {
            success: false,
            error: `Foreign key constraint violated. Vui lòng kiểm tra major_id và org_unit_id.`,
          };
        }
        
        if (error.message.includes('Unique constraint failed')) {
          return {
            success: false,
            error: `Major owner history với major_id "${data.major_id}" và org_unit_id "${data.org_unit_id}" đã tồn tại trong khoảng thời gian này.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to update major owner history',
      };
    }
  }

  async delete(id: string) {
    try {
      await this.majorOwnerHistoryRepo.delete(id);
      
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete major owner history',
      };
    }
  }
}