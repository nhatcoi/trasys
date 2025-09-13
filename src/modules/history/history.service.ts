import { HistoryRepository } from './history.repo';
import { 
  HistoryQuery,
  OrgUnitHistorySchema
} from './history.schema';
import { ApiResponseSchema } from '@/lib/schemas';

export class HistoryService {
  private repo: HistoryRepository;

  constructor() {
    this.repo = new HistoryRepository();
  }

  // Serialize BigInt to string for JSON response
  private serializeBigInt(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  // Get history records with options (search, filter, pagination)
  async getAll(options: HistoryQuery) {
    try {
      // Get data and count in parallel
      const [history, total] = await Promise.all([
        this.repo.findAll(options),
        this.repo.count(options)
      ]);
      
      const serializedHistory = this.serializeBigInt(history);
      
      const validatedHistory = (serializedHistory as unknown[]).map((record: unknown) => 
        OrgUnitHistorySchema.parse(record)
      );

      // Calculate pagination info
      const totalPages = Math.ceil(total / options.size);
      const hasNextPage = options.page < totalPages;
      const hasPrevPage = options.page > 1;

      return ApiResponseSchema.parse({
        success: true,
        data: {
          items: validatedHistory,
          pagination: {
            page: options.page,
            size: options.size,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
          filters: {
            org_unit_id: options.org_unit_id,
            change_type: options.change_type,
            fromDate: options.from_date,
            toDate: options.to_date,
          },
          sorting: {
            sort: options.sort,
            order: options.order,
          },
        },
      });
    } catch (error) {
      console.error('History service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history records',
      });
    }
  }

  // Get history record by ID
  async getById(id: number) {
    try {
      const history = await this.repo.findById(id);
      
      if (!history) {
        return ApiResponseSchema.parse({
          success: false,
          error: 'History record not found',
        });
      }

      const serializedHistory = this.serializeBigInt(history);
      const validatedHistory = OrgUnitHistorySchema.parse(serializedHistory);

      return ApiResponseSchema.parse({
        success: true,
        data: validatedHistory,
      });
    } catch (error) {
      console.error('History service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history record',
      });
    }
  }

  // Create new history record
  async create(data: {
    org_unit_id: number;
    old_name?: string;
    new_name?: string;
    change_type: string;
    details?: any;
  }) {
    try {
      const history = await this.repo.create(data);
      const serializedHistory = this.serializeBigInt(history);
      const validatedHistory = OrgUnitHistorySchema.parse(serializedHistory);

      return ApiResponseSchema.parse({
        success: true,
        data: validatedHistory,
      });
    } catch (error) {
      console.error('History service error:', error);
      return ApiResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create history record',
      });
    }
  }
}
