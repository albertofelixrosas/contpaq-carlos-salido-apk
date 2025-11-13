import { useMemo } from 'react';
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
  IconButton,
  Chip,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  Edit,
  Delete,
  ContentCopy,
  Download,
} from '@mui/icons-material';
import { useState } from 'react';
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
        {
          id: 'actions',
          header: 'Acciones',
          size: 120,
          cell: (info) => (
            <Stack direction="row" spacing={0.5}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(info.row.original)}
                  title="Editar"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(info.row.original.id)}
                  title="Eliminar"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
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
        {
          id: 'actions',
          header: 'Acciones',
          size: 120,
          cell: (info) => (
            <Stack direction="row" spacing={0.5}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(info.row.original)}
                  title="Editar"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(info.row.original.id)}
                  title="Eliminar"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
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
    <Box>
      {/* Toolbar */}
      <Paper sx={{ padding: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar en todos los campos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
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
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
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
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
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
    </Box>
  );
};
