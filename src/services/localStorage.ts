import type { ProcessData, ApkRecord, GgRecord, Segment, ProrrateoRecord, Concept } from '../types';

/**
 * Servicio para gestión de localStorage
 */

const STORAGE_KEYS = {
  APK: 'apk',
  CONCEPTS: 'concepts',
} as const;

// ============================================
// DATOS DE PROCESO (APK, GG, SEGMENTOS, PRORRATEO)
// ============================================

/**
 * Inicializa la estructura de datos para el proceso
 */
export function initializeProcessData(): ProcessData {
  return {
    data: [],
    segments: [],
    gg: [],
    prorrateo: [],
  };
}

/**
 * Obtiene los datos del proceso desde localStorage
 */
export function getProcessData(): ProcessData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APK);
    return stored ? JSON.parse(stored) : initializeProcessData();
  } catch (error) {
    console.error('Error al obtener datos del proceso:', error);
    return initializeProcessData();
  }
}

/**
 * Guarda los datos del proceso en localStorage
 */
export function saveProcessData(data: ProcessData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APK, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar datos del proceso:', error);
    throw new Error('No se pudo guardar los datos en localStorage');
  }
}

/**
 * Guarda datos APK en localStorage
 */
export function saveApkData(apkData: ApkRecord[], segmentNames: Set<string>): void {
  const processData = getProcessData();
  
  processData.data = apkData;
  processData.segments = Array.from(segmentNames).map(segment => ({
    segment,
    count: 0,
  }));
  
  saveProcessData(processData);
}

/**
 * Obtiene datos APK desde localStorage
 */
export function getApkData(): ApkRecord[] {
  const processData = getProcessData();
  return processData.data || [];
}

/**
 * Guarda datos GG en localStorage
 */
export function saveGgData(ggData: GgRecord[]): void {
  const processData = getProcessData();
  processData.gg = ggData;
  saveProcessData(processData);
}

/**
 * Obtiene datos GG desde localStorage
 */
export function getGgData(): GgRecord[] {
  const processData = getProcessData();
  return processData.gg || [];
}

/**
 * Guarda segmentos en localStorage
 */
export function saveSegments(segments: Segment[]): void {
  const processData = getProcessData();
  processData.segments = segments;
  saveProcessData(processData);
}

/**
 * Obtiene segmentos desde localStorage
 */
export function getSegments(): Segment[] {
  const processData = getProcessData();
  return processData.segments || [];
}

/**
 * Guarda datos de prorrateo en localStorage
 */
export function saveProrrateoData(prorrateoData: ProrrateoRecord[]): void {
  const processData = getProcessData();
  processData.prorrateo = prorrateoData;
  saveProcessData(processData);
}

/**
 * Obtiene datos de prorrateo desde localStorage
 */
export function getProrrateoData(): ProrrateoRecord[] {
  const processData = getProcessData();
  return processData.prorrateo || [];
}

/**
 * Limpia todos los datos del proceso
 */
export function clearProcessData(): void {
  localStorage.removeItem(STORAGE_KEYS.APK);
}

// ============================================
// CONCEPTOS
// ============================================

/**
 * Obtiene conceptos desde localStorage
 */
export function getConcepts(): Concept[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONCEPTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    return [];
  }
}

/**
 * Guarda conceptos en localStorage
 */
export function saveConcepts(concepts: Concept[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONCEPTS, JSON.stringify(concepts));
  } catch (error) {
    console.error('Error al guardar conceptos:', error);
    throw new Error('No se pudo guardar los conceptos en localStorage');
  }
}

/**
 * Agrega un nuevo concepto
 */
export function addConcept(text: string): Concept {
  const concepts = getConcepts();
  const newConcept: Concept = {
    id: Date.now().toString(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  
  concepts.push(newConcept);
  saveConcepts(concepts);
  
  return newConcept;
}

/**
 * Actualiza un concepto existente
 */
export function updateConcept(id: string, newText: string): void {
  const concepts = getConcepts();
  const index = concepts.findIndex(c => c.id === id);
  
  if (index !== -1) {
    concepts[index].text = newText.trim();
    saveConcepts(concepts);
  }
}

/**
 * Elimina un concepto
 */
export function deleteConcept(id: string): void {
  const concepts = getConcepts();
  const filtered = concepts.filter(c => c.id !== id);
  saveConcepts(filtered);
}

/**
 * Limpia todos los conceptos
 */
export function clearConcepts(): void {
  saveConcepts([]);
}

/**
 * Obtiene conceptos únicos de los datos procesados
 */
export function getUniqueConceptsFromData(dataType: 'apk' | 'gg'): string[] {
  const data = dataType === 'apk' ? getApkData() : getGgData();
  const uniqueConcepts = new Set(data.map(record => record.concepto));
  return Array.from(uniqueConcepts).filter(Boolean).sort();
}

/**
 * Obtiene vueltas únicas de los datos APK
 */
export function getUniqueVueltas(): string[] {
  const data = getApkData();
  const uniqueVueltas = new Set(data.map(record => record.vuelta));
  return Array.from(uniqueVueltas).filter(Boolean).sort();
}
