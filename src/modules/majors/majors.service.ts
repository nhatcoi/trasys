import { MajorRepository } from './majors.repo';
import {
  CreateMajorSchema,
  UpdateMajorSchema,
  MajorQuerySchema,
  type CreateMajorInput,
  type UpdateMajorInput,
  type MajorQuery,
} from './majors.schema';

export class MajorService {
  private majorRepo: MajorRepository;

  constructor() {
    this.majorRepo = new MajorRepository();
  }

  // Simplified get all majors
  async getAllMajorsWithOptions(options: MajorQuery) {
    try {
      const validatedOptions = MajorQuerySchema.parse(options);
      const result = await this.majorRepo.findAllWithOptions(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch majors',
      };
    }
  }

  // Simplified get by ID
  async getMajorById(id: string) {
    try {
      const major = await this.majorRepo.findById(id);
      
      if (!major) {
        return { success: false, error: 'Major not found' };
      }

      return { success: true, data: major };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch major',
      };
    }
  }

  // Simplified create
  async createMajor(data: CreateMajorInput) {
    try {
      const validatedData = CreateMajorSchema.parse(data);
      const major = await this.majorRepo.create(validatedData);
      
      return { success: true, data: major };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create major',
      };
    }
  }

  // Simplified update
  async updateMajor(id: string, data: UpdateMajorInput) {
    try {
      const validatedData = UpdateMajorSchema.parse(data);
      const major = await this.majorRepo.update(id, validatedData);
      
      return { success: true, data: major };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update major',
      };
    }
  }

  // Simplified delete
  async deleteMajor(id: string) {
    try {
      await this.majorRepo.delete(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete major',
      };
    }
  }
}
