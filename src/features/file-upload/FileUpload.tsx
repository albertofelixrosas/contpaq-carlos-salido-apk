import { useState } from 'react';
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
  Delete,
} from '@mui/icons-material';
import type { DataType } from '../../types';

interface FileUploadProps {
  onFileProcessed: (data: unknown, type: DataType) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

interface FileState {
  file: File | null;
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
  recordCount?: number;
}

/**
 * Componente de carga de archivos Excel (APK y GG)
 * Permite arrastrar y soltar o seleccionar archivos
 * Valida formato y tamaño antes de procesar
 */
export const FileUpload = ({ onFileProcessed, onError, onSuccess }: FileUploadProps) => {
  const [apkState, setApkState] = useState<FileState>({
    file: null,
    status: 'idle',
  });
  const [ggState, setGgState] = useState<FileState>({
    file: null,
    status: 'idle',
  });
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File, type: DataType) => {
    const setState = type === 'apk' ? setApkState : setGgState;
    
    setState({ file, status: 'processing' });

    try {
      // Importar SheetJS dinámicamente
      const XLSX = await import('xlsx');
      
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
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

            setState({
              file,
              status: 'success',
              recordCount: jsonData.length,
            });

            onFileProcessed(jsonData, type);
            onSuccess(`Archivo ${type.toUpperCase()} cargado: ${jsonData.length} registros`);
            resolve();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar archivo';
            setState({
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
          setState({
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
      setState({
        file,
        status: 'error',
        error: errorMessage,
      });
      onError(errorMessage);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: DataType) => {
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
      
      processFile(file, type);
    }
  };

  const handleRemoveFile = (type: DataType) => {
    if (type === 'apk') {
      setApkState({ file: null, status: 'idle' });
    } else {
      setGgState({ file: null, status: 'idle' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: DataType) => {
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
      
      processFile(file, type);
    }
  };

  const renderFileCard = (
    title: string,
    type: DataType,
    state: FileState,
  ) => {
    return (
      <Card
        sx={{
          border: isDragging ? '2px dashed' : '1px solid',
          borderColor: state.status === 'success' ? 'success.main' : state.status === 'error' ? 'error.main' : 'divider',
          backgroundColor: state.status === 'success' ? 'success.50' : 'background.paper',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
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
            {state.status === 'idle' && (
              <>
                <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                  Arrastra el archivo aquí
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  o
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<Upload />}
                  size="medium"
                  sx={{ mb: 2 }}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    hidden
                    accept=".xls,.xlsx"
                    onChange={(e) => handleFileChange(e, type)}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" display="block">
                  Formatos: .xls, .xlsx (máx. 5MB)
                </Typography>
              </>
            )}

            {state.status === 'processing' && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Procesando archivo...
                </Typography>
                <LinearProgress sx={{ mt: 2 }} />
              </Box>
            )}

            {state.status === 'success' && state.file && (
              <Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  {state.file.name}
                </Typography>
                <Chip
                  label={`${state.recordCount} registros`}
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    size="small"
                    onClick={() => handleRemoveFile(type)}
                  >
                    Remover archivo
                  </Button>
                </Box>
              </Box>
            )}

            {state.status === 'error' && (
              <Box>
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="body1" color="error" gutterBottom>
                  {state.error || 'Error al procesar archivo'}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleRemoveFile(type)}
                  sx={{ mt: 1 }}
                >
                  Intentar de nuevo
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          📂 Carga de Archivos
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Carga los archivos Excel exportados desde Contpaq. Puedes cargar solo APK, solo GG, o ambos.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>APK:</strong> Archivo principal con movimientos contables
          <br />
          <strong>GG:</strong> Archivo de gastos generales para prorrateo
        </Alert>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: { xs: 2, sm: 3 },
        }}>
          {renderFileCard('Archivo APK', 'apk', apkState)}
          {renderFileCard('Archivo GG', 'gg', ggState)}
        </Box>

        {(apkState.status === 'success' || ggState.status === 'success') && (
          <Alert severity="success" sx={{ mt: 3 }}>
            ✅ Archivos cargados correctamente. Dirígete a la pestaña "Tabla de Datos" para visualizar y editar.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};
