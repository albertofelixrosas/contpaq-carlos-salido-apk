import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Tabs, Tab } from '@mui/material';
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
import { useState } from 'react';

function AppContent() {
  const { 
    setDataByGroup, 
    apkData, 
    apkGgData,
    ggData, 
    epkData,
    epkGgData, 
    concepts, 
    setConcepts, 
    apkSegments,
    epkSegments,
    setSegmentsByGroup
  } = useAppContext();
  const { showSuccess, showError } = useNotification();
  
  // Estado para tabs de la sección de Tabla
  const [dataTableTab, setDataTableTab] = useState<'apk' | 'epk'>('apk');
  
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
          apkGg: apkGgData.length,
          epk: epkData.length,
          epkGg: epkGgData.length
        });
        
        const totalRecords = apkData.length + apkGgData.length + epkData.length + epkGgData.length;
        
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
              <Box>
                {/* Tabs para cambiar entre APK y EPK */}
                <Tabs value={dataTableTab} onChange={(_, value) => setDataTableTab(value)} sx={{ mb: 3 }}>
                  <Tab 
                    label={`APK - Aparcería (${apkData.length} vueltas, ${apkGgData.length} GG)`} 
                    value="apk" 
                  />
                  <Tab 
                    label={`EPK - Producción (${epkData.length} vueltas, ${epkGgData.length} GG)`} 
                    value="epk" 
                  />
                </Tabs>

                {/* Contenido según tab activo */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {dataTableTab === 'apk' ? (
                    <>
                      {apkData.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            APK - Vueltas ({apkData.length} registros)
                          </Typography>
                          <DataTable
                            data={apkData}
                            type="apk"
                            dataGroup="apk"
                            onEdit={(record) => console.log('Edit APK:', record)}
                            onDelete={(id) => console.log('Delete APK:', id)}
                            onExport={() => console.log('Export APK')}
                          />
                        </Box>
                      )}
                      
                      {apkGgData.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            APK - Gastos Generales ({apkGgData.length} registros)
                          </Typography>
                          <DataTable
                            data={apkGgData}
                            type="gg"
                            dataGroup="apk"
                            onEdit={(record) => console.log('Edit APK-GG:', record)}
                            onDelete={(id) => console.log('Delete APK-GG:', id)}
                            onExport={() => console.log('Export APK-GG')}
                          />
                        </Box>
                      )}

                      {apkData.length === 0 && apkGgData.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No hay datos de APK cargados
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      {epkData.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            EPK - Vueltas ({epkData.length} registros)
                          </Typography>
                          <DataTable
                            data={epkData}
                            type="epk"
                            dataGroup="epk"
                            onEdit={(record) => console.log('Edit EPK:', record)}
                            onDelete={(id) => console.log('Delete EPK:', id)}
                            onExport={() => console.log('Export EPK')}
                          />
                        </Box>
                      )}
                      
                      {epkGgData.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            EPK - Gastos Generales ({epkGgData.length} registros)
                          </Typography>
                          <DataTable
                            data={epkGgData}
                            type="gg"
                            dataGroup="epk"
                            onEdit={(record) => console.log('Edit EPK-GG:', record)}
                            onDelete={(id) => console.log('Delete EPK-GG:', id)}
                            onExport={() => console.log('Export EPK-GG')}
                          />
                        </Box>
                      )}

                      {epkData.length === 0 && epkGgData.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No hay datos de EPK cargados
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
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
            apkSegments={apkSegments}
            epkSegments={epkSegments}
            onSave={(dataGroup, updatedSegments) => {
              setSegmentsByGroup(dataGroup, updatedSegments);
              showSuccess(`Segmentos de ${dataGroup.toUpperCase()} guardados correctamente`);
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
