import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material';
import type { Segment } from '../../types';

interface SegmentEditorProps {
  segments: Segment[];
  onSave: (segments: Segment[]) => void;
}

interface EditingSegment {
  segment: string;
  count: number;
}

/**
 * Editor de segmentos para distribución de gastos
 * Permite definir segmentos y sus conteos para prorrateo
 */
export const SegmentEditor = ({ segments, onSave }: SegmentEditorProps) => {
  const [localSegments, setLocalSegments] = useState<Segment[]>(segments);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingSegment, setEditingSegment] = useState<EditingSegment>({
    segment: '',
    count: 0,
  });
  const [newSegment, setNewSegment] = useState<EditingSegment>({
    segment: '',
    count: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setLocalSegments(segments);
  }, [segments]);

  const handleAdd = () => {
    if (newSegment.segment.trim() === '' || newSegment.count <= 0) {
      return;
    }

    const updated = [
      ...localSegments,
      {
        segment: newSegment.segment.trim().toUpperCase(),
        count: newSegment.count,
      },
    ];

    setLocalSegments(updated);
    setNewSegment({ segment: '', count: 0 });
    setShowAddForm(false);
  };

  const handleEdit = (index: number) => {
    setIsEditing(index);
    setEditingSegment(localSegments[index]);
  };

  const handleSaveEdit = () => {
    if (isEditing === null) return;

    const updated = [...localSegments];
    updated[isEditing] = {
      segment: editingSegment.segment.trim().toUpperCase(),
      count: editingSegment.count,
    };

    setLocalSegments(updated);
    setIsEditing(null);
    setEditingSegment({ segment: '', count: 0 });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingSegment({ segment: '', count: 0 });
  };

  const handleDelete = (index: number) => {
    const updated = localSegments.filter((_, i) => i !== index);
    setLocalSegments(updated);
  };

  const handleSaveAll = () => {
    onSave(localSegments);
  };

  const totalCount = localSegments.reduce((sum, seg) => sum + seg.count, 0);
  const hasChanges = JSON.stringify(localSegments) !== JSON.stringify(segments);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          📊 Editor de Segmentos
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Define los segmentos y sus conteos para la distribución de gastos. El prorrateo se calculará proporcionalmente según estos valores.
        </Typography>

        {/* Estadísticas */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip
            label={`${localSegments.length} segmentos`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Total: ${totalCount}`}
            color="secondary"
            variant="outlined"
          />
        </Stack>

        {hasChanges && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
          </Alert>
        )}

        {/* Botón agregar */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancelar' : 'Agregar Segmento'}
          </Button>
        </Box>

        {/* Formulario de agregar */}
        {showAddForm && (
          <Paper variant="outlined" sx={{ padding: 2, mb: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Nuevo Segmento
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                label="Nombre del segmento"
                value={newSegment.segment}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, segment: e.target.value })
                }
                placeholder="Ej: NORTE, SUR, MATRIZ"
                fullWidth
              />
              <TextField
                label="Conteo"
                type="number"
                value={newSegment.count || ''}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, count: parseInt(e.target.value) || 0 })
                }
                placeholder="Ej: 10"
                sx={{ width: 150 }}
              />
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!newSegment.segment.trim() || newSegment.count <= 0}
              >
                Agregar
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Tabla de segmentos */}
        {localSegments.length === 0 ? (
          <Alert severity="info">
            No hay segmentos definidos. Agrega segmentos para poder calcular el prorrateo de gastos.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Segmento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Conteo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Porcentaje
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localSegments.map((segment, index) => {
                  const percentage = totalCount > 0 ? (segment.count / totalCount) * 100 : 0;
                  const isEditingRow = isEditing === index;

                  return (
                    <TableRow key={index} hover={!isEditingRow}>
                      <TableCell>
                        {isEditingRow ? (
                          <TextField
                            value={editingSegment.segment}
                            onChange={(e) =>
                              setEditingSegment({
                                ...editingSegment,
                                segment: e.target.value,
                              })
                            }
                            size="small"
                            fullWidth
                          />
                        ) : (
                          <Typography fontWeight={500}>{segment.segment}</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {isEditingRow ? (
                          <TextField
                            type="number"
                            value={editingSegment.count || ''}
                            onChange={(e) =>
                              setEditingSegment({
                                ...editingSegment,
                                count: parseInt(e.target.value) || 0,
                              })
                            }
                            size="small"
                            sx={{ width: 100 }}
                          />
                        ) : (
                          segment.count
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${percentage.toFixed(2)}%`}
                          size="small"
                          color={percentage > 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {isEditingRow ? (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={handleSaveEdit}
                              title="Guardar"
                            >
                              <Save fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              title="Cancelar"
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(index)}
                              title="Editar"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(index)}
                              title="Eliminar"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {totalCount}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    <Chip label="100%" color="success" size="small" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Botones de acción */}
        {localSegments.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setLocalSegments(segments)}
              disabled={!hasChanges}
            >
              Descartar Cambios
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={!hasChanges}
              startIcon={<Save />}
            >
              Guardar Cambios
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};
