import { ProgramRepository } from './programs.repo';
import {
  CreateProgramsSchema,
  UpdateProgramsSchema,
  ProgramsQuerySchema,
  type CreateProgramsInput,
  type UpdateProgramsInput,
  type ProgramsQuery,
} from './programs.schema';

export class ProgramService {
  private programRepo: ProgramRepository;

  constructor() {
    this.programRepo = new ProgramRepository();
  }

  async getAll(options: ProgramsQuery) {
    try {
      const validatedOptions = ProgramsQuerySchema.parse(options);
      const result = await this.programRepo.findAll(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch programs',
      };
    }
  }

  async getById(id: string) {
    try {
      const program = await this.programRepo.findById(id);
      
      if (!program) {
        return { success: false, error: 'Program not found' };
      }

      return { success: true, data: program };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch program',
      };
    }
  }

  async create(data: CreateProgramsInput) {
    try {
      const validatedData = CreateProgramsSchema.parse(data);
      const program = await this.programRepo.create(validatedData);
      
      return { success: true, data: program };
    } catch (error) {
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed')) {
          return {
            success: false,
            error: `Program với major_id "${data.major_id}" và version "${data.version}" đã tồn tại. Vui lòng chọn version khác hoặc major_id khác.`,
          };
        }
        
        if (error.message.includes('Foreign key constraint')) {
          return {
            success: false,
            error: `Major với ID "${data.major_id}" không tồn tại. Vui lòng chọn major_id hợp lệ.`,
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Failed to create program',
      };
    }
  }
  
  async update(id: string, data: UpdateProgramsInput) {
    try {
      const validatedData = UpdateProgramsSchema.parse(data);
      const program = await this.programRepo.update(id, validatedData);
      
      return { success: true, data: program };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update program',
      };
    }
  }

  // Simplified delete
  async delete(id: string) {
    try {
      await this.programRepo.delete(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete program',
      };
    }
  }
}
