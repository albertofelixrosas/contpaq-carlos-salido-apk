/**
 * Tipos principales de la aplicación Contpaq
 */

// ============================================
// TIPOS DE DATOS APK
// ============================================

export interface ApkRecord {
  id: number;
  fecha: string;
  egresos: string;
  folio: string;
  proveedor: string;
  factura: string;
  importe: number;
  concepto: string;
  vuelta: string;
  mes: string;
  año: string;
}

// ============================================
// TIPOS DE DATOS GG (Gastos Generales)
// ============================================

export interface GgRecord {
  id: number;
  fecha: string;
  egresos: string;
  folio: string;
  proveedor: string;
  factura: string;
  importe: number;
  concepto: string;
  segmento: string;
  mes: string;
  año: string;
}

// ============================================
// TIPOS DE CONCEPTOS
// ============================================

export interface Concept {
  id: string;
  text: string;
  createdAt: string;
}

// ============================================
// TIPOS DE SEGMENTOS
// ============================================

export interface Segment {
  segment: string;
  count: number;
}

// ============================================
// TIPOS DE PRORRATEO
// ============================================

export interface ProrrateoRecord {
  id: number;
  fecha: string;
  egresos: string;
  folio: string;
  proveedor: string;
  factura: string;
  importe: number;
  concepto: string;
  vuelta: string;
  mes: string;
  año: string;
}

// ============================================
// ESTRUCTURA DE DATOS EN LOCALSTORAGE
// ============================================

export interface ProcessData {
  data: ApkRecord[];
  segments: Segment[];
  gg: GgRecord[];
  prorrateo: ProrrateoRecord[];
}

// ============================================
// TIPOS DE DATOS PROCESADOS
// ============================================

export interface ProcessedApkData {
  processedData: ApkRecord[];
  segmentNames: Set<string>;
}

// ============================================
// TIPOS PARA FILTROS
// ============================================

export interface TableFilters {
  proveedor: string;
  concepto: string;
  vuelta: string;
}

// ============================================
// TIPOS PARA ORDENAMIENTO
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: string | null;
  direction: SortDirection;
  dataType: 'apk' | 'gg' | null;
}

// ============================================
// TIPOS PARA SUSTITUCIÓN MASIVA
// ============================================

export interface MassReplacementSelection {
  selectedConcepts: string[];
  targetConcept: string;
}

// ============================================
// TIPO DE DATOS
// ============================================

export type DataType = 'apk' | 'gg';

// ============================================
// TIPOS PARA CUENTA CONTABLE
// ============================================

export interface AccountData {
  code: string;
  name: string;
}
