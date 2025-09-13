import { OrgUnitRepository } from './org.repo';
import { 
  CreateOrgUnitInput, 
  UpdateOrgUnitInput, 
  OrgUnitQuery,
  OrgUnitWithRelationsSchema,
  OrgUnitSchema
} from './org.schema';
import { ApiResponseSchema } from '@/lib/schemas';

export class OrgUnitService {
  private repo: OrgUnitRepository;

  constructor() {
    this.repo = new OrgUnitRepository();
  }

  // Serialize BigInt to string for JSON response
  private serializeBigInt(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  // Get all organization units (lazy - no relations)
  async getAllUnits() {
    try {
      const units = await this.repo.findAll();
      const serializedUnits = this.serializeBigInt(units);
      
      // Validate output (basic schema without relations)
      const validatedUnits = (serializedUnits as unknown[]).map((unit: unknown) => 
        OrgUnitSchema.parse(unit)
      );

      return ApiResponseSchema.parse({
        success: true,
        data: validatedUnits,
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch organization units',
      });
    }
  }

  // Get all organization units with options (search, filter, pagination)
  async getAllUnitsWithOptions(options: OrgUnitQuery) {
    try {
      // Get data and count in parallel
      const [units, total] = await Promise.all([
        this.repo.findAllWithOptions(options),
        this.repo.countWithOptions(options)
      ]);
      
      const serializedUnits = this.serializeBigInt(units);
      
      // Choose schema based on what relations are included
      const hasRelations = options.include_children || options.include_employees || options.include_parent;
      const schema = hasRelations ? OrgUnitWithRelationsSchema : OrgUnitSchema;
      
      const validatedUnits = (serializedUnits as unknown[]).map((unit: unknown) => 
        schema.parse(unit)
      );

      // Calculate pagination info
      const totalPages = Math.ceil(total / options.size);
      const hasNextPage = options.page < totalPages;
      const hasPrevPage = options.page > 1;

      return ApiResponseSchema.parse({
        success: true,
        data: {
          items: validatedUnits,
          pagination: {
            page: options.page,
            size: options.size,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
          filters: {
            search: options.search,
            status: options.status,
            type: options.type,
            fromDate: options.fromDate,
            toDate: options.toDate,
          },
          sorting: {
            sort: options.sort,
            order: options.order,
          },
        },
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch organization units',
      });
    }
  }

  // Get organization unit by ID
  async getUnitById(id: number) {
    try {
      const unit = await this.repo.findById(id);
      
      if (!unit) {
        return ApiResponseSchema.parse({
          success: false,
          error: 'Organization unit not found',
        });
      }

      const serializedUnit = this.serializeBigInt(unit);
      const validatedUnit = OrgUnitWithRelationsSchema.parse(serializedUnit);

      return ApiResponseSchema.parse({
        success: true,
        data: validatedUnit,
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch organization unit',
      });
    }
  }

  // Create new organization unit
  async createUnit(data: CreateOrgUnitInput) {
    try {
      const unit = await this.repo.create(data);
      const serializedUnit = this.serializeBigInt(unit);
      const validatedUnit = OrgUnitWithRelationsSchema.parse(serializedUnit);

      return ApiResponseSchema.parse({
        success: true,
        data: validatedUnit,
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create organization unit',
      });
    }
  }

  // Update organization unit
  async updateUnit(id: number, data: UpdateOrgUnitInput) {
    try {
      const unit = await this.repo.update(id, data);
      const serializedUnit = this.serializeBigInt(unit);
      const validatedUnit = OrgUnitWithRelationsSchema.parse(serializedUnit);

      return ApiResponseSchema.parse({
        success: true,
        data: validatedUnit,
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update organization unit',
      });
    }
  }

  // Delete organization unit
  async deleteUnit(id: number) {
    try {
      await this.repo.delete(id);
      return ApiResponseSchema.parse({
        success: true,
        data: { message: 'Organization unit deleted successfully' },
      });
    } catch (error) {
      console.error('Service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete organization unit',
      });
    }
  }
}
