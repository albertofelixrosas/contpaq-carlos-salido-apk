import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
  Download,
  FilterList,
} from '@mui/icons-material';
import { getConcepts } from '../../services/localStorage';
import type { ApkRecord, GgRecord, DataType } from '../../types';

interface DataTableProps {
  data: ApkRecord[] | GgRecord[];
  type: DataType;
  onEdit?: (record: ApkRecord | GgRecord) => void;
  onDelete?: (id: number) => void;
  onExport?: () => void;
}

/**
 * Tabla de datos con TanStack Table
 * Incluye ordenamiento, filtrado, paginación y acciones
 */
export const DataTable = ({ data, type, onEdit, onDelete, onExport }: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Estados para filtros personalizados
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [conceptoFilter, setConceptoFilter] = useState('');
  const [vueltaFilter, setVueltaFilter] = useState('');

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ApkRecord | GgRecord | null>(null);
  const [selectedConcepto, setSelectedConcepto] = useState('');

  // Extraer valores únicos para los selects
  const uniqueConceptos = useMemo(() => {
    const conceptos = new Set(data.map(record => record.concepto).filter(Boolean));
    return Array.from(conceptos).sort();
  }, [data]);

  const uniqueVueltas = useMemo(() => {
    if (type === 'apk') {
      const vueltas = new Set((data as ApkRecord[]).map(record => record.vuelta).filter(Boolean));
      return Array.from(vueltas).sort();
    } else {
      const segmentos = new Set((data as GgRecord[]).map(record => record.segmento).filter(Boolean));
      return Array.from(segmentos).sort();
    }
  }, [data, type]);

  // Aplicar filtros personalizados
  const applyCustomFilters = (filters: ColumnFiltersState) => {
    const newFilters = [...filters];
    
    if (proveedorFilter) {
      newFilters.push({ id: 'proveedor', value: proveedorFilter });
    }
    if (conceptoFilter) {
      newFilters.push({ id: 'concepto', value: conceptoFilter });
    }
    if (vueltaFilter) {
      const field = type === 'apk' ? 'vuelta' : 'segmento';
      newFilters.push({ id: field, value: vueltaFilter });
    }
    
    setColumnFilters(newFilters);
  };

  // Actualizar filtros cuando cambien los valores
  useMemo(() => {
    applyCustomFilters([]);
  }, [proveedorFilter, conceptoFilter, vueltaFilter]);

  const clearFilters = () => {
    setProveedorFilter('');
    setConceptoFilter('');
    setVueltaFilter('');
    setColumnFilters([]);
  };

  // Funciones para manejar el modal de edición
  const handleRowClick = (record: ApkRecord | GgRecord) => {
    setSelectedRecord(record);
    setSelectedConcepto(record.concepto);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    setSelectedConcepto('');
  };

  const handleSaveConcepto = () => {
    if (!selectedRecord) return;

    // Aquí se implementará la lógica para actualizar el concepto en localStorage
    console.log('Guardando concepto:', selectedConcepto, 'para registro:', selectedRecord);
    
    // TODO: Implementar actualización en localStorage
    // 1. Obtener datos actuales
    // 2. Encontrar el registro por ID
    // 3. Actualizar el concepto
    // 4. Guardar de vuelta en localStorage
    // 5. Actualizar el contexto
    
    handleCloseModal();
  };

  // Obtener conceptos predefinidos
  const availableConcepts = useMemo(() => {
    const concepts = getConcepts();
    return concepts.map(c => c.text);
  }, []);

  // Definir columnas según el tipo de datos
  const columns = useMemo<ColumnDef<ApkRecord | GgRecord>[]>(() => {
    if (type === 'apk') {
      return [
        {
          accessorKey: 'id',
          header: 'ID',
          size: 70,
        },
        {
          accessorKey: 'fecha',
          header: 'Fecha',
          size: 100,
        },
        {
          accessorKey: 'egresos',
          header: 'Egresos',
          size: 100,
        },
        {
          accessorKey: 'folio',
          header: 'Folio',
          size: 80,
        },
        {
          accessorKey: 'proveedor',
          header: 'Proveedor',
          size: 200,
        },
        {
          accessorKey: 'factura',
          header: 'Factura',
          size: 120,
        },
        {
          accessorKey: 'importe',
          header: 'Importe',
          size: 120,
          cell: (info) => {
            const value = info.getValue() as number;
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
            }).format(value);
          },
        },
        {
          accessorKey: 'concepto',
          header: 'Concepto',
          size: 200,
        },
        {
          accessorKey: 'vuelta',
          header: 'Vuelta',
          size: 80,
        },
        {
          accessorKey: 'mes',
          header: 'Mes',
          size: 80,
        },
        {
          accessorKey: 'año',
          header: 'Año',
          size: 80,
        },
      ];
    } else {
      // Columnas para GG
      return [
        {
          accessorKey: 'id',
          header: 'ID',
          size: 70,
        },
        {
          accessorKey: 'fecha',
          header: 'Fecha',
          size: 100,
        },
        {
          accessorKey: 'egresos',
          header: 'Egresos',
          size: 100,
        },
        {
          accessorKey: 'folio',
          header: 'Folio',
          size: 80,
        },
        {
          accessorKey: 'proveedor',
          header: 'Proveedor',
          size: 200,
        },
        {
          accessorKey: 'factura',
          header: 'Factura',
          size: 120,
        },
        {
          accessorKey: 'importe',
          header: 'Importe',
          size: 120,
          cell: (info) => {
            const value = info.getValue() as number;
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
            }).format(value);
          },
        },
        {
          accessorKey: 'concepto',
          header: 'Concepto',
          size: 200,
        },
        {
          accessorKey: 'segmento',
          header: 'Segmento',
          size: 120,
        },
        {
          accessorKey: 'mes',
          header: 'Mes',
          size: 80,
        },
        {
          accessorKey: 'año',
          header: 'Año',
          size: 80,
        },
      ];
    }
  }, [type, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnFilters: true,
  });

  const handleCopyToClipboard = () => {
    const headers = columns.filter(col => col.id !== 'actions').map(col => col.header);
    const rows = table.getFilteredRowModel().rows.map(row => 
      columns
        .filter(col => col.id !== 'actions')
        .map(col => {
          const cell = row.getAllCells().find(c => c.column.id === col.id);
          return cell?.getValue() ?? '';
        })
    );
    
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    navigator.clipboard.writeText(tsvContent);
  };

  if (data.length === 0) {
    return (
      <Paper sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay datos para mostrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Carga un archivo {type.toUpperCase()} desde la pestaña "Carga de Archivos"
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Totales - Ahora arriba */}
      <Paper sx={{ padding: 2, mb: 2, backgroundColor: 'primary.50' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="space-around">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Absoluto
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
              }).format(
                data.reduce((sum, record) => sum + (record.importe || 0), 0)
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({data.length} registros)
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Filtrado
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
              }).format(
                table.getFilteredRowModel().rows.reduce((sum, row) => {
                  const record = row.original as ApkRecord | GgRecord;
                  return sum + (record.importe || 0);
                }, 0)
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({table.getFilteredRowModel().rows.length} registros)
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Filtros Personalizados */}
      <Paper sx={{ padding: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <FilterList color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Filtros
          </Typography>
        </Stack>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Filtro de Proveedor */}
          <TextField
            label="Proveedor"
            size="small"
            value={proveedorFilter}
            onChange={(e) => setProveedorFilter(e.target.value)}
            placeholder="Buscar por proveedor..."
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}
          />

          {/* Filtro de Concepto */}
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Concepto</InputLabel>
            <Select
              value={conceptoFilter}
              onChange={(e) => setConceptoFilter(e.target.value)}
              label="Concepto"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {uniqueConceptos.map((concepto) => (
                <MenuItem key={concepto} value={concepto}>
                  {concepto}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro de Vuelta/Segmento */}
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>{type === 'apk' ? 'Vuelta' : 'Segmento'}</InputLabel>
            <Select
              value={vueltaFilter}
              onChange={(e) => setVueltaFilter(e.target.value)}
              label={type === 'apk' ? 'Vuelta' : 'Segmento'}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {uniqueVueltas.map((vuelta) => (
                <MenuItem key={vuelta} value={vuelta}>
                  {vuelta}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botón Limpiar Filtros */}
          {(proveedorFilter || conceptoFilter || vueltaFilter) && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
            >
              Limpiar
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Toolbar */}
      <Paper sx={{ padding: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar en todas las columnas..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 } }}
          />
          
          <Chip 
            label={`${table.getFilteredRowModel().rows.length} registros`}
            color="primary"
            variant="outlined"
          />

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopyToClipboard}
            >
              Copiar
            </Button>
            {onExport && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download />}
                onClick={onExport}
              >
                Exportar
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ 
        maxHeight: { xs: 400, sm: 500, md: 600 },
        overflowX: 'auto',
      }}>
        <Table stickyHeader size="small">
          <TableHead>
            {/* Fila de encabezados con ordenamiento */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      width: header.column.columnDef.size,
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontWeight: 600,
                      backgroundColor: 'background.paper',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === 'asc' && (
                        <ArrowUpward fontSize="small" />
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => handleRowClick(row.original)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    transform: 'scale(1.01)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={table.getFilteredRowModel().rows.length}
        page={pagination.pageIndex}
        onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, pageIndex: newPage }))}
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(e) => setPagination({ pageIndex: 0, pageSize: parseInt(e.target.value, 10) })}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Modal de edición */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Editar Registro
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ pt: 2 }}>
              {/* Información del registro */}
              <Typography variant="h6" gutterBottom>
                Información del Registro
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.fecha}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Folio
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.folio}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Factura
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.factura}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Proveedor
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.proveedor}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Importe
                    </Typography>
                    <Typography variant="body1">
                      ${selectedRecord.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {type === 'apk' ? 'Vuelta' : 'Segmento'}
                    </Typography>
                    <Typography variant="body1">
                      {type === 'apk' ? (selectedRecord as ApkRecord).vuelta : (selectedRecord as GgRecord).segmento}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Concepto Actual
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.concepto}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Formulario de edición */}
              <Typography variant="h6" gutterBottom>
                Editar Concepto
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Concepto</InputLabel>
                <Select
                  value={selectedConcepto}
                  label="Concepto"
                  onChange={(e) => setSelectedConcepto(e.target.value)}
                >
                  {availableConcepts.map((concepto) => (
                    <MenuItem key={concepto} value={concepto}>
                      {concepto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveConcepto} 
            variant="contained"
            disabled={!selectedConcepto}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
