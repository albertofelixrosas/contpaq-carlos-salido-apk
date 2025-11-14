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
  OutlinedInput,
  ListItemText,
  Checkbox,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
  Download,
  FilterList,
  SwapHoriz,
} from '@mui/icons-material';
import { getConcepts, getProcessData, saveProcessData } from '../../services/localStorage';
// import { useAppContext } from '../../context/AppContext'; // TODO: Re-habilitar cuando se restaure edit functionality
import { useNotification } from '../../hooks/useNotification';
import type { ApkRecord, GgRecord, DataType, DataGroup } from '../../types';

interface DataTableProps {
  data: ApkRecord[] | GgRecord[];
  type: DataType;
  dataGroup?: DataGroup; // Opcional: para saber dónde guardar cambios
  onEdit?: (record: ApkRecord | GgRecord) => void;
  onDelete?: (id: number) => void;
  onExport?: () => void;
}

/**
 * Tabla de datos con TanStack Table
 * Incluye ordenamiento, filtrado, paginación y acciones
 */
export const DataTable = ({ data, type, onEdit, onDelete, onExport }: DataTableProps) => {
  // const { setDataByGroup } = useAppContext(); // TODO: Re-habilitar cuando se agregue dataGroup prop
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Estados para filtro de período (mes/año)
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Estados para filtros personalizados
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [conceptoFilter, setConceptoFilter] = useState('');
  const [vueltaFilter, setVueltaFilter] = useState('');

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ApkRecord | GgRecord | null>(null);
  const [selectedConcepto, setSelectedConcepto] = useState('');

  // Estados para el modal de cambio masivo
  const [isMassChangeModalOpen, setIsMassChangeModalOpen] = useState(false);
  const [sourceConceptos, setSourceConceptos] = useState<string[]>([]);
  const [targetConcepto, setTargetConcepto] = useState('');

  // Filtrar datos por período (mes/año) - FILTRO PRINCIPAL
  const filteredDataByPeriod = useMemo(() => {
    if (!selectedMonth && !selectedYear) {
      return data; // Sin filtro de período, mostrar todos
    }

    return data.filter(record => {
      const matchesMonth = selectedMonth ? record.mes === selectedMonth : true;
      const matchesYear = selectedYear ? record.año === selectedYear : true;
      return matchesMonth && matchesYear;
    });
  }, [data, selectedMonth, selectedYear]);

  // Extraer meses y años únicos disponibles en los datos
  const availableMonths = useMemo(() => {
    const months = new Set(data.map(record => record.mes).filter(Boolean));
    return Array.from(months).sort();
  }, [data]);

  const availableYears = useMemo(() => {
    const years = new Set(data.map(record => record.año).filter(Boolean));
    return Array.from(years).sort();
  }, [data]);

  // Extraer valores únicos para los selects (basado en datos filtrados por período)
  const uniqueConceptos = useMemo(() => {
    const conceptos = new Set(filteredDataByPeriod.map(record => record.concepto).filter(Boolean));
    return Array.from(conceptos).sort();
  }, [filteredDataByPeriod]);

  const uniqueVueltas = useMemo(() => {
    if (type === 'apk') {
      const vueltas = new Set((filteredDataByPeriod as ApkRecord[]).map(record => record.vuelta).filter(Boolean));
      return Array.from(vueltas).sort();
    } else if (type === 'epk') {
      // EPK vueltas también usan el campo 'vuelta'
      const segmentos = new Set((filteredDataByPeriod as ApkRecord[]).map(record => record.vuelta).filter(Boolean));
      return Array.from(segmentos).sort();
    } else {
      // Solo GG usa el campo 'segmento'
      const segmentos = new Set((filteredDataByPeriod as GgRecord[]).map(record => record.segmento).filter(Boolean));
      return Array.from(segmentos).sort();
    }
  }, [filteredDataByPeriod, type]);

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
      // APK y EPK usan 'vuelta', solo GG usa 'segmento'
      const field = type === 'gg' ? 'segmento' : 'vuelta';
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
    if (!selectedRecord || !selectedConcepto) return;

    console.log('💾 Guardando concepto:', selectedConcepto, 'para registro ID:', selectedRecord.id);
    
    try {
      // 1. Obtener datos actuales del proceso
      const processData = getProcessData();
      
      // 2. Actualizar el registro según el tipo
      if (type === 'apk') {
        // Encontrar y actualizar el registro APK
        const updatedData = processData.data.map(record => 
          record.id === selectedRecord.id 
            ? { ...record, concepto: selectedConcepto }
            : record
        );
        
        // 3. Guardar en localStorage
        processData.data = updatedData;
        saveProcessData(processData);
        
        // 4. Actualizar el contexto para reflejar el cambio
        // TODO: Actualizar para usar setDataByGroup con dataGroup apropiado
        // setDataByGroup(dataGroup, updatedData);
        console.log('✅ Concepto actualizado en APK');
      } else {
        // Encontrar y actualizar el registro GG
        const updatedData = processData.gg.map(record => 
          record.id === selectedRecord.id 
            ? { ...record, concepto: selectedConcepto }
            : record
        );
        
        // 3. Guardar en localStorage
        processData.gg = updatedData;
        saveProcessData(processData);
        
        // 4. Actualizar el contexto para reflejar el cambio
        // TODO: Actualizar para usar setDataByGroup con dataGroup apropiado
        // setDataByGroup(dataGroup, updatedData);
        console.log('✅ Concepto actualizado en GG');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('❌ Error al guardar concepto:', error);
      showError('Error al guardar el concepto. Por favor intenta de nuevo.');
    }
  };

  // Obtener conceptos predefinidos
  const availableConcepts = useMemo(() => {
    const concepts = getConcepts();
    return concepts.map(c => c.text);
  }, []);

  // Funciones para el cambio masivo
  const handleOpenMassChange = () => {
    setSourceConceptos([]);
    setTargetConcepto('');
    setIsMassChangeModalOpen(true);
  };

  const handleCloseMassChange = () => {
    setIsMassChangeModalOpen(false);
    setSourceConceptos([]);
    setTargetConcepto('');
  };

  // Obtener registros afectados por el cambio masivo (respetando el período seleccionado)
  const affectedRecords = useMemo(() => {
    if (sourceConceptos.length === 0) return [];
    return filteredDataByPeriod.filter(record => sourceConceptos.includes(record.concepto));
  }, [filteredDataByPeriod, sourceConceptos]);

  const handleApplyMassChange = () => {
    if (sourceConceptos.length === 0 || !targetConcepto) {
      showError('Debes seleccionar al menos un concepto de origen y un concepto destino.');
      return;
    }

    try {
      const processData = getProcessData();
      
      // Función para verificar si un registro está en el período seleccionado
      const isInSelectedPeriod = (record: ApkRecord | GgRecord) => {
        const matchesMonth = selectedMonth ? record.mes === selectedMonth : true;
        const matchesYear = selectedYear ? record.año === selectedYear : true;
        return matchesMonth && matchesYear;
      };
      
      if (type === 'apk') {
        const updatedData = processData.data.map(record => 
          sourceConceptos.includes(record.concepto) && isInSelectedPeriod(record)
            ? { ...record, concepto: targetConcepto }
            : record
        );
        
        processData.data = updatedData;
        saveProcessData(processData);
        // TODO: Actualizar para usar setDataByGroup
        // setDataByGroup(dataGroup, updatedData);
        
        console.log(`✅ Cambio masivo aplicado en APK: ${affectedRecords.length} registros actualizados`);
      } else {
        const updatedData = processData.gg.map(record => 
          sourceConceptos.includes(record.concepto) && isInSelectedPeriod(record)
            ? { ...record, concepto: targetConcepto }
            : record
        );
        
        processData.gg = updatedData;
        saveProcessData(processData);
        // TODO: Actualizar para usar setDataByGroup
        // setDataByGroup(dataGroup, updatedData);
        
        console.log(`✅ Cambio masivo aplicado en GG: ${affectedRecords.length} registros actualizados`);
      }
      
      const registrosText = affectedRecords.length === 1 ? 'registro' : 'registros';
      showSuccess(`Cambio masivo aplicado exitosamente a ${affectedRecords.length} ${registrosText}.`);
      handleCloseMassChange();
    } catch (error) {
      console.error('❌ Error al aplicar cambio masivo:', error);
      showError('Error al aplicar el cambio masivo. Por favor intenta de nuevo.');
    }
  };

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
    } else if (type === 'epk') {
      // Columnas para EPK (usa 'vuelta' pero lo muestra como 'Segmento')
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
    data: filteredDataByPeriod,
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
    const rows = table.getFilteredRowModel().rows.map(row => {
      const record = row.original as ApkRecord | GgRecord;
      
      // Crear array con todos los campos excepto id
      if (type === 'apk' || type === 'epk') {
        const apkRecord = record as ApkRecord;
        return [
          apkRecord.fecha,
          apkRecord.egresos,
          apkRecord.folio,
          apkRecord.proveedor,
          apkRecord.factura,
          apkRecord.importe,
          apkRecord.concepto,
          apkRecord.vuelta,
          apkRecord.mes,
          apkRecord.año,
        ];
      } else {
        const ggRecord = record as GgRecord;
        return [
          ggRecord.fecha,
          ggRecord.egresos,
          ggRecord.folio,
          ggRecord.proveedor,
          ggRecord.factura,
          ggRecord.importe,
          ggRecord.concepto,
          ggRecord.segmento,
          ggRecord.mes,
          ggRecord.año,
        ];
      }
    });
    
    const tsvContent = rows.map(row => row.join('\t')).join('\n');

    navigator.clipboard.writeText(tsvContent)
      .then(() => showSuccess('Datos copiados al portapapeles exitosamente'))
      .catch(() => showError('Error al copiar los datos al portapapeles'));
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
                filteredDataByPeriod.reduce((sum, record) => sum + (record.importe || 0), 0)
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({filteredDataByPeriod.length} registros)
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

      {/* Filtro de Período (Mes/Año) - FILTRO PRINCIPAL */}
      <Paper sx={{ padding: 2, mb: 2, backgroundColor: 'warning.50', border: '2px solid', borderColor: 'warning.main' }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <FilterList color="warning" />
          <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
            Filtro de Período (Mes/Año)
          </Typography>
          <Chip 
            label="Filtro Principal" 
            size="small" 
            color="warning" 
            sx={{ fontWeight: 'bold' }}
          />
        </Stack>
        
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Este filtro se aplica primero. Los cambios masivos solo afectarán registros dentro del período seleccionado.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          {/* Selector de Año */}
          <FormControl fullWidth size="small">
            <InputLabel>Año</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Año"
            >
              <MenuItem value="">
                <em>Todos los años</em>
              </MenuItem>
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selector de Mes */}
          <FormControl fullWidth size="small">
            <InputLabel>Mes</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Mes"
            >
              <MenuItem value="">
                <em>Todos los meses</em>
              </MenuItem>
              {availableMonths.map(month => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botón para limpiar filtro de período */}
          {(selectedMonth || selectedYear) && (
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => {
                setSelectedMonth('');
                setSelectedYear('');
              }}
              sx={{ minWidth: '120px', whiteSpace: 'nowrap' }}
            >
              Limpiar Período
            </Button>
          )}

          {/* Indicador de registros filtrados */}
          {(selectedMonth || selectedYear) && (
            <Chip
              label={`${filteredDataByPeriod.length} de ${data.length} registros`}
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
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
            <InputLabel>{type === 'gg' ? 'Segmento' : type === 'apk' ? 'Vuelta' : 'Segmento'}</InputLabel>
            <Select
              value={vueltaFilter}
              onChange={(e) => setVueltaFilter(e.target.value)}
              label={type === 'gg' ? 'Segmento' : type === 'apk' ? 'Vuelta' : 'Segmento'}
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

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<SwapHoriz />}
              onClick={handleOpenMassChange}
            >
              Cambio masivo
            </Button>
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
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'primary.50',
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
                      {type === 'gg' ? 'Segmento' : type === 'apk' ? 'Vuelta' : 'Segmento'}
                    </Typography>
                    <Typography variant="body1">
                      {type === 'gg' ? (selectedRecord as GgRecord).segmento : (selectedRecord as ApkRecord).vuelta}
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

      {/* Modal de cambio masivo */}
      <Dialog 
        open={isMassChangeModalOpen} 
        onClose={handleCloseMassChange}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Cambio Masivo de Conceptos
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona los conceptos que deseas cambiar y el concepto destino al que serán reasignados.
            </Typography>

            {/* Indicador de período activo */}
            {(selectedMonth || selectedYear) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Filtro de período activo:</strong> Los cambios solo se aplicarán a registros de{' '}
                {selectedMonth && <strong>{selectedMonth}</strong>}
                {selectedMonth && selectedYear && ' de '}
                {selectedYear && <strong>{selectedYear}</strong>}
              </Alert>
            )}

            {/* Formulario */}
            <Stack spacing={3}>
              {/* Select múltiple de conceptos origen */}
              <FormControl fullWidth>
                <InputLabel>Conceptos a cambiar</InputLabel>
                <Select
                  multiple
                  value={sourceConceptos}
                  onChange={(e) => setSourceConceptos(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Conceptos a cambiar" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {uniqueConceptos.map((concepto) => (
                    <MenuItem key={concepto} value={concepto}>
                      <Checkbox checked={sourceConceptos.indexOf(concepto) > -1} />
                      <ListItemText primary={concepto} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Select de concepto destino */}
              <FormControl fullWidth>
                <InputLabel>Concepto destino</InputLabel>
                <Select
                  value={targetConcepto}
                  label="Concepto destino"
                  onChange={(e) => setTargetConcepto(e.target.value)}
                >
                  {availableConcepts.map((concepto) => (
                    <MenuItem key={concepto} value={concepto}>
                      {concepto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Información de registros afectados */}
              {sourceConceptos.length > 0 && (
                <Alert severity="info">
                  Se cambiarán <strong>{affectedRecords.length} registros</strong> de los conceptos seleccionados al concepto destino.
                </Alert>
              )}

              {/* Tabla de registros afectados */}
              {affectedRecords.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Registros que serán afectados:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Proveedor</TableCell>
                          <TableCell>Concepto Actual</TableCell>
                          <TableCell>Importe</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {affectedRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.id}</TableCell>
                            <TableCell>{record.fecha}</TableCell>
                            <TableCell>{record.proveedor}</TableCell>
                            <TableCell>
                              <Chip label={record.concepto} size="small" />
                            </TableCell>
                            <TableCell>
                              ${record.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMassChange}>
            Cancelar
          </Button>
          <Button 
            onClick={handleApplyMassChange} 
            variant="contained"
            disabled={sourceConceptos.length === 0 || !targetConcepto}
          >
            Aplicar Cambio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
