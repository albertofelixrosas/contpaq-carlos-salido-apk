import type { ProcessData, ApkRecord, GgRecord, Segment, ProrrateoRecord, Concept, ConceptMapping, TextConceptMapping, DataGroup, AccountCatalogEntry } from '../types';

/**
 * Servicio para gestión de localStorage
 */

const STORAGE_KEYS = {
  APK: 'apk',              // Aparcería (incluye vueltas y GG)
  EPK: 'epk',              // Producción/Engorda (incluye vueltas y GG)
  CONCEPTS: 'concepts',
  CONCEPT_MAPPINGS: 'conceptMappings',
  TEXT_CONCEPT_MAPPINGS: 'textConceptMappings',
  ACCOUNT_CATALOG: 'accountCatalog',
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
 * Obtiene segmentos de un grupo específico (APK o EPK)
 */
export function getSegmentsByGroup(group: DataGroup): Segment[] {
  const processData = getDataByGroup(group);
  return processData.segments || [];
}

/**
 * Guarda segmentos en un grupo específico (APK o EPK)
 */
export function saveSegmentsByGroup(group: DataGroup, segments: Segment[]): void {
  const processData = getDataByGroup(group);
  processData.segments = segments;
  saveDataByGroup(group, processData);
  console.log(`✅ Segmentos guardados en ${group}:`, segments.length);
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
    "SUELDOS Y SALARIOS",
    "ADMON SUELDOS",
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
    "UNIFORMES Y BOTAS",
    "DEPRECIACIONES"
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
 * Inicializa mapeos de conceptos por código predefinidos si no existen
 */
export function initializePredefinedConceptMappings(): void {
  const existingMappings = getConceptMappings();
  
  // Si ya hay mapeos, no hacer nada
  if (existingMappings.length > 0) {
    console.log('📋 Mapeos de conceptos ya inicializados:', existingMappings.length);
    return;
  }

  const today = new Date().toISOString();
  // Mapeos generados desde el catálogo de cuentas (cuentas principales XXX-XXX-000-000-00)
  const predefinedMappings: Omit<ConceptMapping, 'id' | 'createdAt'>[] = [
    // Mapeos APK (35 cuentas principales)
    { accountCode: '001', sourceText: 'SUELDOS Y SALARIOS', targetConcept: 'SUELDOS Y SALARIOS', dataType: 'apk' },
    { accountCode: '016', sourceText: 'OBRA CIVIL', targetConcept: 'OBRA CIVIL', dataType: 'apk' },
    { accountCode: '017', sourceText: 'GASOLINA', targetConcept: 'GASOLINA', dataType: 'apk' },
    { accountCode: '018', sourceText: 'DIESEL', targetConcept: 'DIESEL', dataType: 'apk' },
    { accountCode: '020', sourceText: 'VARIOS', targetConcept: 'VARIOS', dataType: 'apk' },
    { accountCode: '021', sourceText: 'ARTÍCULOS DE LIMPIEZA', targetConcept: 'LIMPIEZA', dataType: 'apk' },
    { accountCode: '022', sourceText: 'MANTENIMIENTO MAQUINARIA Y EQUIPO', targetConcept: 'EQ. TRANSPORTE', dataType: 'apk' },
    { accountCode: '025', sourceText: 'MANTO. EQUIPO TRANSPORTE', targetConcept: 'EQ. TRANSPORTE', dataType: 'apk' },
    { accountCode: '027', sourceText: 'GAS', targetConcept: 'GAS', dataType: 'apk' },
    { accountCode: '028', sourceText: 'RENTAS', targetConcept: 'RENTA', dataType: 'apk' },
    { accountCode: '029', sourceText: 'ENERGIA ELECTRICA', targetConcept: 'ENERGIA ELECTRICA', dataType: 'apk' },
    { accountCode: '030', sourceText: 'DEPRECIACIONES Y AMORTIZACIONES', targetConcept: 'DEPRECIACIONES', dataType: 'apk' },
    { accountCode: '032', sourceText: 'MEDICINA Y MATERIAL QUIRURGICO', targetConcept: 'MEDICINA', dataType: 'apk' },
    { accountCode: '034', sourceText: 'NO DEDUCIBLES', targetConcept: 'NO DEDUCIBLES', dataType: 'apk' },
    
    // Mapeos EPK (30 cuentas principales)
    { accountCode: '001', sourceText: 'SUELDOS Y SALARIOS', targetConcept: 'SUELDOS Y SALARIOS', dataType: 'epk' },
    { accountCode: '020', sourceText: 'OBRA CIVIL', targetConcept: 'OBRA CIVIL', dataType: 'epk' },
    { accountCode: '021', sourceText: 'GASOLINA', targetConcept: 'GASOLINA', dataType: 'epk' },
    { accountCode: '023', sourceText: 'UNIFORMES Y BOTAS', targetConcept: 'UNIFORMES Y BOTAS', dataType: 'epk' },
    { accountCode: '024', sourceText: 'VARIOS', targetConcept: 'VARIOS', dataType: 'epk' },
    { accountCode: '025', sourceText: 'MANTO.EQUIPO TRANSPORTE', targetConcept: 'EQ. TRANSPORTE', dataType: 'epk' },
    { accountCode: '027', sourceText: 'ARTÍCULOS DE LIMPIEZA', targetConcept: 'LIMPIEZA', dataType: 'epk' },
    { accountCode: '028', sourceText: 'GAS', targetConcept: 'GAS', dataType: 'epk' },
    { accountCode: '029', sourceText: 'RENTAS', targetConcept: 'RENTA', dataType: 'epk' },
    { accountCode: '030', sourceText: 'ENERGIA ELECTRICA', targetConcept: 'ENERGIA ELECTRICA', dataType: 'epk' },
    { accountCode: '031', sourceText: 'MEDICINA Y MATERIAL QUIRURGICO', targetConcept: 'MEDICINA', dataType: 'epk' },
    { accountCode: '034', sourceText: 'NO DEDUCIBLES', targetConcept: 'NO DEDUCIBLES', dataType: 'epk' },
  ];

  const mappings: ConceptMapping[] = predefinedMappings.map((mapping, index) => ({
    id: `mapping-${mapping.dataType}-${mapping.accountCode}-${Date.now()}-${index}`,
    ...mapping,
    createdAt: today,
  }));

  saveConceptMappings(mappings);
  console.log('✅ Mapeos de conceptos predefinidos inicializados:', mappings.length);
}

/**
 * Inicializa mapeos por texto predefinidos (basados en código legacy) si no existen
 * Estos mapeos tienen PRIORIDAD ALTA sobre los mapeos por código
 */
export function initializePredefinedTextMappings(): void {
  const existingMappings = getTextConceptMappings();
  
  // Si ya hay mapeos, no hacer nada
  if (existingMappings.length > 0) {
    console.log('📋 Mapeos por texto ya inicializados:', existingMappings.length);
    return;
  }

  const today = new Date().toISOString();
  const predefinedTextMappings: Omit<TextConceptMapping, 'id' | 'createdAt'>[] = [
    // Mapeos por texto para GG de EPK (133-xxx)
    { 
      textPattern: 'GRANJ', 
      matchType: 'startsWith', 
      targetConcept: 'SUELDOS Y SALARIOS', 
      dataType: 'epk',
      priority: 1
    },
    { 
      textPattern: 'ADMIN', 
      matchType: 'startsWith', 
      targetConcept: 'ADMON SUELDOS', 
      dataType: 'epk',
      priority: 2
    },
    // Mapeos por texto para GG de APK (132-xxx)
    { 
      textPattern: 'GRANJ', 
      matchType: 'startsWith', 
      targetConcept: 'SUELDOS Y SALARIOS', 
      dataType: 'apk',
      priority: 1
    },
    { 
      textPattern: 'ADMIN', 
      matchType: 'startsWith', 
      targetConcept: 'ADMON SUELDOS', 
      dataType: 'apk',
      priority: 2
    },
  ];

  const mappings: TextConceptMapping[] = predefinedTextMappings.map((mapping, index) => ({
    id: `text-mapping-${mapping.dataType}-${Date.now()}-${index}`,
    ...mapping,
    createdAt: today,
  }));

  saveTextConceptMappings(mappings);
  console.log('✅ Mapeos por texto predefinidos inicializados:', mappings.length);
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
  dataType: 'apk' | 'epk'
): ConceptMapping | undefined {
  const mappings = getConceptMappings();
  // Normalizar código: eliminar ceros a la izquierda para comparación flexible
  const normalizedCode = accountCode.replace(/^0+/, '') || '0';
  
  return mappings.find(m => {
    const mappingNormalizedCode = m.accountCode.replace(/^0+/, '') || '0';
    return mappingNormalizedCode === normalizedCode && m.dataType === dataType;
  });
}

/**
 * Aplica el mapeo a un nombre de cuenta contable
 */
export function applyConceptMapping(
  accountCode: string,
  originalText: string,
  dataType: 'apk' | 'epk'
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
  dataType: 'apk' | 'epk'
): TextConceptMapping | undefined {
  const mappings = getTextConceptMappings();
  
  // Filtrar por tipo de datos y ordenar por prioridad
  const applicableMappings = mappings
    .filter(m => m.dataType === dataType)
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
  dataType: 'apk' | 'epk'
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

// ============================================
// CATÁLOGO DE CUENTAS CONTABLES
// ============================================

/**
 * Obtiene el catálogo de cuentas contables
 */
export function getAccountCatalog(): AccountCatalogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNT_CATALOG);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener catálogo de cuentas:', error);
    return [];
  }
}

