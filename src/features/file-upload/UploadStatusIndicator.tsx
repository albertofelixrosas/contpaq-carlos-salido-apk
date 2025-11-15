import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { getCurrentMonthHistory } from '../../services/localStorage';
import type { UploadFileType } from '../../types';

/**
 * Configuración de los 4 tipos de archivos esperados
 */
const FILE_TYPES_CONFIG: { type: UploadFileType; label: string; color: 'primary' | 'secondary' }[] = [
  { type: 'apk-vueltas', label: 'APK - Vueltas', color: 'primary' },
  { type: 'apk-gg', label: 'APK - GG', color: 'primary' },
  { type: 'epk-vueltas', label: 'EPK - Vueltas', color: 'secondary' },
  { type: 'epk-gg', label: 'EPK - GG', color: 'secondary' },
];

/**
 * Componente que muestra el estado de carga de archivos del mes actual
 * Indica cuáles archivos ya se han subido (verde) y cuáles faltan (rojo)
 */
export const UploadStatusIndicator = () => {
  const history = getCurrentMonthHistory();

  // Función para verificar si un tipo de archivo ya se cargó
  const isUploaded = (fileType: UploadFileType): boolean => {
    return history.uploads.some((u) => u.fileType === fileType);
  };

  // Obtener nombre del archivo cargado
  const getFileName = (fileType: UploadFileType): string | null => {
    const upload = history.uploads.find((u) => u.fileType === fileType);
    return upload ? upload.fileName : null;
  };

  // Formatear fecha del mes actual
  const getFormattedMonth = (): string => {
    const [year, month] = history.month.split('-');
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Contar archivos cargados
  const uploadedCount = FILE_TYPES_CONFIG.filter((config) => isUploaded(config.type)).length;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            📊 Estado de Carga - {getFormattedMonth()}
          </Typography>
          <Chip
            label={`${uploadedCount}/4`}
            color={uploadedCount === 4 ? 'success' : 'default'}
            variant={uploadedCount === 4 ? 'filled' : 'outlined'}
          />
        </Stack>

        <Stack spacing={2}>
          {FILE_TYPES_CONFIG.map((config) => {
            const uploaded = isUploaded(config.type);
            const fileName = getFileName(config.type);

            return (
              <Box
                key={config.type}
                sx={{
                  p: 2,
                  border: 2,
                  borderColor: uploaded ? 'success.main' : 'error.main',
                  borderRadius: 1,
                  backgroundColor: uploaded ? 'success.50' : 'error.50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.3s',
                }}
              >
                {uploaded ? (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                ) : (
                  <Cancel sx={{ color: 'error.main', fontSize: 24 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: uploaded ? 'success.dark' : 'error.dark',
                    }}
                  >
                    {config.label}
                  </Typography>
                  {fileName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={fileName}
                    >
                      {fileName}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={uploaded ? 'Cargado' : 'Pendiente'}
                  size="small"
                  color={uploaded ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            );
          })}
        </Stack>

        {uploadedCount === 4 && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'success.50', borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark" sx={{ textAlign: 'center' }}>
              ✅ Todos los archivos del mes han sido cargados
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
