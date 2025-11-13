import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Navigation, TabValue } from './Navigation';
import { Notification } from '../Feedback/Notification';
import { ConfirmDialog } from '../Feedback/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface AppLayoutProps {
  children: (tab: TabValue) => ReactNode;
}

/**
 * Layout principal de la aplicación
 * Contiene Header, Navigation, y sistema de notificaciones/diálogos
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const [currentTab, setCurrentTab] = useState<TabValue>('upload');
  const { notification, hideNotification } = useNotification();
  const { dialog, hideConfirm, handleConfirm } = useConfirmDialog();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      <Navigation currentTab={currentTab} onChange={setCurrentTab} />
      
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        width: '100%',
      }}>
        {children(currentTab)}
      </Box>

      {/* Sistemas globales de feedback */}
      <Notification notification={notification} onClose={hideNotification} />
      <ConfirmDialog
        dialog={dialog}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />
    </Box>
  );
};
