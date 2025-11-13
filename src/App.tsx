import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './theme/theme';
import { ErrorBoundary } from './components/Feedback/ErrorBoundary';
import { AppLayout } from './components/Layout/AppLayout';
import { AppProvider, useAppContext } from './context/AppContext';
import { FileUpload } from './features/file-upload/FileUpload';
import { normalizeApkData, normalizeGgData, validateApkData, validateGgData } from './features/file-upload/fileParser';
import { useNotification } from './hooks/useNotification';
import { useEffect } from 'react';
import type { DataType } from './types';

function AppContent() {
  const { setApkData, setGgData, loadData, apkData, ggData } = useAppContext();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const handleFileProcessed = (rawData: unknown, type: DataType) => {
    try {
      if (type === 'apk') {
        const validation = validateApkData(rawData as unknown[]);
        if (!validation.valid) {
          showError(validation.error || 'Datos inválidos');
          return;
        }
        const normalized = normalizeApkData(rawData as unknown[]);
        setApkData(normalized);
      } else {
        const validation = validateGgData(rawData as unknown[]);
        if (!validation.valid) {
          showError(validation.error || 'Datos inválidos');
          return;
        }
        const normalized = normalizeGgData(rawData as unknown[]);
        setGgData(normalized);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al normalizar datos');
    }
  };

  const renderTabContent = (currentTab: string) => {
    switch (currentTab) {
      case 'upload':
        return (
          <FileUpload
            onFileProcessed={handleFileProcessed}
            onError={showError}
            onSuccess={showSuccess}
          />
        );
      
      case 'table':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>📊 Tabla de Datos</Typography>
            <Typography>Registros APK: {apkData.length}</Typography>
            <Typography>Registros GG: {ggData.length}</Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Implementación pendiente...
            </Typography>
          </Box>
        );
      
      case 'concepts':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>🏷️ Gestión de Conceptos</Typography>
            <Typography color="text.secondary">Implementación pendiente...</Typography>
          </Box>
        );
      
      case 'segments':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>📊 Editor de Segmentos</Typography>
            <Typography color="text.secondary">Implementación pendiente...</Typography>
          </Box>
        );
      
      case 'prorrateo':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>🧮 Prorrateo de Gastos</Typography>
            <Typography color="text.secondary">Implementación pendiente...</Typography>
          </Box>
        );
      
      default:
        return <Typography>Pestaña desconocida</Typography>;
    }
  };

  return (
    <AppLayout>
      {(currentTab) => renderTabContent(currentTab)}
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
