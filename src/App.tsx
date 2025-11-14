import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './theme/theme';
import { ErrorBoundary } from './components/Feedback/ErrorBoundary';
import { AppLayout } from './components/Layout/AppLayout';
import { AppProvider, useAppContext } from './context/AppContext';
import { FileUpload } from './features/file-upload';
import { DataTable } from './features/data-table/DataTable';
import { ConceptsManager } from './features/concepts/ConceptsManager';
import { ConceptMappingManager } from './features/concept-mapping/ConceptMappingManager';
import TextConceptMappingManager from './features/concept-mapping/TextConceptMappingManager';
import { SegmentEditor } from './features/segment-editor/SegmentEditor';
import { ExpenseProration } from './features/prorrateo';
import { useUniqueConceptsFromData } from './features/concepts/useUniqueConceptsFromData';
import { normalizeApkData, normalizeGgData, validateApkData, validateGgData } from './features/file-upload/fileParser';
import { useNotification } from './hooks/useNotification';
import type { DataType } from './types';

function AppContent() {
  const { setApkData, setGgData, apkData, ggData, concepts, setConcepts, segments, setSegments } = useAppContext();
  const { showSuccess, showError } = useNotification();
  const uniqueConceptsFromData = useUniqueConceptsFromData(apkData, ggData);

  const handleFileProcessed = (rawData: unknown, type: DataType) => {
    console.log('📥 handleFileProcessed llamado:', { type, rawDataLength: (rawData as any[])?.length });
    try {
      if (type === 'apk') {
        const validation = validateApkData(rawData as unknown[]);
        console.log('✓ Validación APK:', validation);
        if (!validation.valid) {
          showError(validation.error || 'Datos inválidos');
          return;
        }
        const normalized = normalizeApkData(rawData as unknown[]);
        console.log('✓ Datos APK normalizados:', normalized.length, 'registros');
        setApkData(normalized);
        console.log('✓ setApkData llamado');
      } else {
        const validation = validateGgData(rawData as unknown[]);
        console.log('✓ Validación GG:', validation);
        if (!validation.valid) {
          showError(validation.error || 'Datos inválidos');
          return;
        }
        const normalized = normalizeGgData(rawData as unknown[]);
        console.log('✓ Datos GG normalizados:', normalized.length, 'registros');
        setGgData(normalized);
        console.log('✓ setGgData llamado');
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
        console.log('📊 Renderizando tabla:', { apkLength: apkData.length, ggLength: ggData.length });
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
      
      case 'concept-mapping':
        return <ConceptMappingManager />;
      
      case 'text-mapping':
        return <TextConceptMappingManager />;
      
      case 'prorrateo':
        return <ExpenseProration />;
      
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
      <Box sx={{ 
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}>
        <ErrorBoundary>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ErrorBoundary>
      </Box>
    </ThemeProvider>
  );
}

export default App;
