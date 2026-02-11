import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Upload,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  ArrowForward,
  DeleteSweep,
} from '@mui/icons-material';
import type { FileDetectionResult } from '../../types';
import { detectFileType } from './fileParser';
import { FileConfirmationDialog } from './FileConfirmationDialog';
import { UploadStatusIndicator } from './UploadStatusIndicator';
import { areAllFilesUploadedThisMonth, registerMonthlyUpload, getUploadFileType } from '../../services/localStorage';
import { useAppContext } from '../../context/AppContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../../components/Feedback/ConfirmDialog';

interface FileUploadProps {
  onFileProcessed: (data: unknown, detection: FileDetectionResult) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

interface FileState {
  file: File | null;
  status: 'idle' | 'processing' | 'detecting' | 'confirming' | 'success' | 'error';
  error?: string;
  recordCount?: number;
  detection?: FileDetectionResult;
  rawData?: unknown;
}

/**
 * Componente de carga de archivos Excel con detección automática
 * Detecta automáticamente si es APK, EPK, con vueltas o GG
 * Muestra modal de confirmación antes de guardar
 */
export const FileUpload = ({ onFileProcessed, onError, onSuccess }: FileUploadProps) => {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    status: 'idle',
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { clearUploadData } = useAppContext();
  const { dialog, showConfirm, hideConfirm, handleConfirm } = useConfirmDialog();

  const processFile = async (file: File) => {
    setFileState({ file, status: 'processing' });

    try {
      // Importar SheetJS dinámicamente
      const XLSX = await import('xlsx');
      
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Tomar la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a array de arrays (igual que el código vanilla)
            // header: 1 significa que cada fila es un array en lugar de un objeto
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              throw new Error('El archivo está vacío');
            }

            // PASO 2: Detectar tipo de archivo
            setFileState(prev => ({ ...prev, status: 'detecting' }));
            const detection = detectFileType(jsonData);
            
            // PASO 3: Mostrar modal de confirmación
            setFileState({
              file,
              status: 'confirming',
              recordCount: jsonData.length,
              detection,
              rawData: jsonData,
            });

            resolve();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar archivo';
            setFileState({
              file,
              status: 'error',
              error: errorMessage,
            });
            onError(errorMessage);
            reject(error);
          }
        };

