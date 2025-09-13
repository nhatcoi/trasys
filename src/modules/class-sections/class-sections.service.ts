import { ClassSectionRepository } from './class-sections.repo';
import {
  ClassSectionSchema,
  CreateClassSectionSchema,
  UpdateClassSectionSchema,
  ClassSectionQuerySchema,
  type ClassSection,
  type CreateClassSectionInput,
  type UpdateClassSectionInput,
  type ClassSectionQuery,
  type ClassSectionResponse,
  type ClassSectionListResponse,
} from './class-sections.schema';

export class ClassSectionService {
  private classSectionRepo: ClassSectionRepository;

  constructor() {
    this.classSectionRepo = new ClassSectionRepository();
  }

  // Get all class sections with options
  async getAllClassSectionsWithOptions(options: ClassSectionQuery): Promise<ClassSectionListResponse> {
    try {
      const validatedOptions = ClassSectionQuerySchema.parse(options);
      const result = await this.classSectionRepo.findAllWithOptions(validatedOptions);
      
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
        error: error instanceof Error ? error.message : 'Failed to fetch class sections',
      };
    }
  }

  // Get class section by ID
  async getClassSectionById(id: string): Promise<ClassSectionResponse> {
    try {
      const classSection = await this.classSectionRepo.findById(id);
      
      if (!classSection) {
        return {
          success: false,
          error: 'Class section not found',
        };
      }

      return {
        success: true,
        data: classSection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch class section',
      };
    }
  }

  // Create new class section
  async createClassSection(data: CreateClassSectionInput): Promise<ClassSectionResponse> {
    try {
      const validatedData = CreateClassSectionSchema.parse(data);
      const classSection = await this.classSectionRepo.create(validatedData);
      
      return {
        success: true,
        data: classSection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create class section',
      };
    }
  }

  // Update class section
  async updateClassSection(id: string, data: UpdateClassSectionInput): Promise<ClassSectionResponse> {
    try {
      const validatedData = UpdateClassSectionSchema.parse(data);
      const classSection = await this.classSectionRepo.update(id, validatedData);
      
      return {
        success: true,
        data: classSection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update class section',
      };
    }
  }

  // Delete class section
  async deleteClassSection(id: string): Promise<ClassSectionResponse> {
    try {
      await this.classSectionRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete class section',
      };
    }
  }
}
