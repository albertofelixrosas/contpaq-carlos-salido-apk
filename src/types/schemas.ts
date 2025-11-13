import { z } from 'zod';

/**
 * Schemas de validación con Zod para formularios
 */

// ============================================
// SCHEMA PARA CONCEPTOS
// ============================================

export const conceptSchema = z.object({
  text: z.string()
    .min(1, 'El concepto no puede estar vacío')
    .max(100, 'El concepto no puede exceder 100 caracteres')
    .trim(),
});

export type ConceptFormData = z.infer<typeof conceptSchema>;

// ============================================
// SCHEMA PARA SEGMENTOS
// ============================================

export const segmentSchema = z.object({
  segment: z.string().min(1, 'El segmento es requerido'),
  count: z.number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo'),
});

export const segmentFormSchema = z.object({
  segments: z.array(segmentSchema),
});

export type SegmentFormData = z.infer<typeof segmentFormSchema>;

// ============================================
// SCHEMA PARA SUSTITUCIÓN MASIVA
// ============================================

export const massReplacementSchema = z.object({
  selectedConcepts: z.array(z.string())
    .min(1, 'Debes seleccionar al menos un concepto'),
  targetConcept: z.string()
    .min(1, 'Debes seleccionar un concepto destino'),
});

export type MassReplacementFormData = z.infer<typeof massReplacementSchema>;

// ============================================
// SCHEMA PARA CARGA DE ARCHIVO
// ============================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'El archivo no debe exceder 5MB'
    )
    .refine(
      (file) => {
        const validExtensions = ['.xls', '.xlsx'];
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      },
      'Solo se permiten archivos Excel (.xls, .xlsx)'
    ),
  dataType: z.enum(['apk', 'gg']),
});

export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
