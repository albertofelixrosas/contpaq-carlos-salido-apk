import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import type { TextConceptMapping } from '../../types';
import { getTextConceptMappings, saveTextConceptMappings } from '../../services/localStorage';
import { useNotification } from '../../hooks/useNotification';

const TextConceptMappingManager: React.FC = () => {
  const [mappings, setMappings] = useState<TextConceptMapping[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TextConceptMapping | null>(null);
  const { showNotification } = useNotification();

  // Formulario para nuevo mapeo
  const [formData, setFormData] = useState({
    textPattern: '',
    matchType: 'startsWith' as 'startsWith' | 'contains' | 'exact',
    targetConcept: '',
    dataType: 'apk' as 'apk' | 'epk',
    priority: 1,
  });

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = () => {
    const loaded = getTextConceptMappings();
    setMappings(loaded);
  };

  const handleSave = () => {
    if (!formData.textPattern.trim() || !formData.targetConcept.trim()) {
      showNotification('Patrón de texto y concepto destino son obligatorios', 'error');
      return;
    }

    const newMapping: TextConceptMapping = {
      id: editingMapping?.id || Date.now().toString(),
      textPattern: formData.textPattern.trim(),
      matchType: formData.matchType,
      targetConcept: formData.targetConcept.trim(),
      dataType: formData.dataType,
      priority: formData.priority,
      createdAt: editingMapping?.createdAt || new Date().toISOString(),
    };

    let updatedMappings: TextConceptMapping[];
    
    if (editingMapping) {
      // Editar existente
      updatedMappings = mappings.map(m => m.id === editingMapping.id ? newMapping : m);
    } else {
      // Agregar nuevo
      updatedMappings = [...mappings, newMapping];
    }

    saveTextConceptMappings(updatedMappings);
    setMappings(updatedMappings);
    showNotification(editingMapping ? 'Mapeo actualizado' : 'Mapeo agregado', 'success');
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    const updatedMappings = mappings.filter(m => m.id !== id);
    saveTextConceptMappings(updatedMappings);
    setMappings(updatedMappings);
    showNotification('Mapeo eliminado', 'success');
  };

  const handleOpenDialog = (mapping?: TextConceptMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        textPattern: mapping.textPattern,
        matchType: mapping.matchType,
        targetConcept: mapping.targetConcept,
        dataType: mapping.dataType,
        priority: mapping.priority,
      });
    } else {
      setEditingMapping(null);
      setFormData({
        textPattern: '',
        matchType: 'startsWith',
        targetConcept: '',
        dataType: 'apk',
        priority: mappings.length + 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMapping(null);
  };

  const handleExport = () => {
    if (mappings.length === 0) {
      showNotification('No hay mapeos para exportar', 'info');
      return;
    }

    // Formato: PATRON|TIPO_MATCH|CONCEPTO_DESTINO|PRIORIDAD|TIPO_DATOS
    const content = mappings
      .map(m => `${m.textPattern}|${m.matchType}|${m.targetConcept}|${m.priority}|${m.dataType}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapeos-texto.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Mapeos exportados', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        const imported: TextConceptMapping[] = lines.map((line, index) => {
          const parts = line.split('|').map(p => p.trim());
          
          if (parts.length < 3) {
            throw new Error(`Línea ${index + 1}: formato inválido`);
          }

          const [textPattern, matchType, targetConcept, priorityStr, dataTypeStr] = parts;
          
          return {
            id: Date.now().toString() + index,
            textPattern,
            matchType: (matchType as 'startsWith' | 'contains' | 'exact') || 'startsWith',
            targetConcept,
            priority: priorityStr ? parseInt(priorityStr, 10) : index + 1,
            dataType: (dataTypeStr as 'apk' | 'epk') || 'apk',
            createdAt: new Date().toISOString(),
          };
        });

        saveTextConceptMappings(imported);
        setMappings(imported);
        showNotification(`${imported.length} mapeos importados`, 'success');
      } catch (error) {
        showNotification(`Error al importar: ${error instanceof Error ? error.message : 'desconocido'}`, 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'startsWith': return 'Empieza con';
      case 'contains': return 'Contiene';
      case 'exact': return 'Exacto';
      default: return type;
    }
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case 'apk': return 'primary';
      case 'epk': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Mapeo por Texto de Concepto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prioridad ALTA - Se verifica antes del mapeo por código de cuenta
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
            >
              Importar
              <input
                type="file"
                hidden
                accept=".txt"
                onChange={handleImport}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Agregar Mapeo
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prioridad</TableCell>
                <TableCell>Patrón de Texto</TableCell>
                <TableCell>Tipo de Coincidencia</TableCell>
                <TableCell>Concepto Destino</TableCell>
                <TableCell>Tipo de Datos</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings
                .sort((a, b) => a.priority - b.priority)
                .map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <Chip label={mapping.priority} size="small" color="warning" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {mapping.textPattern}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getMatchTypeLabel(mapping.matchType)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{mapping.targetConcept}</TableCell>
                    <TableCell>
                      <Chip
                        label={mapping.dataType.toUpperCase()}
                        size="small"
                        color={getDataTypeColor(mapping.dataType) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(mapping)}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(mapping.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {mappings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No hay mapeos configurados. Haz clic en "Agregar Mapeo" para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para agregar/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMapping ? 'Editar Mapeo' : 'Nuevo Mapeo'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Patrón de Texto"
              value={formData.textPattern}
              onChange={(e) => setFormData({ ...formData, textPattern: e.target.value })}
              placeholder="ej: GRANJAS, ADMIN, etc."
              helperText="El texto a buscar en el concepto de pago (campo Proveedor)"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de Coincidencia</InputLabel>
              <Select
                value={formData.matchType}
                onChange={(e) => setFormData({ ...formData, matchType: e.target.value as any })}
                label="Tipo de Coincidencia"
              >
                <MenuItem value="startsWith">Empieza con</MenuItem>
                <MenuItem value="contains">Contiene</MenuItem>
                <MenuItem value="exact">Exacto</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Concepto Destino"
              value={formData.targetConcept}
              onChange={(e) => setFormData({ ...formData, targetConcept: e.target.value })}
              placeholder="ej: SUELDOS GJAS"
              helperText="El concepto al que se mapeará"
              fullWidth
            />

            <TextField
              label="Prioridad"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) })}
              helperText="Menor número = mayor prioridad (1 es el más alto)"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de Negocio</InputLabel>
              <Select
                value={formData.dataType}
                onChange={(e) => setFormData({ ...formData, dataType: e.target.value as any })}
                label="Tipo de Negocio"
              >
                <MenuItem value="apk">APK - Aparcería (132-xxx)</MenuItem>
                <MenuItem value="epk">EPK - Producción/Engorda (133-xxx)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TextConceptMappingManager;
