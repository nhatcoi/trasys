import {
  Apartment as ApartmentIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Enums for organization unit types and statuses
export enum OrgUnitType {
  DEPARTMENT = 'department',
  DIVISION = 'division',
  TEAM = 'team',
  BRANCH = 'branch',
  FACULTY = 'faculty',
  SCHOOL = 'school',
  UNIVERSITY = 'university',
  UNIVERSITY_COUNCIL = 'university_council',
  CENTER = 'center',
  INSTITUTE = 'institute',
}

export enum OrgUnitStatus {
  // Deletable statuses
  DRAFT = 'draft',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
  
  // Non-deletable statuses
  ACTIVE = 'active',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

/**
 * Get color for organization unit status
 */
export const getStatusColor = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    // Deletable statuses
    case OrgUnitStatus.DRAFT:
      return '#9e9e9e'; // Grey - Draft
    case OrgUnitStatus.REJECTED:
      return '#f44336'; // Red - Rejected
    case OrgUnitStatus.INACTIVE:
      return '#ff5722'; // Deep Orange - Inactive
    
    // Non-deletable statuses
    case OrgUnitStatus.ACTIVE:
      return '#4caf50'; // Green - Active
    case OrgUnitStatus.APPROVED:
      return '#2196f3'; // Blue - Approved
    case OrgUnitStatus.SUSPENDED:
      return '#ff9800'; // Orange - Suspended
    case OrgUnitStatus.ARCHIVED:
      return '#607d8b'; // Blue Grey - Archived
    
    default:
      return '#666666'; // Default grey
  }
};

/**
 * Get color for organization unit type
 */
export const getTypeColor = (type: string | null): string => {
  switch (type?.toLowerCase()) {
    case OrgUnitType.DEPARTMENT:
      return '#2e4c92'; // Blue - Department
    case OrgUnitType.DIVISION:
      return '#2e4c92'; // Blue - Division
    case OrgUnitType.TEAM:
      return '#ff8c00'; // Orange - Team
    case OrgUnitType.BRANCH:
      return '#ff8c00'; // Orange - Branch
    case OrgUnitType.FACULTY:
      return '#673ab7'; // Purple - Faculty
    case OrgUnitType.SCHOOL:
      return '#3f51b5'; // Indigo - School
    case OrgUnitType.UNIVERSITY:
      return '#1976d2'; // Blue - University
    case OrgUnitType.UNIVERSITY_COUNCIL:
      return '#0d47a1'; // Dark Blue - University Council
    case OrgUnitType.CENTER:
      return '#e91e63'; // Pink - Center
    case OrgUnitType.INSTITUTE:
      return '#795548'; // Brown - Institute
    default:
      return '#666666'; // Default grey
  }
};

/**
 * Get icon for organization unit type
 */
export const getTypeIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case OrgUnitType.DEPARTMENT:
      return ApartmentIcon;
    case OrgUnitType.DIVISION:
      return GroupIcon;
    case OrgUnitType.TEAM:
      return GroupIcon;
    case OrgUnitType.BRANCH:
      return LocationOnIcon;
    case OrgUnitType.FACULTY:
      return ApartmentIcon;
    case OrgUnitType.SCHOOL:
      return BusinessIcon;
    case OrgUnitType.UNIVERSITY:
      return BusinessIcon;
    case OrgUnitType.UNIVERSITY_COUNCIL:
      return BusinessIcon;
    case OrgUnitType.CENTER:
      return BusinessIcon;
    case OrgUnitType.INSTITUTE:
      return BusinessIcon;
    default:
      return BusinessIcon;
  }
};

/**
 * Filter organization units based on search term, type, and status
 */
export const filterOrgUnits = (
  units: any[],
  searchTerm: string,
  filterType: string,
  filterStatus: string
) => {
  // Ensure units is an array
  if (!Array.isArray(units)) {
    console.warn('filterOrgUnits: units is not an array', units);
    return [];
  }
  
  return units.filter(unit => {
    const matchesSearch = unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || unit.type === filterType;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
};

/**
 * Paginate array of items
 */
export const paginateItems = <T>(
  items: T[],
  page: number,
  rowsPerPage: number
): T[] => {
  return items.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
};

/**
 * Check if organization unit can be deleted
 * Only deletable statuses: draft, rejected, inactive
 */
export const canDeleteOrgUnit = (status: string | null): boolean => {
  if (!status) return false;
  
  const deletableStatuses = [
    OrgUnitStatus.DRAFT,
    OrgUnitStatus.REJECTED,
    OrgUnitStatus.INACTIVE,
  ];
  
  return deletableStatuses.includes(status.toLowerCase() as OrgUnitStatus);
};

/**
 * Get error message for delete restriction
 */
export const getDeleteErrorMessage = (): string => {
  return 'Chỉ có thể xóa đơn vị có trạng thái: Nháp, Từ chối, Không hoạt động';
};

/**
 * Reset form data to initial state
 */
export const getInitialFormData = () => ({
  name: '',
  code: '',
  type: '',
  description: '',
  parent_id: null,
  status: 'active',
  effective_from: '',
  effective_to: '',
});

/**
 * Map organization unit to form data
 */
export const mapUnitToFormData = (unit: any) => ({
  name: unit.name,
  code: unit.code,
  type: unit.type || '',
  description: unit.description || '',
  parent_id: unit.parent_id,
  status: unit.status || OrgUnitStatus.ACTIVE,
  effective_from: unit.effective_from || '',
  effective_to: unit.effective_to || '',
});

/**
 * Get all organization unit types for dropdown
 */
export const getOrgUnitTypes = () => [
  { value: 'GOV', label: 'Quản trị (GOV)' },
  { value: 'ADM', label: 'Hành chính (ADM)' },
  { value: 'S', label: 'Trường (S)' },
  { value: 'F', label: 'Khoa (F)' },
  { value: 'D', label: 'Bộ môn (D)' },
  { value: 'LAB', label: 'Phòng thí nghiệm (LAB)' },
  { value: 'I', label: 'Viện (I)' },
  { value: 'U', label: 'Đại học (U)' },
];

/**
 * Get all organization unit statuses for dropdown
 */
export const getOrgUnitStatuses = () => [
  { value: OrgUnitStatus.DRAFT, label: 'Nháp', deletable: true },
  { value: OrgUnitStatus.REJECTED, label: 'Từ chối', deletable: true },
  { value: OrgUnitStatus.INACTIVE, label: 'Không hoạt động', deletable: true },
  { value: OrgUnitStatus.ACTIVE, label: 'Hoạt động', deletable: false },
  { value: OrgUnitStatus.APPROVED, label: 'Đã phê duyệt', deletable: false },
  { value: OrgUnitStatus.SUSPENDED, label: 'Tạm dừng', deletable: false },
  { value: OrgUnitStatus.ARCHIVED, label: 'Lưu trữ', deletable: false },
];

/**
 * Get deletable statuses only
 */
export const getDeletableStatuses = () => {
  return getOrgUnitStatuses().filter(status => status.deletable);
};

/**
 * Get non-deletable statuses only
 */
export const getNonDeletableStatuses = () => {
  return getOrgUnitStatuses().filter(status => !status.deletable);
};
