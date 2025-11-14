import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { Add, Delete, Label } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conceptSchema, type ConceptFormData } from '../../types/schemas';
import type { Concept } from '../../types';

interface ConceptsManagerProps {
  concepts: Concept[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  uniqueConceptsFromData: string[];
}

/**
 * Gestor de conceptos predefinidos y personalizados
 * Permite agregar, eliminar y visualizar conceptos
 */
export const ConceptsManager = ({
  concepts,
  onAdd,
  onDelete,
  uniqueConceptsFromData,
}: ConceptsManagerProps) => {
  const [showForm, setShowForm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = (data: ConceptFormData) => {
    onAdd(data.text);
    reset();
    setShowForm(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ padding: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          🏷️ Gestión de Conceptos
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Administra los conceptos utilizados para clasificar gastos.
        </Typography>

        {/* Estadísticas */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Chip
            label={`${concepts.length} conceptos guardados`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${uniqueConceptsFromData.length} conceptos en datos`}
            color="secondary"
            variant="outlined"
          />
        </Stack>

        {/* Conceptos personalizados */}
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }} spacing={{ xs: 1, sm: 0 }}>
            <Typography variant="h6">
              Mis Conceptos ({concepts.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : 'Agregar Concepto'}
            </Button>
          </Stack>

          {/* Formulario de agregar */}
          {showForm && (
            <Paper variant="outlined" sx={{ padding: 2, mb: 2, backgroundColor: 'grey.50' }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Controller
                    name="text"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre del concepto"
                        placeholder="Ej: GASTOS DE VIAJE"
                        error={!!errors.text}
                        helperText={errors.text?.message}
                        fullWidth
                        autoFocus
                      />
                    )}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button type="submit" variant="contained" fullWidth>
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        reset();
                        setShowForm(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Paper>
          )}

          {/* Lista de conceptos */}
          {concepts.length === 0 ? (
            <Alert severity="info">
              No tienes conceptos guardados. Agrega uno personalizado o haz clic en los conceptos detectados en tus archivos.
            </Alert>
          ) : (
            <Paper variant="outlined">
              <List>
                {concepts.map((concept, index) => (
                  <ListItem
                    key={concept.id}
                    divider={index < concepts.length - 1}
                  >
                    <ListItemText
                      primary={concept.text}
                      secondary={`Agregado: ${new Date(concept.createdAt).toLocaleDateString('es-MX')}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => onDelete(concept.id)}
                        title="Eliminar concepto"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Conceptos detectados en los datos */}
        {uniqueConceptsFromData.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conceptos Detectados en Archivos
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Estos conceptos fueron encontrados en los datos cargados. Haz clic para agregarlos a tus conceptos.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {uniqueConceptsFromData.map((concept) => {
                const isAdded = concepts.some((c) => c.text === concept);
                return (
                  <Chip
                    key={concept}
                    label={concept}
                    color={isAdded ? 'success' : 'secondary'}
                    variant={isAdded ? 'filled' : 'outlined'}
                    icon={isAdded ? <Label /> : undefined}
                    onClick={() => !isAdded && onAdd(concept)}
                    sx={{ cursor: isAdded ? 'default' : 'pointer' }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
