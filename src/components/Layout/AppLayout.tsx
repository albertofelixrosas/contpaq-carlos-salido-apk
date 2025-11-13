import { useState, ReactNode } from 'react';
import { Box, Container } from '@mui/material';
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
      
      <Container maxWidth="xl" sx={{ paddingY: 3 }}>
        {children(currentTab)}
      </Container>

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
