import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import type { FileDetectionResult } from '../../types';
import { isFileTypeUploadedThisMonth, getUploadFileType } from '../../services/localStorage';

interface FileConfirmationDialogProps {
  open: boolean;
  detection: FileDetectionResult | null;
  recordCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FileConfirmationDialog: React.FC<FileConfirmationDialogProps> = ({
  open,
  detection,
  recordCount,
  onConfirm,
  onCancel,
}) => {
  if (!detection) return null;

  // Verificar si este tipo de archivo ya se cargó este mes
  const fileType = getUploadFileType(detection.processType, detection.isGastoGeneral);
  const isAlreadyUploaded = isFileTypeUploadedThisMonth(fileType);

  const getProcessTypeLabel = (type: string) => {
    return type === 'apk' ? 'APK (Aparcería)' : 'EPK (Producción/Engorda)';
  };

  const getProcessTypeColor = (type: string) => {
    return type === 'apk' ? 'primary' : 'secondary';
  };

  const getFileTypeLabel = (type: string, isGG: boolean) => {
    const processLabel = type.toUpperCase();
    return isGG ? `${processLabel} - GG` : `${processLabel} - Vueltas`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 50) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta';
    if (confidence >= 50) return 'Media';
    return 'Baja';
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isAlreadyUploaded ? (
            <ErrorIcon color="error" />
          ) : detection.confidence >= 70 ? (
            <CheckCircleIcon color="success" />
          ) : (
            <WarningIcon color="warning" />
          )}
          <Typography variant="h6">Confirmar Carga de Archivo</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Alerta de archivo duplicado */}
          {isAlreadyUploaded && (
            <Alert severity="error">
              ⚠️ <strong>Este tipo de archivo ya fue cargado este mes.</strong>
              <br />
              Ya existe un archivo de tipo <strong>{getFileTypeLabel(detection.processType, detection.isGastoGeneral)}</strong> cargado.
              No puedes cargar otro archivo del mismo tipo hasta el próximo mes.
            </Alert>
          )}

          {/* Alerta según confianza */}
          {!isAlreadyUploaded && detection.confidence < 70 && (
            <Alert severity="warning">
              La detección automática tiene confianza {getConfidenceLabel(detection.confidence)}.
              Por favor verifica que la información detectada sea correcta antes de continuar.
            </Alert>
          )}

          {/* Información detectada */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información Detectada
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Tipo de Proceso</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getProcessTypeLabel(detection.processType)}
                      color={getProcessTypeColor(detection.processType) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Tipo de Archivo</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getFileTypeLabel(detection.processType, detection.isGastoGeneral)}
                      variant="outlined"
                      size="small"
                      color={getProcessTypeColor(detection.processType) as any}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Periodo</strong>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{detection.periodo}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Registros Detectados</strong>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{recordCount} registros</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Grupo de Datos</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={detection.dataGroup.toUpperCase()}
                      color="default"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Confianza de Detección</strong>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${detection.confidence}%`}
                        color={getConfidenceColor(detection.confidence) as any}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({getConfidenceLabel(detection.confidence)})
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Indicadores técnicos (colapsable o en detalle) */}
          {detection.confidence < 80 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Indicadores Encontrados
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="caption" color={detection.indicators.foundCode132 ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundCode132 ? '✓' : '✗'} Código 132-xxx (Aparcería)
                </Typography>
                <Typography variant="caption" color={detection.indicators.foundCode133 ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundCode133 ? '✓' : '✗'} Código 133-xxx (Producción)
                </Typography>
                <Typography variant="caption" color={detection.indicators.foundAparceriaText ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundAparceriaText ? '✓' : '✗'} Texto "APARCERÍA EN PROCESO"
                </Typography>
                <Typography variant="caption" color={detection.indicators.foundProduccionText ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundProduccionText ? '✓' : '✗'} Texto "PRODUCCION DE CERDOS EN PROCESO"
                </Typography>
                <Typography variant="caption" color={detection.indicators.foundSegmentosVueltas ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundSegmentosVueltas ? '✓' : '✗'} Segmentos de Vueltas (APK/EPK) detectados
                </Typography>
                <Typography variant="caption" color={detection.indicators.foundSegmentosGG ? 'success.main' : 'text.disabled'}>
                  {detection.indicators.foundSegmentosGG ? '✓' : '✗'} Segmentos de Gastos Generales (GG) detectados
                </Typography>
              </Stack>
            </Box>
          )}

          <Alert severity="info">
            Los datos se guardarán en: <strong>{detection.dataGroup.toUpperCase()}</strong>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="success"
          disabled={isAlreadyUploaded}
          autoFocus
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
