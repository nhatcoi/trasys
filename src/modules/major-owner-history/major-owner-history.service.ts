import { MajorOwnerHistoryRepository } from './major-owner-history.repo';
import {
  MajorOwnerHistorySchema,
  CreateMajorOwnerHistorySchema,
  UpdateMajorOwnerHistorySchema,
  MajorOwnerHistoryQuerySchema,
  type MajorOwnerHistory,
  type CreateMajorOwnerHistoryInput,
  type UpdateMajorOwnerHistoryInput,
  type MajorOwnerHistoryQuery,
  type MajorOwnerHistoryResponse,
  type MajorOwnerHistoryListResponse,
} from './major-owner-history.schema';

export class MajorOwnerHistoryService {
  private majorOwnerHistoryRepo: MajorOwnerHistoryRepository;

  constructor() {
    this.majorOwnerHistoryRepo = new MajorOwnerHistoryRepository();
  }

  // Get all major owner histories with options
  async getAllMajorOwnerHistoriesWithOptions(options: MajorOwnerHistoryQuery): Promise<MajorOwnerHistoryListResponse> {
    try {
      const validatedOptions = MajorOwnerHistoryQuerySchema.parse(options);
      const result = await this.majorOwnerHistoryRepo.findAllWithOptions(validatedOptions);
      
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
        error: error instanceof Error ? error.message : 'Failed to fetch major owner histories',
      };
    }
  }

  // Get major owner history by ID
  async getMajorOwnerHistoryById(id: string): Promise<MajorOwnerHistoryResponse> {
    try {
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.findById(id);
      
      if (!majorOwnerHistory) {
        return {
          success: false,
          error: 'Major owner history not found',
        };
      }

      return {
        success: true,
        data: majorOwnerHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch major owner history',
      };
    }
  }

  // Create new major owner history
  async createMajorOwnerHistory(data: CreateMajorOwnerHistoryInput): Promise<MajorOwnerHistoryResponse> {
    try {
      const validatedData = CreateMajorOwnerHistorySchema.parse(data);
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.create(validatedData);
      
      return {
        success: true,
        data: majorOwnerHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create major owner history',
      };
    }
  }

  // Update major owner history
  async updateMajorOwnerHistory(id: string, data: UpdateMajorOwnerHistoryInput): Promise<MajorOwnerHistoryResponse> {
    try {
      const validatedData = UpdateMajorOwnerHistorySchema.parse(data);
      const majorOwnerHistory = await this.majorOwnerHistoryRepo.update(id, validatedData);
      
      return {
        success: true,
        data: majorOwnerHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update major owner history',
      };
    }
  }

  // Delete major owner history
  async deleteMajorOwnerHistory(id: string): Promise<MajorOwnerHistoryResponse> {
    try {
      await this.majorOwnerHistoryRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete major owner history',
      };
    }
  }
}
