import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';
import type { NotificationState } from '../../hooks/useNotification';

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

/**
 * Componente de notificación global (Snackbar)
 * Muestra mensajes de éxito, error, advertencia e información
 */
export const Notification = ({ notification, onClose }: NotificationProps) => {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.type as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};
