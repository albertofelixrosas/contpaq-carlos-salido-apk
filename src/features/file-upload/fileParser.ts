import type { ApkRecord, GgRecord, FileDetectionResult, ProcessType, DataGroup } from '../../types';
import { extractAccountCode } from '../../utils/accountCodeParser';
import { applyFullConceptMapping, registerAccountInCatalog } from '../../services/localStorage';

// ========================================
// REGEX (copiados del código vanilla original)
// ========================================
const accountNumberRegex = /^\d{3}-\d{3}-\d{3}-\d{3}-\d{2}$/;
const excelCommonDateRegex = /^([0-2]?\d|3[01])\/(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)\/\d{4}\s?$/;

// ========================================
// DETECCIÓN AUTOMÁTICA DE TIPO DE ARCHIVO
// ========================================

/**
 * Detecta automáticamente el tipo de archivo Excel:
 * - APK (132) o EPK (133) según códigos de cuenta
 * - Si tiene segmentos/vueltas (archivo principal) o no (GG)
 * - Periodo del archivo (celda A3)
 */
export const detectFileType = (rawData: unknown[]): FileDetectionResult => {
  console.log('🔍 Iniciando detección automática de archivo...');
  
  const indicators = {
    foundCode132: false,
    foundCode133: false,
    foundAparceriaText: false,
    foundProduccionText: false,
    foundSegmentos: false,
    foundSegmentosGG: false,
    foundSegmentosVueltas: false,
  };

  let periodo = '';
  
  // 1. Intentar extraer el periodo de la celda A3 (fila 2, índice 0)
  if (rawData.length > 2) {
    const row3 = rawData[2] as any[];
    const cellA3 = String(row3?.[0] || '').trim().toUpperCase();
    
    // Buscar patrones de periodo: "ENERO 2024", "PERIODO: ENERO 2024", etc.
    const periodoMatch = cellA3.match(/(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s*\d{4}/i);
    if (periodoMatch) {
      periodo = periodoMatch[0];
    } else {
      // Si no encuentra el patrón, usar el texto completo si es corto
      periodo = cellA3.length < 50 ? cellA3 : 'No detectado';
    }
  }

  // 2. Escanear las filas buscando indicadores
  for (let i = 0; i < Math.min(rawData.length, 100); i++) { // Escanear primeras 100 filas
    const row = rawData[i] as any[];
    const firstCell = String(row?.[0] || '').trim();
    const secondCell = String(row?.[1] || '').trim().toUpperCase();

    // Buscar códigos de cuenta
    if (accountNumberRegex.test(firstCell)) {
      if (firstCell.startsWith('132-')) {
        indicators.foundCode132 = true;
      }
      if (firstCell.startsWith('133-')) {
        indicators.foundCode133 = true;
      }

      // Buscar textos característicos
      if (secondCell.includes('APARCERÍA') && secondCell.includes('PROCESO')) {
        indicators.foundAparceriaText = true;
      }
      if (secondCell.includes('PRODUCCION') && secondCell.includes('CERDOS') && secondCell.includes('PROCESO')) {
        indicators.foundProduccionText = true;
      }
    }

    // Buscar segmentos y determinar si son GG o Vueltas
    if (firstCell.toLowerCase().startsWith('segmento')) {
      indicators.foundSegmentos = true;
      
      // Verificar si el segmento es GG (termina con " GG")
      const upperFirstCell = firstCell.toUpperCase();
      if (upperFirstCell.includes(' GG')) {
        indicators.foundSegmentosGG = true;
      } else if (upperFirstCell.includes(' APK') || upperFirstCell.includes(' EPK')) {
        indicators.foundSegmentosVueltas = true;
      }
    }
  }

  // 3. Determinar ProcessType (APK o EPK)
  let processType: ProcessType;
  let confidence = 0;

  if (indicators.foundCode132 || indicators.foundAparceriaText) {
    processType = 'apk';
    confidence += indicators.foundCode132 ? 50 : 0;
    confidence += indicators.foundAparceriaText ? 40 : 0;
  } else if (indicators.foundCode133 || indicators.foundProduccionText) {
    processType = 'epk';
    confidence += indicators.foundCode133 ? 50 : 0;
    confidence += indicators.foundProduccionText ? 40 : 0;
  } else {
    // Default a EPK si no se encuentra nada (mantener compatibilidad)
    processType = 'epk';
    confidence = 20;
  }

  // 4. Determinar si es archivo principal (con vueltas) o GG
  // Si encontramos segmentos GG pero NO vueltas, es archivo GG
  // Si encontramos segmentos vueltas (APK/EPK), es archivo de vueltas
  const hasVueltas = indicators.foundSegmentosVueltas;
  const isGastoGeneral = indicators.foundSegmentosGG && !indicators.foundSegmentosVueltas;
  
  // Si no hay segmentos, asumir que es GG (sin segmentos = sin vueltas)
  if (!indicators.foundSegmentos) {
    // No hay segmentos en absoluto, probablemente es archivo GG sin la estructura de segmentos
  }
  
  confidence += hasVueltas ? 10 : 5;

  // 5. Construir DataGroup (siempre es el processType, GG se guarda dentro del mismo grupo)
  const dataGroup: DataGroup = processType;

  const result: FileDetectionResult = {
    processType,
    hasVueltas,
    isGastoGeneral,
    periodo: periodo || 'No detectado',
    dataGroup,
    confidence: Math.min(confidence, 100),
    indicators,
  };

  console.log('✅ Detección completada:', result);
  return result;
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Crea un objeto a partir de una fila de datos (del código vanilla original)
 */
function createObjectFromRow(row: any[]): {
  fecha: string;
  tipo: string;
  numero: string;
  concepto: string;
  ref: string;
  cargos: string;
} {
  return {
    fecha: row[0],
    tipo: row[1],
    numero: row[2],
    concepto: row[3],
    ref: row[4],
    cargos: row[5]
  };
}

/**
 * Convierte una fecha en formato "DD/Mmm/YYYY" a un objeto con el mes y el año (del código vanilla original)
 */
function parseDateString(dateString: string): { monthString: string; year: number } {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const [_, month, year] = dateString.split('/');

  if (!months.includes(month)) {
    throw new Error(`Mes inválido: ${month}`);
  }

  return {
    monthString: month,
    year: parseInt(year, 10)
  };
}

// ========================================
// PROCESAMIENTO DE DATOS APK/EPK (principal con vueltas/segmentos)
// ========================================

/**
 * Procesa los datos raw de Excel y los convierte en datos APK/EPK estructurados
 * Funciona tanto para Aparcería (132) como para Producción/Engorda (133)
 * @param rawData - Datos crudos del Excel
 * @param processType - 'apk' o 'epk' según el tipo detectado
 */
export const normalizeApkData = (rawData: unknown[], processType: ProcessType = 'epk'): ApkRecord[] => {
  console.log(`🔍 normalizeApkData iniciado (${processType.toUpperCase()}) con`, rawData.length, 'filas');
  console.log('🔍 Primera fila (encabezados):', rawData[0]);
  console.log('🔍 Segunda fila (datos):', rawData[1]);
  
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = "";
  let currentAccountCode = ""; // Guardar el código de cuenta
  let currentOriginalAccountName = ""; // Guardar el nombre original
  let currentSegmentName = "";
  const segmentNames = new Set<string>();
  const apkData: ApkRecord[] = [];
  let recordId = 1; // ID auto-incremental comenzando en 1

  let accountMatches = 0;
  let segmentMatches = 0;
  let dateMatches = 0;

  // Se lee las filas de principio a fin
  for (let i = 1; i < rawData.length; i++) {
    // Se obtiene la fila actual
    const row = rawData[i] as any[];
    // Se obtiene el valor de la primera columna
    const firstCell = String(row?.[0] || '').trim();

    // Se identifica el tipo de fila según el valor de la primera columna

    // 133-000-000-000-00	PRODUCCION DE CERDOS EN PROCESO
    // 1️⃣ Si la primera celda es un codigo de cuenta contable
    if (firstCell.match(accountNumberRegex)) {
      accountMatches++;
      // La segunda celda es el nombre de la cuenta contable original
      const originalAccountName = String(row?.[1] || '').trim();
      
      // Registrar en el catálogo de cuentas
      registerAccountInCatalog(firstCell, originalAccountName, processType);
      
      // TEMPORAL: Guardamos el código y el texto original
      // El mapeo se aplicará cuando tengamos el texto completo del concepto de pago
      currentAccountCode = firstCell;
      currentOriginalAccountName = originalAccountName;
      
      if (accountMatches <= 3) {
        console.log('✅ Cuenta contable encontrada:', firstCell, '->', originalAccountName);
      }
    }
    // Segmento:  100 GG
    // 2️⃣ Si la primera celda empieza con "segmento"
    if (firstCell.toLowerCase().startsWith('segmento')) {
      segmentMatches++;
      // El nombre del segmento se encuentra despues de "Segmento:  " en esa misma celda
      currentSegmentName = firstCell.split(' ')
        .filter((_: string, index: number) => index > 2)
        .slice()
        .reverse()
        .filter((_: string, index: number) => index === 0)
        .join(' ')
        .trim();
      if (segmentMatches <= 3) {
        console.log('✅ Segmento encontrado:', firstCell, '->', currentSegmentName);
      }
    }
    // 3️⃣ Si la primera celda es una fecha común de Excel
    if (firstCell.match(excelCommonDateRegex)) {
      dateMatches++;
      // Se crea un objeto con los datos de la fila
      const rowObject = createObjectFromRow(row);

      // Quiero convertir el objeto a un nuevo objeto que incluya los valores actuales de segmento y cuenta contable
      // FECHA	EGRESOS	FOLIO	PROVEEDOR	FACTURA	 IMPORTE 	CONCEPTO	VUELTA	MES	AÑO

      const { monthString, year } = parseDateString(rowObject.fecha);
      
      // APLICAR MAPEO CON PRIORIDAD:
      // 1. Primero intenta mapeo por texto del concepto de pago (proveedor)
      // 2. Si no encuentra, intenta mapeo por código de cuenta
      // 3. Si no encuentra, usa el texto original
      const paymentConcept = rowObject.concepto || ""; // "GRANJAS NOM SEM 39..."
      const accountCode = extractAccountCode(currentAccountCode);
      
      console.log(`🔍 Procesando fila ${i}:`, {
        currentAccountCode,
        extractedAccountCode: accountCode,
        originalAccountName: currentOriginalAccountName,
        paymentConcept: paymentConcept.substring(0, 50),
        processType
      });
      
      currentAccountName = applyFullConceptMapping(
        accountCode || "",
        currentOriginalAccountName,
        paymentConcept,
        processType // Usa el processType detectado (apk o epk)
      );
      
      console.log(`✅ Concepto aplicado: "${currentAccountName}"`);

      // En caso de que un valor no exista, se asigna cadena vacía o 0
      // Se crea el nuevo objeto con la estructura deseada
      // ID auto-incremental, Fecha, Egresos, Folio, Proveedor, Factura, Importe, Concepto, Vuelta, Mes, Año
      const newRowObject: ApkRecord = {
        id: recordId++, // ID auto-incremental único
        fecha: rowObject.fecha,
        egresos: rowObject.tipo,
        folio: rowObject.numero || "",
        proveedor: rowObject.concepto || "",
        factura: rowObject.ref || "",
        importe: parseFloat(rowObject.cargos) || 0,
        concepto: currentAccountName,
        vuelta: currentSegmentName,
        mes: monthString,
        año: year.toString(),
      };

      if (dateMatches <= 3) {
        console.log('✅ Registro creado:', newRowObject);
      }

      apkData.push(newRowObject);
      segmentNames.add(newRowObject.vuelta);
    }
  }

  console.log('📊 Resumen del procesamiento:');
  console.log('  - Cuentas contables encontradas:', accountMatches);
  console.log('  - Segmentos encontrados:', segmentMatches);
  console.log('  - Fechas/registros encontrados:', dateMatches);
  console.log('✅ APK Data procesada:', apkData.length, 'registros');
  return apkData;
};

// ========================================
// PROCESAMIENTO DE DATOS GG (Gastos Generales)
// ========================================

/**
 * Procesa los datos raw de Excel y los convierte en datos GG estructurados
 * Funciona tanto para Aparcería (132) como para Producción/Engorda (133)
 * @param rawData - Datos crudos del Excel
 * @param processType - 'apk' o 'epk' según el tipo detectado
 */
export const normalizeGgData = (rawData: unknown[], processType: ProcessType = 'epk'): GgRecord[] => {
  console.log(`🔍 normalizeGgData iniciado (${processType.toUpperCase()}) con`, rawData.length, 'filas');
  
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = "";
  let currentAccountCode = ""; // Guardar el código de cuenta
  let currentOriginalAccountName = ""; // Guardar el nombre original
  let currentSegmentName = "";

  const ggData: GgRecord[] = [];
  let recordId = 1; // ID auto-incremental comenzando en 1

  // Se lee las filas de principio a fin
  for (let i = 1; i < rawData.length; i++) {
    // Se obtiene la fila actual
    const row = rawData[i] as any[];
    // Se obtiene el valor de la primera columna
    const firstCell = String(row?.[0] || '').trim();

    // Se identifica el tipo de fila según el valor de la primera columna

    // 133-000-000-000-00	PRODUCCION DE CERDOS EN PROCESO
    // 1️⃣ Si la primera celda es un codigo de cuenta contable
    if (firstCell.match(accountNumberRegex)) {
      // La segunda celda es el nombre de la cuenta contable original
      const originalAccountName = String(row?.[1] || '').trim();
      
      // Registrar en el catálogo de cuentas
      registerAccountInCatalog(firstCell, originalAccountName, processType);
      
      // TEMPORAL: Guardamos el código y el texto original
      // El mapeo se aplicará cuando tengamos el texto completo del concepto de pago
      currentAccountCode = firstCell;
      currentOriginalAccountName = originalAccountName;
    }
    // Segmento:  100 GG
    // 2️⃣ Si la primera celda empieza con "segmento"
    if (firstCell.toLowerCase().startsWith('segmento')) {
      // El nombre del segmento se encuentra despues de "Segmento:  " en esa misma celda
      currentSegmentName = firstCell.split(' ')
        .filter((_: string, index: number) => index > 2)
        .slice()
        .reverse()
        .filter((_: string, index: number) => index === 0)
        .join(' ')
        .trim();
    }
    // 3️⃣ Si la primera celda es una fecha común de Excel
    if (firstCell.match(excelCommonDateRegex)) {
      // Se crea un objeto con los datos de la fila
      const rowObject = createObjectFromRow(row);

      // Quiero convertir el objeto a un nuevo objeto que incluya los valores actuales de segmento y cuenta contable
      // FECHA	EGRESOS	FOLIO	PROVEEDOR	FACTURA	 IMPORTE 	CONCEPTO	SEGMENTO	MES	AÑO

      const { monthString, year } = parseDateString(rowObject.fecha);

      // APLICAR MAPEO CON PRIORIDAD:
      // 1. Primero intenta mapeo por texto del concepto de pago (proveedor)
      // 2. Si no encuentra, intenta mapeo por código de cuenta
      // 3. Si no encuentra, usa el texto original
      const paymentConcept = rowObject.concepto || ""; // "GRANJAS NOM SEM 39..."
      const accountCode = extractAccountCode(currentAccountCode);
      
      currentAccountName = applyFullConceptMapping(
        accountCode || "",
        currentOriginalAccountName,
        paymentConcept,
        processType // Usa el processType detectado (apk o epk), NO 'gg'
      );

      const newRowObject: GgRecord = {
        id: recordId++, // ID auto-incremental único
        fecha: rowObject.fecha,
        egresos: rowObject.tipo,
        folio: rowObject.numero || "",
        proveedor: rowObject.concepto || "",
        factura: rowObject.ref || "",
        importe: parseFloat(rowObject.cargos) || 0,
        concepto: currentAccountName,
        segmento: currentSegmentName,
        mes: monthString,
        año: year.toString(),
      };

      ggData.push(newRowObject);
    }
  }

  console.log('✅ GG Data procesada:', ggData.length, 'registros');
  return ggData;
};

// ========================================
// VALIDACIÓN SIMPLE (solo verifica que no esté vacío)
// ========================================

export const validateApkData = (data: unknown[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'El archivo está vacío' };
  }
  return { valid: true };
};

export const validateGgData = (data: unknown[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'El archivo está vacío' };
  }
  return { valid: true };
};
