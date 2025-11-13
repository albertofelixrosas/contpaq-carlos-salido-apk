import type { ApkRecord, GgRecord } from '../../types';

// ========================================
// REGEX (copiados del código vanilla original)
// ========================================
const accountNumberRegex = /^\d{3}-\d{3}-\d{3}-\d{3}-\d{2}$/;
const excelCommonDateRegex = /^([0-2]?\d|3[01])\/(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)\/\d{4}\s?$/;

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
// PROCESAMIENTO DE DATOS APK (copiado exactamente del vanilla original)
// ========================================

/**
 * Procesa los datos raw de Excel y los convierte en datos APK estructurados
 * LÓGICA EXACTA DEL CÓDIGO VANILLA ORIGINAL - NO MODIFICAR
 */
export const normalizeApkData = (rawData: unknown[]): ApkRecord[] => {
  console.log('🔍 normalizeApkData iniciado con', rawData.length, 'filas');
  console.log('🔍 Primera fila (encabezados):', rawData[0]);
  console.log('🔍 Segunda fila (datos):', rawData[1]);
  
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = "";
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
      // La segunda celda es el nombre de la cuenta contable, y se guarda en la variable de estado
      currentAccountName = String(row?.[1] || '').trim();
      if (accountMatches <= 3) {
        console.log('✅ Cuenta contable encontrada:', firstCell, '->', currentAccountName);
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
// PROCESAMIENTO DE DATOS GG (copiado exactamente del vanilla original)
// ========================================

/**
 * Cambia el concepto según el tipo de proceso (del código vanilla original)
 */
function changeGGConceptByProcessType(
  rowObject: ReturnType<typeof createObjectFromRow>,
  subAccountCode: number,
  defaultConcept: string
): string {
  let finalConcept = defaultConcept;

  // Conceptos predefinidos
  const preLoadConceptMap: Record<string, string> = {
    "OBRA CIVIL": "OBRA CIVIL",
    "DIESEL": "DIESEL",
    "EQ. TRANSPORTE": "EQ. TRANSPORTE",
    "VARIOS": "VARIOS",
    "GASOLINA": "GASOLINA",
    "ADMON SUELDOS": "ADMON SUELDOS",
    "DEPRECIACIONES": "DEPRECIACIONES",
    "SUELDOS Y SALARIOS": "SUELDOS Y SALARIOS"
  };

  if (['GRANJ', 'ADMIN'].some(word => rowObject.concepto.startsWith(word))) {
    if (rowObject.concepto.startsWith('GRANJ')) {
      finalConcept = preLoadConceptMap["SUELDOS Y SALARIOS"];
    } else if (rowObject.concepto.startsWith('ADMIN')) {
      finalConcept = preLoadConceptMap["ADMON SUELDOS"];
    }
  } else if ([20, 34, 37, 39].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["VARIOS"];
  } else if ([30].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["DEPRECIACIONES"];
  } else if ([25].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["EQ. TRANSPORTE"];
  } else if ([18].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["DIESEL"];
  } else if ([17].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["GASOLINA"];
  }

  return finalConcept;
}

/**
 * Procesa los datos raw de Excel y los convierte en datos GG estructurados
 * LÓGICA EXACTA DEL CÓDIGO VANILLA ORIGINAL - NO MODIFICAR
 */
export const normalizeGgData = (rawData: unknown[]): GgRecord[] => {
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = "";
  let currentSegmentName = "";
  let currentAccountCode = "";

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
      // La segunda celda es el nombre de la cuenta contable, y se guarda en la variable de estado
      currentAccountName = String(row?.[1] || '').trim();
      currentAccountCode = firstCell;
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

      // Extraer la subcuenta del código contable
      // Ejemplo: 133-037-000-000-00 -> subcuenta 037 para finalmente 37
      // La subcuenta es la segunda parte del código separado por guiones
      const subAccountCode = parseInt(currentAccountCode.split('-').slice(1, 2).join('') || '0');
      const finalConcept = changeGGConceptByProcessType(rowObject, subAccountCode, currentAccountName);

      const newRowObject: GgRecord = {
        id: recordId++, // ID auto-incremental único
        fecha: rowObject.fecha,
        egresos: rowObject.tipo,
        folio: rowObject.numero || "",
        proveedor: rowObject.concepto || "",
        factura: rowObject.ref || "",
        importe: parseFloat(rowObject.cargos) || 0,
        concepto: finalConcept,
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
