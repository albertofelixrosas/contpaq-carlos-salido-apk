import type { ProcessData, ApkRecord, GgRecord, Segment, ProrrateoRecord, Concept, ConceptMapping, TextConceptMapping, DataGroup } from '../types';

/**
 * Servicio para gestión de localStorage
 */

const STORAGE_KEYS = {
  APK: 'apk',              // Aparcería (incluye vueltas y GG)
  EPK: 'epk',              // Producción/Engorda (incluye vueltas y GG)
  CONCEPTS: 'concepts',
  CONCEPT_MAPPINGS: 'conceptMappings',
  TEXT_CONCEPT_MAPPINGS: 'textConceptMappings',
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
    throw new Error('No se pudieron guardar los datos');
  }
}

// ============================================
// FUNCIONES POR GRUPO ESPECÍFICO
// ============================================

/**
 * Obtiene la clave de storage según el grupo de datos
 */
function getStorageKeyForGroup(group: DataGroup): string {
  switch (group) {
    case 'apk':
      return STORAGE_KEYS.APK;
    case 'epk':
      return STORAGE_KEYS.EPK;
  }
}

/**
 * Guarda datos de un grupo específico
 */
export function saveDataByGroup(group: DataGroup, data: ProcessData): void {
  try {
    const key = getStorageKeyForGroup(group);
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`✅ Datos guardados en ${key}:`, data.data.length, 'registros');
  } catch (error) {
    console.error(`Error al guardar datos en ${group}:`, error);
    throw new Error(`No se pudieron guardar los datos en ${group}`);
  }
}

/**
 * Obtiene datos de un grupo específico
 */
export function getDataByGroup(group: DataGroup): ProcessData {
  try {
    const key = getStorageKeyForGroup(group);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initializeProcessData();
  } catch (error) {
    console.error(`Error al obtener datos de ${group}:`, error);
    return initializeProcessData();
  }
}

/**
 * Limpia datos de un grupo específico
 */
export function clearDataByGroup(group: DataGroup): void {
  try {
    const key = getStorageKeyForGroup(group);
    localStorage.removeItem(key);
    console.log(`🗑️ Datos eliminados de ${key}`);
  } catch (error) {
    console.error(`Error al limpiar datos de ${group}:`, error);
  }
}

/**
 * Obtiene todos los datos de todos los grupos
 */
export function getAllGroupsData(): {
  apk: ProcessData;
  epk: ProcessData;
} {
  return {
    apk: getDataByGroup('apk'),
    epk: getDataByGroup('epk'),
  };
}

/**
 * Guarda datos APK en localStorage
 */
export function saveApkData(apkData: ApkRecord[], segmentNames: Set<string>): void {
  console.log('💾 saveApkData llamado:', { dataLength: apkData.length, segments: Array.from(segmentNames) });
  const processData = getProcessData();
  
  processData.data = apkData;
  processData.segments = Array.from(segmentNames).map(segment => ({
    segment,
    count: 0,
  }));
  
  console.log('💾 Guardando en localStorage:', { 
    dataCount: processData.data.length, 
    segmentsCount: processData.segments.length 
  });
  saveProcessData(processData);
  console.log('💾 Datos guardados exitosamente');
}

/**
 * Obtiene datos APK desde localStorage
 */
export function getApkData(): ApkRecord[] {
  const processData = getProcessData();
  const data = processData.data || [];
  console.log('📖 getApkData leyendo:', data.length, 'registros');
  return data;
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
 * Inicializa conceptos predefinidos del cliente si no existen
 */
export function initializePredefinedConcepts(): void {
  const existingConcepts = getConcepts();
  
  // Si ya hay conceptos, no hacer nada
  if (existingConcepts.length > 0) {
    console.log('📋 Conceptos ya inicializados:', existingConcepts.length);
    return;
  }

  // Conceptos predefinidos del cliente
  const predefinedConcepts = [
    "ALIMENTO",
    "LECHONES",
    "OBRA CIVIL",
    "SUELDOS GJAS",
    "SUELDOS ADMON",
    "MEDICINA",
    "VACUNA",
    "GASOLINA",
    "RENTA",
    "VARIOS",
    "EQ. TRANSPORTE",
    "ENERGICA ELECTRICA",
    "DIESEL",
    "LIMPIEZA",
    "GAS",
    "UNIFORMES Y BOTAS"
  ];

  const today = new Date().toISOString();
  const concepts: Concept[] = predefinedConcepts.map((text, index) => ({
    id: `predefined-${index + 1}-${Date.now()}`,
    text,
    createdAt: today,
  }));

  saveConcepts(concepts);
  console.log('✅ Conceptos predefinidos inicializados:', concepts.length);
}

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

// ============================================
// MAPEOS DE CONCEPTOS
// ============================================

/**
 * Obtiene todos los mapeos de conceptos
 */
export function getConceptMappings(): ConceptMapping[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONCEPT_MAPPINGS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener mapeos de conceptos:', error);
    return [];
  }
}

