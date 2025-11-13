import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Navigation } from './Navigation';
import type { TabValue } from './Navigation';
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
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <Navigation currentTab={currentTab} onChange={setCurrentTab} />
      
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        py: { xs: 2, sm: 3 },
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
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