        reader.onerror = () => {
          const errorMessage = 'Error al leer el archivo';
          setFileState({
            file,
            status: 'error',
            error: errorMessage,
          });
          onError(errorMessage);
          reject(new Error(errorMessage));
        };

        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setFileState({
        file,
        status: 'error',
        error: errorMessage,
      });
      onError(errorMessage);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        onError('El archivo no debe exceder 5MB');
        return;
      }
      
      // Validar extensión
      const validExtensions = ['.xls', '.xlsx'];
      if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        onError('Solo se permiten archivos Excel (.xls, .xlsx)');
        return;
      }
      
      processFile(file);
    }
  };

  const handleConfirmUpload = () => {
    if (fileState.rawData && fileState.detection) {
      setFileState(prev => ({ ...prev, status: 'success' }));
      
      // Registrar archivo en el historial mensual
      const fileType = getUploadFileType(
        fileState.detection.processType,
        fileState.detection.isGastoGeneral
      );
      registerMonthlyUpload(fileType, fileState.file?.name || 'archivo.xlsx');
      
      onFileProcessed(fileState.rawData, fileState.detection);
      onSuccess(
        `Archivo cargado: ${fileState.detection.dataGroup.toUpperCase()} - ${fileState.recordCount} registros`
      );
    }
  };

  const handleCancelUpload = () => {
    setFileState({
      file: null,
      status: 'idle',
    });
  };

  const handleRemoveFile = () => {
    setFileState({ file: null, status: 'idle' });
  };

  const handleResetUploadData = () => {
    showConfirm({
      title: 'Restablecer datos cargados',
      message:
        'Esto borrara todos los datos cargados y el historial mensual de archivos. Deberas subirlos nuevamente. Esta accion no se puede deshacer.',
      confirmText: 'Borrar datos',
      cancelText: 'Cancelar',
      severity: 'error',
      onConfirm: () => {
        clearUploadData();
        setFileState({ file: null, status: 'idle' });
        setIsDragging(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onSuccess('Datos en cache borrados. Puedes volver a cargar archivos.');
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        onError('El archivo no debe exceder 5MB');
        return;
      }
      
      // Validar extensión
      const validExtensions = ['.xls', '.xlsx'];
      if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        onError('Solo se permiten archivos Excel (.xls, .xlsx)');
        return;
      }
      
      processFile(file);
    }
  };

  const getStatusColor = () => {
    switch (fileState.status) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'confirming':
        return 'warning.main';
      default:
        return 'divider';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          📂 Carga de Archivo Excel
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Carga tu archivo Excel exportado desde Contpaq. El sistema detectará automáticamente si es APK, EPK, con vueltas o gastos generales.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Detección Automática:</strong>
          <br />
          • APK (Aparcería): Códigos 132-xxx o texto "APARCERÍA EN PROCESO"
          <br />
          • EPK (Producción/Engorda): Códigos 133-xxx o texto "PRODUCCION DE CERDOS EN PROCESO"
          <br />
          • Gastos Generales (GG): Segmento GG de "APARCERÍA EN PROCESO" y "PRODUCCION DE CERDOS EN PROCESO"
        </Alert>

        {/* Indicador de estado de carga del mes */}
        <UploadStatusIndicator />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweep />}
            onClick={handleResetUploadData}
          >
            Borrar datos cargados
          </Button>
        </Box>

        {/* Solo mostrar el input si no se han cargado todos los archivos */}
        {!areAllFilesUploadedThisMonth() ? (
          <Card
            sx={{
              border: '2px',
              borderStyle: isDragging ? 'dashed' : 'solid',
              borderColor: getStatusColor(),
              backgroundColor:
                fileState.status === 'success'
                  ? 'success.50'
                  : fileState.status === 'error'
                  ? 'error.50'
                  : 'background.paper',
            }}
          >
          <CardContent>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                padding: 3,
                textAlign: 'center',
                backgroundColor: isDragging ? 'primary.50' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'grey.50',
                },
              }}
            >
              {fileState.status === 'idle' && (
                <>
                  <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    Arrastra el archivo Excel aquí
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    o
                  </Typography>
                  <Button variant="contained" component="label" startIcon={<Upload />}>
                    Seleccionar Archivo
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept=".xls,.xlsx"
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    Tamaño máximo: 5MB
                  </Typography>
                </>
              )}

              {(fileState.status === 'processing' || fileState.status === 'detecting') && (
                <Box>
                  <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    {fileState.status === 'processing' ? 'Procesando archivo...' : 'Detectando tipo de archivo...'}
                  </Typography>
                  <LinearProgress sx={{ mt: 2 }} />
                </Box>
              )}

              {fileState.status === 'confirming' && (
                <Box>
                  <CheckCircle sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Esperando confirmación...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Por favor revisa la información detectada en el modal
                  </Typography>
                </Box>
              )}

              {fileState.status === 'success' && (
                <Box>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    {fileState.file?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                    {fileState.detection && (
                      <>
                        <Chip
                          label={fileState.detection.processType.toUpperCase()}
                          color={fileState.detection.processType === 'apk' ? 'primary' : 'secondary'}
                          size="small"
                        />
                        <Chip
                          label={fileState.detection.isGastoGeneral ? 'GG' : 'VUELTAS'}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`${fileState.recordCount} registros`}
                          color="success"
                          size="small"
                        />
                      </>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<ArrowForward />}
                    onClick={handleRemoveFile}
                  >
                    Continuar
                  </Button>
                </Box>
              )}

              {fileState.status === 'error' && (
                <Box>
                  <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                  <Typography variant="body1" color="error" gutterBottom>
                    {fileState.error || 'Error al procesar archivo'}
                  </Typography>
                  <Button variant="outlined" color="primary" size="small" onClick={handleRemoveFile} sx={{ mt: 1 }}>
                    Intentar de nuevo
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
        ) : (
          <Alert severity="success" sx={{ textAlign: 'center' }}>
            🎉 Ya se han cargado todos los archivos del mes. El área de carga estará disponible nuevamente el próximo mes.
          </Alert>
        )}

        {fileState.status === 'success' && (
          <Alert severity="success" sx={{ mt: 3 }}>
            ✅ Archivo cargado correctamente en{' '}
            <strong>{fileState.detection?.dataGroup.toUpperCase()}</strong>. Dirígete a la pestaña "Tabla de Datos"
            para visualizar y editar.
          </Alert>
        )}
      </Paper>

      {/* Modal de confirmación */}
      <FileConfirmationDialog
        open={fileState.status === 'confirming'}
        detection={fileState.detection || null}
        recordCount={fileState.recordCount || 0}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancelUpload}
      />

      <ConfirmDialog dialog={dialog} onConfirm={handleConfirm} onCancel={hideConfirm} />
    </Box>
  );
};
