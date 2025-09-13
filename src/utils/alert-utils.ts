import { AlertColor } from '@mui/material';

/**
 * Alert severity types
 */
export type AlertSeverity = AlertColor;

/**
 * Alert message interface
 */
export interface AlertMessage {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  autoHide?: boolean;
  autoHideDelay?: number; // in milliseconds
}

/**
 * Alert state interface
 */
export interface AlertState {
  messages: AlertMessage[];
  isOpen: boolean;
}

/**
 * Alert actions interface
 */
export interface AlertActions {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideAlert: (id: string) => void;
  hideAllAlerts: () => void;
  clearAllAlerts: () => void;
}

/**
 * Default alert titles by severity
 */
export const DEFAULT_ALERT_TITLES: Record<AlertSeverity, string> = {
  success: 'Thành công',
  error: 'Lỗi',
  warning: 'Cảnh báo',
  info: 'Thông tin',
};

/**
 * Default auto-hide delays by severity (in milliseconds)
 */
export const DEFAULT_AUTO_HIDE_DELAYS: Record<AlertSeverity, number> = {
  success: 5000, // 5 seconds
  error: 8000,   // 8 seconds
  warning: 6000, // 6 seconds
  info: 4000,    // 4 seconds
};

/**
 * Generate unique ID for alert message
 */
