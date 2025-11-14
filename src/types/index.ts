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
  dataType: 'apk' | 'epk' | 'gg' | 'both';  // A qué tipo aplica
  createdAt: string;
}

export interface TextConceptMapping {
  id: string;
  textPattern: string;       // Patrón de texto (ej: "GRANJAS", "ADMIN")
  matchType: 'startsWith' | 'contains' | 'exact';  // Tipo de coincidencia
  targetConcept: string;     // Concepto destino
  dataType: 'apk' | 'epk' | 'gg' | 'both';  // A qué tipo aplica
  priority: number;          // Prioridad (menor = más alta)
  createdAt: string;
}

export interface ParsedAccountCode {
  full: string;              // Código completo (ej: "133-001-000-000-00")
  mainGroup: string;         // Primer número (ej: "133" o "132")
  accountCode: string;       // Segundo número (ej: "001")
  processType: ProcessType;  // 'apk' si mainGroup es "132", 'epk' si es "133"
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

// APK = Aparcería (132-xxx-xxx-xxx-xx)
// EPK = Engorda/Producción (133-xxx-xxx-xxx-xx)
// GG = Gastos Generales (ambos pueden tener)
export type ProcessType = 'apk' | 'epk';
export type DataType = 'apk' | 'epk' | 'gg';
export type DataGroup = 'apk' | 'apk-gg' | 'epk' | 'epk-gg';

// ============================================
// DETECCIÓN AUTOMÁTICA DE ARCHIVOS
// ============================================

export interface FileDetectionResult {
  processType: ProcessType;     // 'apk' (132) o 'epk' (133)
  hasVueltas: boolean;          // true si tiene "Segmento:" con APK/EPK (archivo principal)
  isGastoGeneral: boolean;      // true si tiene segmentos GG o NO tiene segmentos (archivo GG)
  periodo: string;              // Extraído de celda A3 (ej: "ENERO 2024")
  dataGroup: DataGroup;         // 'apk', 'apk-gg', 'epk', 'epk-gg'
  confidence: number;           // 0-100, qué tan seguro está de la detección
  indicators: {
    foundCode132: boolean;      // Encontró código 132-xxx
    foundCode133: boolean;      // Encontró código 133-xxx
    foundAparceriaText: boolean; // Encontró "APARCERÍA EN PROCESO"
    foundProduccionText: boolean; // Encontró "PRODUCCION DE CERDOS EN PROCESO"
    foundSegmentos: boolean;    // Encontró líneas con "Segmento:"
    foundSegmentosGG: boolean;  // Encontró segmentos con " GG"
    foundSegmentosVueltas: boolean; // Encontró segmentos con " APK" o " EPK"
  };
}

// ============================================
// TIPOS PARA CUENTA CONTABLE
// ============================================

export interface AccountData {
  code: string;
  name: string;
}
