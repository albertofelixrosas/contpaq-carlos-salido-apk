import type { ApkRecord, GgRecord } from '../../types';

/**
 * Normaliza datos crudos de Excel a formato tipado
 * Contpaq exporta con nombres de columnas específicos
 */

export const normalizeApkData = (rawData: unknown[]): ApkRecord[] => {
  return rawData.map((row: any, index) => ({
    id: index + 1,
    fecha: row['Fecha'] || row['FECHA'] || '',
    egresos: row['Egresos'] || row['EGRESOS'] || '',
    folio: row['Folio'] || row['FOLIO'] || '',
    proveedor: row['Proveedor'] || row['PROVEEDOR'] || '',
    factura: row['Factura'] || row['FACTURA'] || '',
    importe: parseFloat(row['Importe'] || row['IMPORTE'] || 0),
    concepto: row['Concepto'] || row['CONCEPTO'] || '',
    vuelta: row['Vuelta'] || row['VUELTA'] || '',
    mes: row['Mes'] || row['MES'] || '',
    año: row['Año'] || row['AÑO'] || row['Ano'] || row['ANO'] || '',
  }));
};

export const normalizeGgData = (rawData: unknown[]): GgRecord[] => {
  return rawData.map((row: any, index) => ({
    id: index + 1,
    fecha: row['Fecha'] || row['FECHA'] || '',
    egresos: row['Egresos'] || row['EGRESOS'] || '',
    folio: row['Folio'] || row['FOLIO'] || '',
    proveedor: row['Proveedor'] || row['PROVEEDOR'] || '',
    factura: row['Factura'] || row['FACTURA'] || '',
    importe: parseFloat(row['Importe'] || row['IMPORTE'] || 0),
    concepto: row['Concepto'] || row['CONCEPTO'] || '',
    segmento: row['Segmento'] || row['SEGMENTO'] || '',
    mes: row['Mes'] || row['MES'] || '',
    año: row['Año'] || row['AÑO'] || row['Ano'] || row['ANO'] || '',
  }));
};

/**
 * Valida que los datos tengan las columnas mínimas requeridas
 */
export const validateApkData = (data: unknown[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'El archivo está vacío' };
  }

  const firstRow = data[0] as any;
  const requiredFields = ['Fecha', 'Concepto', 'Importe'];
  
  const hasRequiredFields = requiredFields.some(field => 
    field in firstRow || field.toUpperCase() in firstRow
  );

  if (!hasRequiredFields) {
    return {
      valid: false,
      error: `El archivo no tiene las columnas requeridas: ${requiredFields.join(', ')}`,
    };
  }

  return { valid: true };
};

export const validateGgData = (data: unknown[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'El archivo está vacío' };
  }

  const firstRow = data[0] as any;
  const requiredFields = ['Concepto', 'Importe'];
  
  const hasRequiredFields = requiredFields.some(field => 
    field in firstRow || field.toUpperCase() in firstRow
  );

  if (!hasRequiredFields) {
    return {
      valid: false,
      error: `El archivo no tiene las columnas requeridas: ${requiredFields.join(', ')}`,
    };
  }

  return { valid: true };
};
