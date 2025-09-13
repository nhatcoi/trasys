import { useState, useCallback } from 'react';
import { 
  AlertMessage, 
  AlertSeverity, 
  createAlertMessage,
  DEFAULT_AUTO_HIDE_DELAYS 
} from '@/utils/alert-utils';

/**
 * Custom hook for managing alert messages
 */
export function useAlert() {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const showAlert = useCallback((
    severity: AlertSeverity,
    message: string,
    title?: string,
    options?: {
      autoHide?: boolean;
      autoHideDelay?: number;
    }
  ) => {
    const alertMessage = createAlertMessage(severity, message, title, options);
    setAlert(alertMessage);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert('success', message, title);
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert('error', message, title, { autoHideDelay: 8000 });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert('warning', message, title, { autoHideDelay: 6000 });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert('info', message, title);
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    clearAlert,
  };
}

/**
 * Custom hook for managing multiple alert messages
 */
export function useMultipleAlerts() {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const addAlert = useCallback((
    severity: AlertSeverity,
    message: string,
    title?: string,
    options?: {
      autoHide?: boolean;
      autoHideDelay?: number;
    }
  ) => {
    const alertMessage = createAlertMessage(severity, message, title, options);
    setAlerts(prev => [...prev, alertMessage]);
  }, []);

  const addSuccess = useCallback((message: string, title?: string) => {
    addAlert('success', message, title);
  }, [addAlert]);

  const addError = useCallback((message: string, title?: string) => {
    addAlert('error', message, title, { autoHideDelay: 8000 });
  }, [addAlert]);

  const addWarning = useCallback((message: string, title?: string) => {
    addAlert('warning', message, title, { autoHideDelay: 6000 });
  }, [addAlert]);

  const addInfo = useCallback((message: string, title?: string) => {
    addAlert('info', message, title);
  }, [addAlert]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearAlertsBySeverity = useCallback((severity: AlertSeverity) => {
    setAlerts(prev => prev.filter(alert => alert.severity !== severity));
  }, []);

  return {
    alerts,
    addAlert,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    removeAlert,
    clearAllAlerts,
    clearAlertsBySeverity,
  };
}