export const generateAlertId = (): string => {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create alert message
 */
export const createAlertMessage = (
  severity: AlertSeverity,
  message: string,
  title?: string,
  options?: {
    autoHide?: boolean;
    autoHideDelay?: number;
  }
): AlertMessage => {
  return {
    id: generateAlertId(),
    severity,
    title: title || DEFAULT_ALERT_TITLES[severity],
    message,
    timestamp: Date.now(),
    autoHide: options?.autoHide ?? true,
    autoHideDelay: options?.autoHideDelay ?? DEFAULT_AUTO_HIDE_DELAYS[severity],
  };
};

/**
 * Predefined alert messages for common operations
 */
export const COMMON_ALERT_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: (entityName: string) => 
    createAlertMessage('success', `Đã tạo ${entityName} thành công`),
  
  UPDATE_SUCCESS: (entityName: string) => 
    createAlertMessage('success', `Đã cập nhật ${entityName} thành công`),
  
  DELETE_SUCCESS: (entityName: string) => 
    createAlertMessage('success', `Đã vô hiệu hóa ${entityName} thành công`),
  
  SAVE_SUCCESS: (entityName: string) => 
    createAlertMessage('success', `Đã lưu ${entityName} thành công`),
  
  IMPORT_SUCCESS: (count: number) => 
    createAlertMessage('success', `Đã nhập ${count} bản ghi thành công`),
  
  EXPORT_SUCCESS: (count: number) => 
    createAlertMessage('success', `Đã xuất ${count} bản ghi thành công`),

  // Error messages
  CREATE_ERROR: (entityName: string) => 
    createAlertMessage('error', `Không thể tạo ${entityName}`),
  
  UPDATE_ERROR: (entityName: string) => 
    createAlertMessage('error', `Không thể cập nhật ${entityName}`),
  
  DELETE_ERROR: (entityName: string) => 
    createAlertMessage('error', `Không thể vô hiệu hóa ${entityName}`),
  
  SAVE_ERROR: (entityName: string) => 
    createAlertMessage('error', `Không thể lưu ${entityName}`),
  
  LOAD_ERROR: (entityName: string) => 
    createAlertMessage('error', `Không thể tải ${entityName}`),
  
  NETWORK_ERROR: () => 
    createAlertMessage('error', 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet.'),
  
  VALIDATION_ERROR: () => 
    createAlertMessage('error', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'),
  
  PERMISSION_ERROR: () => 
    createAlertMessage('error', 'Bạn không có quyền thực hiện thao tác này.'),
  
  SERVER_ERROR: () => 
    createAlertMessage('error', 'Lỗi máy chủ. Vui lòng thử lại sau.'),

  // Warning messages
  UNSAVED_CHANGES: () => 
    createAlertMessage('warning', 'Bạn có thay đổi chưa được lưu. Bạn có muốn tiếp tục?'),
  
  DELETE_WARNING: (entityName: string) => 
    createAlertMessage('warning', `Bạn có chắc chắn muốn xóa ${entityName}? Hành động này không thể hoàn tác.`),
  
  BULK_DELETE_WARNING: (count: number) => 
    createAlertMessage('warning', `Bạn có chắc chắn muốn xóa ${count} bản ghi? Hành động này không thể hoàn tác.`),
  
  DEPENDENCY_WARNING: (entityName: string, dependentCount: number) => 
    createAlertMessage('warning', `Không thể xóa ${entityName} vì có ${dependentCount} bản ghi phụ thuộc.`),

  // Info messages
  LOADING_INFO: (entityName: string) => 
    createAlertMessage('info', `Đang tải ${entityName}...`, 'Thông tin'),
  
  PROCESSING_INFO: (operation: string) => 
    createAlertMessage('info', `Đang xử lý ${operation}...`, 'Thông tin'),
  
  MAINTENANCE_INFO: () => 
    createAlertMessage('info', 'Hệ thống đang bảo trì. Một số chức năng có thể không khả dụng.'),
} as const;

/**
 * Organization unit specific alert messages
 */
export const ORG_UNIT_ALERTS = {
  // Success messages
  UNIT_CREATED: (unitName: string) => 
    createAlertMessage('success', `Đã tạo đơn vị "${unitName}" thành công`),
  
  UNIT_UPDATED: (unitName: string) => 
    createAlertMessage('success', `Đã cập nhật đơn vị "${unitName}" thành công`),
  
  UNIT_DISABLED: (unitName: string) => 
    createAlertMessage('success', `Đã vô hiệu hóa đơn vị "${unitName}" thành công`),
  
  UNIT_RESTORED: (unitName: string) => 
    createAlertMessage('success', `Đã khôi phục đơn vị "${unitName}" thành công`),

  // Error messages
  UNIT_CREATE_FAILED: (unitName?: string) => 
    createAlertMessage('error', unitName ? `Không thể tạo đơn vị "${unitName}"` : 'Không thể tạo đơn vị'),
  
  UNIT_UPDATE_FAILED: (unitName?: string) => 
    createAlertMessage('error', unitName ? `Không thể cập nhật đơn vị "${unitName}"` : 'Không thể cập nhật đơn vị'),
  
  UNIT_DELETE_FAILED: (unitName?: string) => 
    createAlertMessage('error', unitName ? `Không thể vô hiệu hóa đơn vị "${unitName}"` : 'Không thể vô hiệu hóa đơn vị'),
  
  UNIT_NOT_FOUND: () => 
    createAlertMessage('error', 'Không tìm thấy đơn vị'),
  
  UNIT_CODE_EXISTS: (code: string) => 
    createAlertMessage('error', `Mã đơn vị "${code}" đã tồn tại`),
  
  UNIT_NAME_EXISTS: (name: string) => 
    createAlertMessage('error', `Tên đơn vị "${name}" đã tồn tại`),

  // Warning messages
  UNIT_HAS_CHILDREN: (unitName: string, childCount: number) => 
    createAlertMessage('warning', `Đơn vị "${unitName}" có ${childCount} đơn vị con. Không thể xóa.`),
  
  UNIT_HAS_EMPLOYEES: (unitName: string, employeeCount: number) => 
    createAlertMessage('warning', `Đơn vị "${unitName}" có ${employeeCount} nhân viên. Không thể xóa.`),
  
  UNIT_ACTIVE_WARNING: (unitName: string) => 
    createAlertMessage('warning', `Đơn vị "${unitName}" đang hoạt động. Việc vô hiệu hóa có thể ảnh hưởng đến các chức năng liên quan.`),
} as const;

/**
 * Employee specific alert messages
 */
export const EMPLOYEE_ALERTS = {
  // Success messages
  EMPLOYEE_CREATED: (employeeName: string) => 
    createAlertMessage('success', `Đã tạo nhân viên "${employeeName}" thành công`),
  
  EMPLOYEE_UPDATED: (employeeName: string) => 
    createAlertMessage('success', `Đã cập nhật nhân viên "${employeeName}" thành công`),
  
  EMPLOYEE_DELETED: (employeeName: string) => 
    createAlertMessage('success', `Đã xóa nhân viên "${employeeName}" thành công`),

  // Error messages
  EMPLOYEE_CREATE_FAILED: (employeeName?: string) => 
    createAlertMessage('error', employeeName ? `Không thể tạo nhân viên "${employeeName}"` : 'Không thể tạo nhân viên'),
  
  EMPLOYEE_UPDATE_FAILED: (employeeName?: string) => 
    createAlertMessage('error', employeeName ? `Không thể cập nhật nhân viên "${employeeName}"` : 'Không thể cập nhật nhân viên'),
  
  EMPLOYEE_DELETE_FAILED: (employeeName?: string) => 
    createAlertMessage('error', employeeName ? `Không thể xóa nhân viên "${employeeName}"` : 'Không thể xóa nhân viên'),
  
  EMPLOYEE_NOT_FOUND: () => 
    createAlertMessage('error', 'Không tìm thấy nhân viên'),
  
  EMPLOYEE_CODE_EXISTS: (code: string) => 
    createAlertMessage('error', `Mã nhân viên "${code}" đã tồn tại`),
} as const;

/**
 * Utility functions for alert management
 */
export const alertUtils = {
  /**
   * Check if alert should be shown based on conditions
   */
  shouldShowAlert: (condition: boolean, alert: AlertMessage): AlertMessage | null => {
    return condition ? alert : null;
  },

  /**
   * Create multiple alerts from an array of messages
   */
  createMultipleAlerts: (messages: string[], severity: AlertSeverity, title?: string): AlertMessage[] => {
    return messages.map(message => createAlertMessage(severity, message, title));
  },

  /**
   * Format error message with details
   */
  formatErrorMessage: (baseMessage: string, details?: string): string => {
    return details ? `${baseMessage}: ${details}` : baseMessage;
  },

  /**
   * Create alert with custom options
   */
  createCustomAlert: (
    severity: AlertSeverity,
    message: string,
    options: {
      title?: string;
      autoHide?: boolean;
      autoHideDelay?: number;
      persistent?: boolean; // Never auto-hide
    }
  ): AlertMessage => {
    return createAlertMessage(severity, message, options.title, {
      autoHide: options.persistent ? false : (options.autoHide ?? true),
      autoHideDelay: options.persistent ? 0 : (options.autoHideDelay ?? DEFAULT_AUTO_HIDE_DELAYS[severity]),
    });
  },
};
