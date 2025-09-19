interface OrgUnitType {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface OrgUnitStatus {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  workflow_step: number;
  created_at: string;
  updated_at: string;
}

interface DropdownOption {
  value: string;
  label: string;
  deletable?: boolean;
}

/**
 * Convert API types to dropdown options
 */
export const convertTypesToOptions = (types: OrgUnitType[]): DropdownOption[] => {
  return types
    .filter(type => type.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(type => ({
      value: type.code,
      label: `${type.name} (${type.code})`,
    }));
};

/**
 * Convert API statuses to dropdown options
 */
export const convertStatusesToOptions = (statuses: OrgUnitStatus[]): DropdownOption[] => {
  return statuses
    .filter(status => status.is_active)
    .sort((a, b) => a.workflow_step - b.workflow_step)
    .map(status => ({
      value: status.code,
      label: status.name,
      deletable: ['DRAFT', 'REJECTED', 'INACTIVE'].includes(status.code),
    }));
};

/**
 * Get type color from API data
 */
export const getTypeColorFromApi = (typeCode: string | null, types: OrgUnitType[]): string => {
  if (!typeCode) return '#666666';
  
  const type = types.find(t => t.code === typeCode);
  return type?.color || '#666666';
};

/**
 * Get status color from API data
 */
export const getStatusColorFromApi = (statusCode: string | null, statuses: OrgUnitStatus[]): string => {
  if (!statusCode) return '#666666';
  
  const status = statuses.find(s => s.code === statusCode);
  return status?.color || '#666666';
};

/**
 * Get type name from API data
 */
export const getTypeNameFromApi = (typeCode: string | null, types: OrgUnitType[]): string => {
  if (!typeCode) return 'Không xác định';
  
  const type = types.find(t => t.code === typeCode);
  return type?.name || 'Không xác định';
};

/**
 * Get status name from API data
 */
export const getStatusNameFromApi = (statusCode: string | null, statuses: OrgUnitStatus[]): string => {
  if (!statusCode) return 'Không xác định';
  
  const status = statuses.find(s => s.code === statusCode);
  return status?.name || 'Không xác định';
};

/**
 * Check if status is deletable based on API data
 */
export const isStatusDeletableFromApi = (statusCode: string | null, statuses: OrgUnitStatus[]): boolean => {
  if (!statusCode) return false;
  
  const status = statuses.find(s => s.code === statusCode);
  return status ? ['DRAFT', 'REJECTED', 'INACTIVE'].includes(status.code) : false;
};
