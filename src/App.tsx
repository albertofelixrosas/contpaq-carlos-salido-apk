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
import type { FileDetectionResult } from './types';

function AppContent() {
  const { 
    setDataByGroup, 
    apkData, 
    ggData, 
    epkData, 
    concepts, 
    setConcepts, 
    segments, 
    setSegments 
  } = useAppContext();
  const { showSuccess, showError } = useNotification();
  
  // Combinar todos los datos para conceptos únicos
  const allData = [...apkData, ...epkData];
  const allGgData = ggData;
  const uniqueConceptsFromData = useUniqueConceptsFromData(allData, allGgData);

  const handleFileProcessed = (rawData: unknown, detection: FileDetectionResult) => {
    console.log('📥 handleFileProcessed llamado:', { 
      dataGroup: detection.dataGroup,
      processType: detection.processType,
      isGastoGeneral: detection.isGastoGeneral,
      rawDataLength: (rawData as any[])?.length 
    });
    
    try {
      const dataArray = rawData as unknown[];
      
      // Determinar si es archivo con vueltas o GG
      if (detection.isGastoGeneral) {
        // Es archivo GG
        const validation = validateGgData(dataArray);
        console.log('✓ Validación GG:', validation);
        if (!validation.valid) {
          showError(validation.error || 'Datos GG inválidos');
          return;
        }
        const normalized = normalizeGgData(dataArray, detection.processType);
        console.log('✓ Datos GG normalizados:', normalized.length, 'registros');
        setDataByGroup(detection.dataGroup, normalized, true); // true = isGG
        console.log(`✓ Datos guardados en ${detection.dataGroup} (GG)`);
      } else {
        // Es archivo con vueltas (APK o EPK)
        const validation = validateApkData(dataArray);
        console.log('✓ Validación APK/EPK:', validation);
        if (!validation.valid) {
          showError(validation.error || 'Datos inválidos');
          return;
        }
        const normalized = normalizeApkData(dataArray, detection.processType);
        console.log('✓ Datos normalizados:', normalized.length, 'registros');
        setDataByGroup(detection.dataGroup, normalized, false); // false = no es GG
        console.log(`✓ Datos guardados en ${detection.dataGroup} (Vueltas)`);
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
        console.log('📊 Renderizando tabla con datos:', { 
          apk: apkData.length, 
          gg: ggData.length,
          epk: epkData.length
        });
        
        const totalRecords = apkData.length + ggData.length + epkData.length;
        
        return (
          <Box>
            <Typography variant="h5" gutterBottom>📊 Tabla de Datos</Typography>
            
            {totalRecords === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay datos cargados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ve a la pestaña "Carga de Archivos" para cargar archivos APK o EPK
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {apkData.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      APK - Aparcería Vueltas ({apkData.length} registros)
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
                
                {epkData.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      EPK - Producción/Engorda Vueltas ({epkData.length} registros)
                    </Typography>
                    <DataTable
                      data={epkData}
                      type="epk"
                      onEdit={(record) => console.log('Edit EPK:', record)}
                      onDelete={(id) => console.log('Delete EPK:', id)}
                      onExport={() => console.log('Export EPK')}
                    />
                  </Box>
                )}
                
                {ggData.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Gastos Generales (APK + EPK) ({ggData.length} registros)
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
