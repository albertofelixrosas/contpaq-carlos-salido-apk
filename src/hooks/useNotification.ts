import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

/**
 * Hook para manejar notificaciones (Snackbar)
 * Proporciona métodos para mostrar diferentes tipos de mensajes
 */
export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  };
};
