import { SectionRepository } from './sections.repo';
import {
  CreateSectionsSchema,
  UpdateSectionsSchema,
  SectionsQuerySchema,
  type CreateSectionsInput,
  type UpdateSectionsInput,
  type SectionsQuery,
} from './sections.schema';

export class SectionService {
  private sectionRepo: SectionRepository;

  constructor() {
    this.sectionRepo = new SectionRepository();
  }

  async getAll(options: SectionsQuery) {
    try {
      const validatedOptions = SectionsQuerySchema.parse(options);
      const result = await this.sectionRepo.findAll(validatedOptions);
      
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sections',
      };
    }
  }

  async getById(id: string) {
    try {
      const section = await this.sectionRepo.findById(id);
      
      if (!section) {
        return { success: false, error: 'Section not found' };
      }
      
      return { success: true, data: section };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch section',
      };
    }
  }

  async create(data: CreateSectionsInput) {
    try {
      const validatedData = CreateSectionsSchema.parse(data);
      const section = await this.sectionRepo.create(validatedData);
      
      return { success: true, data: section };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create section',
      };
    }
  }

  async update(id: string, data: UpdateSectionsInput) {
    try {
      const validatedData = UpdateSectionsSchema.parse(data);
      const section = await this.sectionRepo.update(id, validatedData);
      
      return { success: true, data: section };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update section',
      };
    }
  }

  async delete(id: string) {
    try {
      await this.sectionRepo.delete(id);
      
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete section',
      };
    }
  }
}