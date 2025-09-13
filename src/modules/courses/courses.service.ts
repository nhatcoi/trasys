import { CourseRepository } from './courses.repo';
import {
  CourseSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CourseQuerySchema,
  type Course,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseQuery,
  type CourseResponse,
  type CourseListResponse,
} from './courses.schema';

export class CourseService {
  private courseRepo: CourseRepository;

  constructor() {
    this.courseRepo = new CourseRepository();
  }

  // Get all courses with options
  async getAllCoursesWithOptions(options: CourseQuery): Promise<CourseListResponse> {
    try {
      const validatedOptions = CourseQuerySchema.parse(options);
      const result = await this.courseRepo.findAllWithOptions(validatedOptions);
      
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
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
      };
    }
  }

  // Get course by ID
  async getCourseById(id: string): Promise<CourseResponse> {
    try {
      const course = await this.courseRepo.findById(id);
      
      if (!course) {
        return {
          success: false,
          error: 'Course not found',
        };
      }

      return {
        success: true,
        data: course,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch course',
      };
    }
  }

  // Create new course
  async createCourse(data: CreateCourseInput): Promise<CourseResponse> {
    try {
      const validatedData = CreateCourseSchema.parse(data);
      const course = await this.courseRepo.create(validatedData);
      
      return {
        success: true,
        data: course,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create course',
      };
    }
  }

  // Update course
  async updateCourse(id: string, data: UpdateCourseInput): Promise<CourseResponse> {
    try {
      const validatedData = UpdateCourseSchema.parse(data);
      const course = await this.courseRepo.update(id, validatedData);
      
      return {
        success: true,
        data: course,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update course',
      };
    }
  }

  // Delete course
  async deleteCourse(id: string): Promise<CourseResponse> {
    try {
      await this.courseRepo.delete(id);
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete course',
      };
    }
  }
}
