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
// TIPOS PARA CONCEPTOS
// ============================================

export interface Concept {
  id: string;
  text: string;
  createdAt: string;
}

// ============================================
// TIPOS PARA MAPEO DE CONCEPTOS
// ============================================

export interface ConceptMapping {
  id: string;
  accountCode: string;      // Código de cuenta (ej: "001", "002")
  sourceText: string;        // Texto original del Excel
  targetConcept: string;     // Concepto destino
  dataType: 'apk' | 'gg' | 'both';  // A qué tipo aplica
  createdAt: string;
}

export interface ParsedAccountCode {
  full: string;              // Código completo (ej: "133-001-000-000-00")
  mainGroup: string;         // Primer número (ej: "133")
  accountCode: string;       // Segundo número (ej: "001")
  isApk: boolean;            // true si mainGroup es "133"
  isGg: boolean;             // true si mainGroup NO es "133"
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
