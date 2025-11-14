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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import { Add, Delete, Edit, Upload, Download, Info } from '@mui/icons-material';
import type { ConceptMapping, Concept } from '../../types';
import { getConceptMappings, saveConceptMappings, getConcepts } from '../../services/localStorage';

/**
 * Componente para gestionar el mapeo de códigos de cuenta a conceptos
 */
export const ConceptMappingManager = () => {
  const [mappings, setMappings] = useState<ConceptMapping[]>(() => getConceptMappings());
  const [concepts] = useState<Concept[]>(() => getConcepts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ConceptMapping | null>(null);

  // Formulario
  const [formAccountCode, setFormAccountCode] = useState('');
  const [formSourceText, setFormSourceText] = useState('');
  const [formTargetConcept, setFormTargetConcept] = useState('');
  const [formDataType, setFormDataType] = useState<'apk' | 'epk' | 'gg' | 'both'>('apk');

  // Obtener lista de conceptos disponibles
  const availableConcepts = useMemo(() => {
    return concepts.map(c => c.text).sort();
  }, [concepts]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: mappings.length,
      apk: mappings.filter(m => m.dataType === 'apk' || m.dataType === 'both').length,
      gg: mappings.filter(m => m.dataType === 'gg' || m.dataType === 'both').length,
    };
  }, [mappings]);

  const handleOpenAddModal = () => {
    setEditingMapping(null);
    setFormAccountCode('');
    setFormSourceText('');
    setFormTargetConcept('');
    setFormDataType('both');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (mapping: ConceptMapping) => {
    setEditingMapping(mapping);
    setFormAccountCode(mapping.accountCode);
    setFormSourceText(mapping.sourceText);
    setFormTargetConcept(mapping.targetConcept);
    setFormDataType(mapping.dataType);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMapping(null);
  };

  const handleSaveMapping = () => {
    if (!formAccountCode || !formTargetConcept) {
      alert('Debes completar al menos el código de cuenta y el concepto destino');
      return;
    }

    const newMapping: ConceptMapping = {
      id: editingMapping?.id || `mapping-${Date.now()}`,
      accountCode: formAccountCode.trim(),
      sourceText: formSourceText.trim(),
      targetConcept: formTargetConcept,
      dataType: formDataType,
      createdAt: editingMapping?.createdAt || new Date().toISOString(),
    };

    let updatedMappings: ConceptMapping[];
    
    if (editingMapping) {
      // Editar existente
      updatedMappings = mappings.map(m => m.id === editingMapping.id ? newMapping : m);
    } else {
      // Agregar nuevo
      updatedMappings = [...mappings, newMapping];
    }

    setMappings(updatedMappings);
    saveConceptMappings(updatedMappings);
    handleCloseModal();
  };

  const handleDeleteMapping = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este mapeo?')) return;

    const updatedMappings = mappings.filter(m => m.id !== id);
    setMappings(updatedMappings);
    saveConceptMappings(updatedMappings);
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const newMappings: ConceptMapping[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Formato esperado: "001|TEXTO ORIGEN|CONCEPTO DESTINO"
          // O simplemente: "001 TEXTO ORIGEN"
          const parts = trimmedLine.split('|');
          
          if (parts.length >= 2) {
            const accountCode = parts[0].trim();
            const sourceText = parts[1].trim();
            const targetConcept = parts[2]?.trim() || sourceText;

            newMappings.push({
              id: `mapping-${Date.now()}-${accountCode}`,
              accountCode,
              sourceText,
              targetConcept,
              dataType: 'both',
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (newMappings.length > 0) {
          const updatedMappings = [...mappings, ...newMappings];
          setMappings(updatedMappings);
          saveConceptMappings(updatedMappings);
          alert(`Se importaron ${newMappings.length} mapeos exitosamente`);
        }
      } catch (error) {
        console.error('Error al importar:', error);
        alert('Error al procesar el archivo. Verifica el formato.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportToFile = () => {
    const content = mappings
      .map(m => `${m.accountCode}|${m.sourceText}|${m.targetConcept}|${m.dataType}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapeo-conceptos-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              🔗 Mapeo de Conceptos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configura cómo se mapean los códigos de cuenta a conceptos personalizados
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              component="label"
            >
              Importar
              <input
                type="file"
                hidden
                accept=".txt"
                onChange={handleImportFromFile}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportToFile}
              disabled={mappings.length === 0}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
            >
              Agregar Mapeo
            </Button>
          </Stack>
        </Stack>

        {/* Estadísticas */}
        <Stack direction="row" spacing={2} mb={3}>
          <Chip label={`Total: ${stats.total}`} color="primary" />
          <Chip label={`APK: ${stats.apk}`} color="success" variant="outlined" />
          <Chip label={`GG: ${stats.gg}`} color="info" variant="outlined" />
        </Stack>

        {/* Información de ayuda */}
        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Cómo funciona:</strong> Al procesar un archivo Excel, el sistema detecta códigos de cuenta 
            como <code>133-001-000-000-00</code>. El segundo número (<code>001</code>) se usa para buscar 
            en este mapeo. Si existe, se asigna el concepto destino; si no, se usa el texto original del archivo.
          </Typography>
        </Alert>

        {/* Tabla de mapeos */}
        {mappings.length === 0 ? (
          <Alert severity="warning">
            No hay mapeos configurados. Haz clic en "Agregar Mapeo" o "Importar" para comenzar.
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Código Cuenta</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Texto Origen</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Concepto Destino</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id} hover>
                    <TableCell>
                      <Chip label={mapping.accountCode} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {mapping.sourceText || <em style={{ color: '#999' }}>Sin texto</em>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={mapping.targetConcept} size="small" color="success" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={mapping.dataType.toUpperCase()} 
                        size="small" 
                        color={mapping.dataType === 'apk' ? 'info' : mapping.dataType === 'gg' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEditModal(mapping)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleDeleteMapping(mapping.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal de agregar/editar */}
      <Dialog open={isAddModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMapping ? 'Editar Mapeo' : 'Agregar Nuevo Mapeo'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Código de Cuenta"
              value={formAccountCode}
              onChange={(e) => setFormAccountCode(e.target.value)}
              placeholder="001"
              helperText="Solo el segundo número del código (ej: 001 de 133-001-000-000-00)"
              fullWidth
              required
            />

            <TextField
              label="Texto Origen (opcional)"
              value={formSourceText}
              onChange={(e) => setFormSourceText(e.target.value)}
              placeholder="PRODUCCION DE CERDOS"
              helperText="Texto original que aparece en el Excel"
              fullWidth
              multiline
              rows={2}
            />

            <FormControl fullWidth required>
              <InputLabel>Concepto Destino</InputLabel>
              <Select
                value={formTargetConcept}
                onChange={(e) => setFormTargetConcept(e.target.value)}
                label="Concepto Destino"
              >
                {availableConcepts.map((concept) => (
                  <MenuItem key={concept} value={concept}>
                    {concept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Aplicar a</InputLabel>
              <Select
                value={formDataType}
                onChange={(e) => setFormDataType(e.target.value as 'apk' | 'gg' | 'both')}
                label="Aplicar a"
              >
                <MenuItem value="both">Ambos (APK y GG)</MenuItem>
                <MenuItem value="apk">Solo APK</MenuItem>
                <MenuItem value="epk">Solo EPK</MenuItem>
                <MenuItem value="gg">Solo GG</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveMapping} variant="contained">
            {editingMapping ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
