import { useState, useEffect } from 'react';
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
  Stack,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download, Delete, Refresh } from '@mui/icons-material';
import type { AccountCatalogEntry } from '../../types';
import { getAccountCatalog, clearAccountCatalog } from '../../services/localStorage';

/**
 * Componente para gestionar el catálogo de cuentas contables
 * Muestra todas las cuentas detectadas en los archivos procesados
 */
export const AccountCatalogManager = () => {
  const [catalog, setCatalog] = useState<AccountCatalogEntry[]>([]);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = () => {
    const data = getAccountCatalog();
    // Ordenar por tipo (APK primero) y luego por código
    const sorted = data.sort((a, b) => {
      if (a.dataType !== b.dataType) {
        return a.dataType === 'apk' ? -1 : 1;
      }
      return a.fullCode.localeCompare(b.fullCode);
    });
    setCatalog(sorted);
  };

  const handleExport = () => {
    if (catalog.length === 0) {
      alert('No hay cuentas para exportar');
      return;
    }

    // Formato: código|nombre|tipo|ocurrencias
    const lines = catalog.map(entry => 
      `${entry.fullCode}|${entry.accountName}|${entry.dataType.toUpperCase()}|${entry.occurrences}`
    );
    
    const content = [
      '# Catálogo de Cuentas Contables',
      `# Generado: ${new Date().toLocaleString('es-MX')}`,
      `# Total de cuentas: ${catalog.length}`,
      '# Formato: CÓDIGO|NOMBRE|TIPO|OCURRENCIAS',
      '',
      ...lines
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogo-cuentas-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('¿Estás seguro de que deseas limpiar el catálogo de cuentas? Esta acción no se puede deshacer.')) {
      clearAccountCatalog();
      loadCatalog();
    }
  };

  const stats = {
    total: catalog.length,
    apk: catalog.filter(e => e.dataType === 'apk').length,
    epk: catalog.filter(e => e.dataType === 'epk').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              📋 Catálogo de Cuentas Contables
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registro de todas las cuentas contables detectadas en los archivos procesados
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Recargar">
              <IconButton onClick={loadCatalog} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleClear}
              disabled={catalog.length === 0}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={catalog.length === 0}
            >
              Exportar TXT
            </Button>
          </Stack>
        </Stack>

        {/* Estadísticas */}
        <Stack direction="row" spacing={2} mb={3}>
          <Chip label={`Total: ${stats.total}`} color="primary" />
          <Chip label={`APK: ${stats.apk}`} color="info" variant="outlined" />
          <Chip label={`EPK: ${stats.epk}`} color="secondary" variant="outlined" />
        </Stack>

        {/* Información */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>¿Cómo funciona?</strong> Al procesar archivos Excel, el sistema registra automáticamente
            todas las cuentas contables encontradas (código completo + nombre). Esta información te permite
            identificar todas las cuentas utilizadas y definir criterios de mapeo.
          </Typography>
        </Alert>

        {/* Tabla de catálogo */}
        {catalog.length === 0 ? (
          <Alert severity="warning">
            No hay cuentas registradas. Procesa un archivo Excel para comenzar a llenar el catálogo.
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Código Completo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre de Cuenta</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Ocurrencias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                      >
                        {entry.fullCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.accountName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.dataType.toUpperCase()} 
                        size="small" 
                        color={entry.dataType === 'apk' ? 'info' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={entry.occurrences} 
                        size="small" 
                        color="default"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
