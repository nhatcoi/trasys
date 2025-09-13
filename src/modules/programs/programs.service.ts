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

  // Simplified get all programs
  async getAllProgramsWithOptions(options: ProgramsQuery) {
    try {
      const validatedOptions = ProgramsQuerySchema.parse(options);
      const result = await this.programRepo.findAllWithOptions(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch programs',
      };
    }
  }

  // Simplified get by ID
  async getProgramById(id: string) {
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

  // Simplified create
  async createProgram(data: CreateProgramsInput) {
    try {
      const validatedData = CreateProgramsSchema.parse(data);
      const program = await this.programRepo.create(validatedData);
      
      return { success: true, data: program };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create program',
      };
    }
  }

  // Simplified update
  async updateProgram(id: string, data: UpdateProgramsInput) {
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
  async deleteProgram(id: string) {
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
