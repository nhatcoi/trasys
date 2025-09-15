import { AlertColor } from '@mui/material';

/**
 * Simple alert message interface
 */
export interface AlertMessage {
  severity: AlertColor;
  title: string;
  message: string;
  open: boolean;
}

/**
 * Create success alert message
 */
export const createSuccessAlert = (message: string, title: string = 'Thành công'): AlertMessage => ({
  severity: 'success',
  title,
  message,
  open: true,
});

/**
 * Create error alert message
 */
export const createErrorAlert = (message: string, title: string = 'Lỗi'): AlertMessage => ({
  severity: 'error',
  title,
  message,
  open: true,
});

/**
 * Create warning alert message
 */
export const createWarningAlert = (message: string, title: string = 'Cảnh báo'): AlertMessage => ({
  severity: 'warning',
  title,
  message,
  open: true,
});

/**
 * Create info alert message
 */
export const createInfoAlert = (message: string, title: string = 'Thông tin'): AlertMessage => ({
  severity: 'info',
  title,
  message,
  open: true,
});

/**
 * Close alert message
 */
export const closeAlert = (): AlertMessage => ({
  severity: 'info',
  title: '',
  message: '',
  open: false,
});
