'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert, AlertTitle, Snackbar, Box } from '@mui/material';
import { 
  AlertMessage, 
  AlertSeverity, 
  createAlertMessage,
  DEFAULT_AUTO_HIDE_DELAYS 
} from '@/utils/alert-utils';

interface AlertContextType {
  showAlert: (severity: AlertSeverity, message: string, title?: string, options?: {
    autoHide?: boolean;
    autoHideDelay?: number;
  }) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideAlert: () => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
  maxAlerts?: number;
  position?: 'top' | 'bottom';
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ 
  children, 
  maxAlerts = 3,
  position = 'top'
}) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

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
    
    setAlerts(prev => {
      const newAlerts = [...prev, alertMessage];
      // Keep only the last maxAlerts
      return newAlerts.slice(-maxAlerts);
    });
    
    // Show the newest alert
    setCurrentAlertIndex(prev => Math.min(prev + 1, maxAlerts - 1));
  }, [maxAlerts]);

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
    setAlerts(prev => {
      if (prev.length <= 1) {
        return [];
      }
      return prev.slice(1);
    });
    setCurrentAlertIndex(0);
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    setCurrentAlertIndex(0);
  }, []);

  const handleAlertClose = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Auto-hide alerts
  useEffect(() => {
    if (alerts.length === 0) return;

    const currentAlert = alerts[currentAlertIndex];
    if (!currentAlert || !currentAlert.autoHide) return;

    const timer = setTimeout(() => {
      hideAlert();
    }, currentAlert.autoHideDelay);

    return () => clearTimeout(timer);
  }, [alerts, currentAlertIndex, hideAlert]);

  const currentAlert = alerts[currentAlertIndex];

  const value: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    clearAllAlerts,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Global Alert Snackbar */}
      {currentAlert && (
        <Snackbar
          open={!!currentAlert}
          autoHideDuration={currentAlert.autoHideDelay}
          onClose={() => handleAlertClose(currentAlert.id)}
          anchorOrigin={{ 
            vertical: position, 
            horizontal: 'center' 
          }}
          sx={{
            zIndex: 9999,
          }}
        >
          <Alert
            onClose={() => handleAlertClose(currentAlert.id)}
            severity={currentAlert.severity}
            sx={{ 
              minWidth: '300px',
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <AlertTitle>{currentAlert.title}</AlertTitle>
            {currentAlert.message}
          </Alert>
        </Snackbar>
      )}
    </AlertContext.Provider>
  );
};

// Convenience components for inline alerts
interface InlineAlertProps {
  severity: AlertSeverity;
  title?: string;
  message: string;
  onClose?: () => void;
  sx?: any;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  severity,
  title,
  message,
  onClose,
  sx = { mb: 3 }
}) => {
  return (
    <Alert
      severity={severity}
      onClose={onClose}
      sx={sx}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};
