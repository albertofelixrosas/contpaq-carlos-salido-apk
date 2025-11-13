import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './theme/theme';
import { ErrorBoundary } from './components/Feedback/ErrorBoundary';
import { AppLayout } from './components/Layout/AppLayout';
import { AppProvider, useAppContext } from './context/AppContext';
import { FileUpload } from './features/file-upload/FileUpload';
import { DataTable } from './features/data-table/DataTable';
import { ConceptsManager } from './features/concepts/ConceptsManager';
import { SegmentEditor } from './features/segment-editor/SegmentEditor';
import { useUniqueConceptsFromData } from './features/concepts/useUniqueConceptsFromData';
import { normalizeApkData, normalizeGgData, validateApkData, validateGgData } from './features/file-upload/fileParser';
import { useNotification } from './hooks/useNotification';
import { useEffect } from 'react';
import type { DataType } from './types';

function AppContent() {
  const { setApkData, setGgData, loadData, apkData, ggData, concepts, setConcepts, segments, setSegments } = useAppContext();
  const { showSuccess, showError } = useNotification();
  const uniqueConceptsFromData = useUniqueConceptsFromData(apkData, ggData);

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
            
            {apkData.length === 0 && ggData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay datos cargados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ve a la pestaña "Carga de Archivos" para cargar un archivo APK o GG
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {apkData.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Datos APK ({apkData.length} registros)
                    </Typography>
                    <DataTable
                      data={apkData}
                      type="apk"
                      onEdit={(record) => console.log('Edit APK:', record)}
                      onDelete={(id) => console.log('Delete APK:', id)}
                      onExport={() => console.log('Export APK')}
                    />
                  </Box>
                )}
                
                {ggData.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Datos GG ({ggData.length} registros)
                    </Typography>
                    <DataTable
                      data={ggData}
                      type="gg"
                      onEdit={(record) => console.log('Edit GG:', record)}
                      onDelete={(id) => console.log('Delete GG:', id)}
                      onExport={() => console.log('Export GG')}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      
      case 'concepts':
        return (
          <ConceptsManager
            concepts={concepts}
            onAdd={(text) => {
              const newConcept = {
                id: `concept-${Date.now()}`,
                text: text.toUpperCase(),
                createdAt: new Date().toISOString(),
              };
              setConcepts([...concepts, newConcept]);
              showSuccess(`Concepto "${text}" agregado correctamente`);
            }}
            onDelete={(id) => {
              const conceptToDelete = concepts.find(c => c.id === id);
              setConcepts(concepts.filter(c => c.id !== id));
              showSuccess(`Concepto "${conceptToDelete?.text}" eliminado`);
            }}
            uniqueConceptsFromData={uniqueConceptsFromData}
          />
        );
      
      case 'segments':
        return (
          <SegmentEditor
            segments={segments}
            onSave={(updatedSegments) => {
              setSegments(updatedSegments);
              showSuccess('Segmentos guardados correctamente');
            }}
          />
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