/**
 * Guarda el catálogo de cuentas contables
 */
export function saveAccountCatalog(catalog: AccountCatalogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_CATALOG, JSON.stringify(catalog));
    console.log(`✅ Catálogo de cuentas guardado: ${catalog.length} registros`);
  } catch (error) {
    console.error('Error al guardar catálogo de cuentas:', error);
    throw new Error('No se pudo guardar el catálogo de cuentas');
  }
}

/**
 * Registra una cuenta contable en el catálogo
 * Si ya existe, incrementa el contador de ocurrencias
 */
export function registerAccountInCatalog(
  fullCode: string,
  accountName: string,
  dataType: 'apk' | 'epk'
): void {
  const catalog = getAccountCatalog();
  const existing = catalog.find(entry => entry.fullCode === fullCode);
  
  if (existing) {
    // Ya existe, incrementar contador y actualizar última aparición
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
  } else {
    // Nueva cuenta, agregarla
    const newEntry: AccountCatalogEntry = {
      id: `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fullCode,
      accountName,
      dataType,
      occurrences: 1,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };
    catalog.push(newEntry);
  }
  
  saveAccountCatalog(catalog);
}

/**
 * Limpia el catálogo de cuentas
 */
export function clearAccountCatalog(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCOUNT_CATALOG);
  console.log('🗑️ Catálogo de cuentas limpiado');
}
