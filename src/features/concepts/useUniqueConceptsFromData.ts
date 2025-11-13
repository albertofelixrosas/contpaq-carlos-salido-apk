import type { ApkRecord, GgRecord } from '../../types';

/**
 * Hook para obtener conceptos únicos de los datos cargados
 */
export const useUniqueConceptsFromData = (
  apkData: ApkRecord[],
  ggData: GgRecord[]
): string[] => {
  // Extraer conceptos únicos de ambos datasets
  const apkConcepts = apkData.map(record => record.concepto).filter(Boolean);
  const ggConcepts = ggData.map(record => record.concepto).filter(Boolean);
  
  const allConcepts = [...apkConcepts, ...ggConcepts];
  const uniqueConcepts = Array.from(new Set(allConcepts)).sort();
  
  return uniqueConcepts;
};
