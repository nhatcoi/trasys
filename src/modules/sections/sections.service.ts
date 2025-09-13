import { SectionRepository } from './sections.repo';
import {
  SectionSchema,
  CreateSectionSchema,
  UpdateSectionSchema,
  SectionQuerySchema,
  type Section,
  type CreateSectionInput,
  type UpdateSectionInput,
  type SectionQuery,
  type SectionResponse,
  type SectionListResponse,
} from './sections.schema';

export class SectionService {
  private sectionRepo: SectionRepository;

  constructor() {
    this.sectionRepo = new SectionRepository();
  }

  // Get all sections with options
  async getAllSectionsWithOptions(options: SectionQuery): Promise<SectionListResponse> {
    try {
      const validatedOptions = SectionQuerySchema.parse(options);
      const result = await this.sectionRepo.findAllWithOptions(validatedOptions);
      
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
        error: error instanceof Error ? error.message : 'Failed to fetch sections',
      };
    }
  }

  // Get section by ID
  async getSectionById(id: string): Promise<SectionResponse> {
    try {
      const section = await this.sectionRepo.findById(id);
      
      if (!section) {
        return {
          success: false,
          error: 'Section not found',
        };
      }

      return {
        success: true,
        data: section,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch section',
      };
    }
  }

  // Create new section
  async createSection(data: CreateSectionInput): Promise<SectionResponse> {
    try {
      const validatedData = CreateSectionSchema.parse(data);
      const section = await this.sectionRepo.create(validatedData);
      
      return {
        success: true,
        data: section,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create section',
      };
    }
  }

  // Update section
  async updateSection(id: string, data: UpdateSectionInput): Promise<SectionResponse> {
    try {
      const validatedData = UpdateSectionSchema.parse(data);
      const section = await this.sectionRepo.update(id, validatedData);
      
      return {
        success: true,
        data: section,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update section',
      };
    }
  }

  // Delete section
  async deleteSection(id: string): Promise<SectionResponse> {
    try {
      await this.sectionRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete section',
      };
    }
  }
}
