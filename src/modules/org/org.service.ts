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

  // Get all organization units with options (search, filter, pagination)
  async getAll(options: OrgUnitQuery) {
    try {
      // Get data and count in parallel
      const [units, total] = await Promise.all([
        this.repo.findAll(options),
        this.repo.count(options)
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
  async getById(id: number) {
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
  async create(data: CreateOrgUnitInput) {
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
  async update(id: number, data: UpdateOrgUnitInput) {
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
  async delete(id: number) {
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