/**
 * Guarda los mapeos de conceptos
 */
export function saveConceptMappings(mappings: ConceptMapping[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONCEPT_MAPPINGS, JSON.stringify(mappings));
    console.log(`✅ Mapeos de conceptos guardados: ${mappings.length} registros`);
  } catch (error) {
    console.error('Error al guardar mapeos de conceptos:', error);
    throw new Error('No se pudieron guardar los mapeos de conceptos');
  }
}

/**
 * Busca un mapeo por código de cuenta y tipo de datos
 */
export function findMappingByAccountCode(
  accountCode: string,
  dataType: 'apk' | 'epk' | 'gg'
): ConceptMapping | undefined {
  const mappings = getConceptMappings();
  return mappings.find(
    m => m.accountCode === accountCode && (m.dataType === dataType || m.dataType === 'both')
  );
}

/**
 * Aplica el mapeo a un nombre de cuenta contable
 */
export function applyConceptMapping(
  accountCode: string,
  originalText: string,
  dataType: 'apk' | 'epk' | 'gg'
): string {
  const mapping = findMappingByAccountCode(accountCode, dataType);
  
  if (mapping) {
    console.log(`✅ Mapeo aplicado: ${accountCode} -> ${mapping.targetConcept}`);
    return mapping.targetConcept;
  }
  
  // Si no hay mapeo, devolver el texto original
  return originalText;
}

// ============================================
// MAPEOS POR TEXTO DE CONCEPTO (PRIORIDAD ALTA)
// ============================================

/**
 * Obtiene todos los mapeos por texto
 */
export function getTextConceptMappings(): TextConceptMapping[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEXT_CONCEPT_MAPPINGS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener mapeos por texto:', error);
    return [];
  }
}

/**
 * Guarda los mapeos por texto
 */
export function saveTextConceptMappings(mappings: TextConceptMapping[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT_CONCEPT_MAPPINGS, JSON.stringify(mappings));
    console.log(`✅ Mapeos por texto guardados: ${mappings.length} registros`);
  } catch (error) {
    console.error('Error al guardar mapeos por texto:', error);
    throw new Error('No se pudieron guardar los mapeos por texto');
  }
}

/**
 * Busca un mapeo por texto de concepto
 * Este tiene PRIORIDAD sobre el mapeo por código
 */
export function findMappingByConceptText(
  conceptText: string,
  dataType: 'apk' | 'epk' | 'gg'
): TextConceptMapping | undefined {
  const mappings = getTextConceptMappings();
  
  // Filtrar por tipo de datos y ordenar por prioridad
  const applicableMappings = mappings
    .filter(m => m.dataType === dataType || m.dataType === 'both')
    .sort((a, b) => a.priority - b.priority);
  
  // Buscar la primera coincidencia
  for (const mapping of applicableMappings) {
    const textUpper = conceptText.toUpperCase();
    const patternUpper = mapping.textPattern.toUpperCase();
    
    switch (mapping.matchType) {
      case 'startsWith':
        if (textUpper.startsWith(patternUpper)) {
          return mapping;
        }
        break;
      case 'contains':
        if (textUpper.includes(patternUpper)) {
          return mapping;
        }
        break;
      case 'exact':
        if (textUpper === patternUpper) {
          return mapping;
        }
        break;
    }
  }
  
  return undefined;
}

/**
 * Aplica el mapeo completo con prioridad:
 * 1. Primero intenta mapeo por texto de concepto (PRIORIDAD ALTA)
 * 2. Si no encuentra, intenta mapeo por código de cuenta
 * 3. Si no encuentra, devuelve el texto original
 */
export function applyFullConceptMapping(
  accountCode: string,
  originalText: string,
  conceptText: string,
  dataType: 'apk' | 'epk' | 'gg'
): string {
  // 1. PRIORIDAD ALTA: Mapeo por texto de concepto de pago
  const textMapping = findMappingByConceptText(conceptText, dataType);
  if (textMapping) {
    console.log(`✅ Mapeo por texto aplicado: "${conceptText}" -> ${textMapping.targetConcept}`);
    return textMapping.targetConcept;
  }
  
  // 2. PRIORIDAD MEDIA: Mapeo por código de cuenta
  const codeMapping = findMappingByAccountCode(accountCode, dataType);
  if (codeMapping) {
    console.log(`✅ Mapeo por código aplicado: ${accountCode} -> ${codeMapping.targetConcept}`);
    return codeMapping.targetConcept;
  }
  
  // 3. Sin mapeo: usar texto original
  return originalText;
}
