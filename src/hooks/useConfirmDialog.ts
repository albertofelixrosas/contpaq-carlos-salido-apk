import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
}

/**
 * Hook para manejar diálogos de confirmación
 * Útil para acciones destructivas (eliminar, limpiar, etc.)
 */
export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    severity: 'warning',
  });

  const showConfirm = useCallback((options: Omit<ConfirmDialogState, 'open'>) => {
    setDialog({
      open: true,
      ...options,
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    dialog.onConfirm();
    hideConfirm();
  }, [dialog, hideConfirm]);

  return {
    dialog,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
};
