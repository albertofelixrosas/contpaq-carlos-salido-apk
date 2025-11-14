import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { Calculate, ContentCopy, Download } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../context/AppContext';
import { getProcessData, saveProcessData } from '../../services/localStorage';
import { useNotification } from '../../hooks/useNotification';
import type { ProrrateoRecord } from '../../types';
import { Snackbar } from '@mui/material';

/**
 * Componente de Prorrateo de Gastos
 * Distribuye los gastos de GG entre segmentos según su porcentaje
 */
export const ExpenseProration = () => {
  const { ggData, segments } = useAppContext();
  const { showSuccess, showError, showWarning, notification, hideNotification } = useNotification();
  const [prorrateoData, setProrrateoData] = useState<ProrrateoRecord[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Calcular total de cerdos
  const totalCerdos = useMemo(() => {
    return segments.reduce((sum, segment) => sum + segment.count, 0);
  }, [segments]);

  // Calcular totales por concepto
  const conceptTotals = useMemo(() => {
    const totals = new Map<string, number>();
    
    ggData.forEach(record => {
      const concepto = record.concepto;
      const importe = record.importe || 0;

      if (concepto && importe !== 0) {
        totals.set(concepto, (totals.get(concepto) || 0) + importe);
      }
    });

    return totals;
  }, [ggData]);

  // Calcular total del prorrateo
  const totalProrrateo = useMemo(() => {
    return prorrateoData.reduce((sum, record) => sum + record.importe, 0);
  }, [prorrateoData]);

  // Formatear fecha para prorrateo (último día del mes actual)
  const formatDateForProrrateo = (date: Date): string => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Parsear fecha para extraer mes y año
  const parseDateForProrrateo = (date: Date) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      monthString: months[date.getMonth()],
      year: date.getFullYear(),
    };
  };

  // Generar prorrateo
  const handleGenerateProration = () => {
    try {
      if (ggData.length === 0 || segments.length === 0) {
        showError('No hay datos suficientes para generar el prorrateo. Asegúrate de tener datos GG y segmentos configurados.');
        return;
      }

      if (totalCerdos === 0) {
        showError('El total de cerdos no puede ser 0. Verifica la configuración de segmentos.');
        return;
      }

      const prorrateoRecords: ProrrateoRecord[] = [];
      let recordId = 1;

      // Obtener fecha (último día del mes anterior)
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const fechaProrrateo = formatDateForProrrateo(currentMonth);
      const { monthString, year } = parseDateForProrrateo(currentMonth);

      // Generar registros para cada combinación concepto-segmento
      conceptTotals.forEach((totalImporte, concepto) => {
        segments.forEach(segment => {
          const porcentaje = segment.count / totalCerdos;
          const importeProrrateo = totalImporte * porcentaje;

          const record: ProrrateoRecord = {
            id: recordId++,
            fecha: fechaProrrateo,
            egresos: '',
            folio: '',
            proveedor: `${concepto} (prorrateo)`,
            factura: '',
            importe: Math.round(importeProrrateo * 100) / 100, // Redondear a 2 decimales
            concepto: concepto,
            vuelta: segment.segment,
            mes: monthString,
            año: year.toString(),
          };

          prorrateoRecords.push(record);
        });
      });

      // Guardar datos de prorrateo
      const processData = getProcessData();
      processData.prorrateo = prorrateoRecords;
      saveProcessData(processData);

      setProrrateoData(prorrateoRecords);
      setShowResults(true);

      console.log(`✅ Prorrateo generado: ${prorrateoRecords.length} registros creados`);
    } catch (error) {
      console.error('❌ Error generando prorrateo:', error);
      showError('Error al generar el prorrateo. Verifica que todos los datos sean válidos.');
    }
  };

  // Copiar al portapapeles
  const handleCopyToClipboard = () => {
    if (prorrateoData.length === 0) {
      showWarning('No hay datos de prorrateo para copiar. Genera primero los datos.');
      return;
    }

    try {
      // Crear encabezados
      const headers = ['ID', 'Fecha', 'Egresos', 'Folio', 'Proveedor', 'Factura', 'Importe', 'Concepto', 'Vuelta', 'Mes', 'Año'];
      let tableText = headers.join('\t') + '\n';

      // Agregar filas
      prorrateoData.forEach(record => {
        const row = [
          record.id,
          record.fecha,
          record.egresos,
          record.folio,
          record.proveedor,
          record.factura,
          record.importe,
          record.concepto,
          record.vuelta,
          record.mes,
          record.año,
        ];
        tableText += row.join('\t') + '\n';
      });

      navigator.clipboard.writeText(tableText).then(() => {
        showSuccess('¡Datos de prorrateo copiados al portapapeles!');
      }).catch((error) => {
        console.error('Error al copiar:', error);
        showError('Error al copiar los datos al portapapeles.');
      });
    } catch (error) {
      console.error('Error al copiar:', error);
      showError('Error al copiar los datos al portapapeles.');
    }
  };

  // Descargar como Excel
  const handleDownloadExcel = () => {
    if (prorrateoData.length === 0) {
      showWarning('No hay datos de prorrateo para descargar. Genera el prorrateo primero.');
      return;
    }

    try {
      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Convertir datos a formato de hoja
      const ws = XLSX.utils.json_to_sheet(prorrateoData);

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Prorrateo');

      // Descargar archivo
      const fileName = `prorrateo_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Archivo de prorrateo descargado');
    } catch (error) {
      console.error('Error descargando archivo:', error);
      showError('Error al generar el archivo de descarga.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          📊 Prorrateo de Gastos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Distribuye los gastos generales entre los segmentos según su porcentaje de cerdos
        </Typography>

        {/* Resumen de información */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Registros GG
            </Typography>
            <Typography variant="h6">{ggData.length}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Segmentos Configurados
            </Typography>
            <Typography variant="h6">{segments.length}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total Cerdos
            </Typography>
            <Typography variant="h6">{totalCerdos}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Conceptos Únicos
            </Typography>
            <Typography variant="h6">{conceptTotals.size}</Typography>
          </Paper>
        </Stack>

        {/* Validaciones */}
        {ggData.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay datos de GG disponibles. Carga un archivo con tipo "GG" para continuar.
          </Alert>
        )}

        {segments.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay segmentos configurados. Ve a la sección de Segmentos para agregar segmentos.
          </Alert>
        )}

        {totalCerdos === 0 && segments.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            El total de cerdos es 0. Asegúrate de que los segmentos tengan un conteo mayor a 0.
          </Alert>
        )}

        {/* Botón para generar */}
        <Button
          variant="contained"
          startIcon={<Calculate />}
          onClick={handleGenerateProration}
          disabled={ggData.length === 0 || segments.length === 0 || totalCerdos === 0}
          fullWidth
          sx={{ mb: 2 }}
        >
          Generar Prorrateo
        </Button>

        {/* Resultados */}
        {showResults && prorrateoData.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {/* Totales */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Registros Generados
                  </Typography>
                  <Typography variant="h6">{prorrateoData.length}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Prorrateo
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${totalProrrateo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Acciones */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyToClipboard}
                fullWidth
              >
                Copiar al Portapapeles
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadExcel}
                fullWidth
              >
                Descargar Excel
              </Button>
            </Stack>

            {/* Tabla de resultados */}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Proveedor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Importe</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Concepto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vuelta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Año</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prorrateoData.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.fecha}</TableCell>
                      <TableCell>{record.proveedor}</TableCell>
                      <TableCell>
                        <Chip
                          label={`$${record.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                          size="small"
                          color={record.importe >= 0 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{record.concepto}</TableCell>
                      <TableCell>
                        <Chip label={record.vuelta} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{record.mes}</TableCell>
                      <TableCell>{record.año}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideNotification} severity={notification.type} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
