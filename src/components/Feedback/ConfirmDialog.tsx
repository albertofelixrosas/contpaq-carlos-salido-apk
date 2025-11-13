import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import type { ConfirmDialogState } from '../../hooks/useConfirmDialog';

interface ConfirmDialogProps {
  dialog: ConfirmDialogState;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable
 * Usado para confirmar acciones destructivas o importantes
 */
export const ConfirmDialog = ({ dialog, onConfirm, onCancel }: ConfirmDialogProps) => {
  const getColor = () => {
    switch (dialog.severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={dialog.open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{dialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {dialog.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {dialog.cancelText || 'Cancelar'}
        </Button>
        <Button onClick={onConfirm} color={getColor()} variant="contained" autoFocus>
          {dialog.confirmText || 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
