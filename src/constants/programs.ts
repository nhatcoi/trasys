// Program-related enums and helpers

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProgramPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ProgramBlockType {
  GENERAL = 'general',
  FOUNDATION = 'foundation',
  CORE = 'core',
  MAJOR = 'major',
  ELECTIVE = 'elective',
  THESIS = 'thesis',
  INTERNSHIP = 'internship',
  OTHER = 'other',
}

export enum ProgramDegreeLevel {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  PHD = 'phd',
  DIPLOMA = 'diploma',
  ASSOCIATE = 'associate',
  CERTIFICATE = 'certificate',
}

export const PROGRAM_STATUSES: ProgramStatus[] = [
  ProgramStatus.DRAFT,
  ProgramStatus.SUBMITTED,
  ProgramStatus.REVIEWING,
  ProgramStatus.APPROVED,
  ProgramStatus.REJECTED,
  ProgramStatus.PUBLISHED,
  ProgramStatus.ARCHIVED,
];

export const PROGRAM_PRIORITIES: ProgramPriority[] = [
  ProgramPriority.HIGH,
  ProgramPriority.MEDIUM,
  ProgramPriority.LOW,
];

export const PROGRAM_BLOCK_TYPES: ProgramBlockType[] = [
  ProgramBlockType.GENERAL,
  ProgramBlockType.FOUNDATION,
  ProgramBlockType.CORE,
  ProgramBlockType.MAJOR,
  ProgramBlockType.ELECTIVE,
  ProgramBlockType.THESIS,
  ProgramBlockType.INTERNSHIP,
  ProgramBlockType.OTHER,
];

export const PROGRAM_DEGREE_LEVELS: ProgramDegreeLevel[] = [
  ProgramDegreeLevel.BACHELOR,
  ProgramDegreeLevel.MASTER,
  ProgramDegreeLevel.PHD,
  ProgramDegreeLevel.DIPLOMA,
  ProgramDegreeLevel.ASSOCIATE,
  ProgramDegreeLevel.CERTIFICATE,
];

export function normalizeProgramPriority(priority?: string | null): ProgramPriority {
  switch ((priority || '').toUpperCase()) {
    case ProgramPriority.HIGH:
      return ProgramPriority.HIGH;
    case ProgramPriority.LOW:
      return ProgramPriority.LOW;
    case ProgramPriority.MEDIUM:
    default:
      return ProgramPriority.MEDIUM;
  }
}

export function getProgramStatusLabel(status: ProgramStatus | string): string {
  switch (status) {
    case ProgramStatus.PUBLISHED:
      return 'Đã xuất bản';
    case ProgramStatus.APPROVED:
      return 'Đã phê duyệt';
    case ProgramStatus.REVIEWING:
      return 'Đang xem xét';
    case ProgramStatus.SUBMITTED:
      return 'Đã gửi';
    case ProgramStatus.DRAFT:
      return 'Bản nháp';
    case ProgramStatus.REJECTED:
      return 'Từ chối';
    case ProgramStatus.ARCHIVED:
      return 'Lưu trữ';
    default:
      return status;
  }
}

export function getProgramStatusColor(status: ProgramStatus | string): 'default' | 'info' | 'warning' | 'success' | 'error' {
  switch (status) {
    case ProgramStatus.PUBLISHED:
    case ProgramStatus.APPROVED:
      return 'success';
    case ProgramStatus.REVIEWING:
      return 'warning';
    case ProgramStatus.SUBMITTED:
      return 'info';
    case ProgramStatus.REJECTED:
      return 'error';
    case ProgramStatus.DRAFT:
    case ProgramStatus.ARCHIVED:
    default:
      return 'default';
  }
}

export function getProgramPriorityLabel(priority: ProgramPriority | string): string {
  switch ((priority || '').toUpperCase()) {
    case ProgramPriority.HIGH:
      return 'Cao';
    case ProgramPriority.LOW:
      return 'Thấp';
    case ProgramPriority.MEDIUM:
    default:
      return 'Trung bình';
  }
}

export function getProgramPriorityColor(priority: ProgramPriority | string): 'error' | 'warning' | 'success' | 'default' {
  switch ((priority || '').toUpperCase()) {
    case ProgramPriority.HIGH:
      return 'error';
    case ProgramPriority.MEDIUM:
      return 'warning';
    case ProgramPriority.LOW:
      return 'success';
    default:
      return 'default';
  }
}

export function getProgramDegreeLabel(level: ProgramDegreeLevel | string | null | undefined): string {
  switch ((level || '').toLowerCase()) {
    case ProgramDegreeLevel.BACHELOR:
      return 'Cử nhân';
    case ProgramDegreeLevel.MASTER:
      return 'Thạc sĩ';
    case ProgramDegreeLevel.PHD:
      return 'Tiến sĩ';
    case ProgramDegreeLevel.DIPLOMA:
      return 'Cao đẳng';
    case ProgramDegreeLevel.ASSOCIATE:
      return 'Trung cấp';
    case ProgramDegreeLevel.CERTIFICATE:
      return 'Chứng chỉ';
    default:
      return level || 'Không xác định';
  }
}

export function getProgramBlockTypeLabel(type: ProgramBlockType | string): string {
  switch ((type || '').toLowerCase()) {
    case ProgramBlockType.GENERAL:
      return 'Kiến thức đại cương';
    case ProgramBlockType.FOUNDATION:
      return 'Cơ sở ngành';
    case ProgramBlockType.CORE:
      return 'Bắt buộc cơ bản';
    case ProgramBlockType.MAJOR:
      return 'Chuyên ngành';
    case ProgramBlockType.ELECTIVE:
      return 'Tự chọn';
    case ProgramBlockType.THESIS:
      return 'Đồ án/Khóa luận';
    case ProgramBlockType.INTERNSHIP:
      return 'Thực tập';
    case ProgramBlockType.OTHER:
      return 'Khối khác';
    default:
      return type || 'Không xác định';
  }
}

export function normalizeProgramBlockType(type?: string | null): ProgramBlockType {
  const value = (type || '').toLowerCase();
  if ((PROGRAM_BLOCK_TYPES as string[]).includes(value)) {
    return value as ProgramBlockType;
  }
  return ProgramBlockType.CORE;
}

export const DEFAULT_PROGRAM_PAGE_SIZE = 10;
