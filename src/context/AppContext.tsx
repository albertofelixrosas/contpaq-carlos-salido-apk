/**
 * Contexto global de la aplicación
 * Maneja el estado compartido entre todos los features
 * Soporta 2 grupos: APK y EPK, cada uno con sus datos de vueltas y GG
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ApkRecord, GgRecord, Concept, Segment, DataGroup } from '../types';
import {
  getDataByGroup,
  saveDataByGroup,
  saveConcepts,
  getConcepts,
  saveSegments,
  getSegments,
  getSegmentsByGroup,
  saveSegmentsByGroup,
  initializePredefinedConcepts,
  initializePredefinedConceptMappings,
  initializePredefinedTextMappings,
  initializeProcessData,
} from '../services/localStorage';

interface AppContextType {
  // Data - 2 grupos principales con GG separados
  apkData: ApkRecord[];        // Aparcería - Vueltas
  apkGgData: GgRecord[];       // Aparcería - Gastos Generales
  epkData: ApkRecord[];        // Producción/Engorda - Vueltas
  epkGgData: GgRecord[];       // Producción/Engorda - Gastos Generales
  ggData: GgRecord[];          // Todos los GG combinados (para compatibilidad)
  concepts: Concept[];
  segments: Segment[];         // Todos los segmentos combinados (obsoleto, usar apkSegments/epkSegments)
  apkSegments: Segment[];      // Segmentos de APK
  epkSegments: Segment[];      // Segmentos de EPK
  
  // Actions
  setDataByGroup: (group: DataGroup, data: ApkRecord[] | GgRecord[], isGG: boolean) => void;
  setConcepts: (concepts: Concept[]) => void;
  setSegments: (segments: Segment[]) => void;
  setSegmentsByGroup: (group: DataGroup, segments: Segment[]) => void;
  
  // Helpers
  loadData: () => void;
  clearData: () => void;
  clearGroupData: (group: DataGroup) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar los 2 grupos desde localStorage
  const [apkData, setApkData] = useState<ApkRecord[]>(() => getDataByGroup('apk').data);
  const [apkGgData, setApkGgData] = useState<GgRecord[]>(() => getDataByGroup('apk').gg);
  const [epkData, setEpkData] = useState<ApkRecord[]>(() => getDataByGroup('epk').data);
  const [epkGgData, setEpkGgData] = useState<GgRecord[]>(() => getDataByGroup('epk').gg);
  const [ggData, setGgData] = useState<GgRecord[]>(() => {
    // Combinar GG de ambos grupos para compatibilidad
    const apkGg = getDataByGroup('apk').gg;
    const epkGg = getDataByGroup('epk').gg;
    return [...apkGg, ...epkGg];
  });
  
  const [concepts, setConceptsState] = useState<Concept[]>(() => {
    initializePredefinedConcepts();
    initializePredefinedConceptMappings();
    initializePredefinedTextMappings();
    return getConcepts();
  });
  const [segments, setSegmentsState] = useState<Segment[]>(() => getSegments());
  const [apkSegments, setApkSegments] = useState<Segment[]>(() => getSegmentsByGroup('apk'));
  const [epkSegments, setEpkSegments] = useState<Segment[]>(() => getSegmentsByGroup('epk'));

  const setDataByGroup = useCallback((group: DataGroup, data: ApkRecord[] | GgRecord[], isGG: boolean) => {
    console.log(`🔵 AppContext.setDataByGroup llamado para ${group} (isGG: ${isGG}):`, data.length, 'registros');
    
    // Extraer segmentos (solo de vueltas, NO de GG)
    const segmentNames = new Set<string>();
    if (!isGG) {
      (data as ApkRecord[]).forEach(record => {
        if (record.vuelta && !record.vuelta.toUpperCase().includes('GG')) {
          segmentNames.add(record.vuelta);
        }
      });
    }

    // Obtener datos actuales del grupo
    const currentProcessData = getDataByGroup(group);
    
    // Actualizar la parte correspondiente (data o gg)
    if (isGG) {
      currentProcessData.gg = data as GgRecord[];
    } else {
      currentProcessData.data = data as ApkRecord[];
      // Inicializar segmentos con count en 0 para que el usuario los configure manualmente
      currentProcessData.segments = Array.from(segmentNames).map(seg => ({ segment: seg, count: 0 }));
    }

    // Guardar en localStorage
    saveDataByGroup(group, currentProcessData);

    // Actualizar estado correspondiente
    if (group === 'apk') {
      if (isGG) {
        setApkGgData(data as GgRecord[]);
        // Actualizar ggData combinado
        setGgData([...data as GgRecord[], ...epkGgData]);
      } else {
        setApkData(data as ApkRecord[]);
        // Actualizar segmentos de APK con count en 0 (el usuario lo configurará manualmente)
        const newSegments = Array.from(segmentNames).map(seg => ({ 
          segment: seg, 
          count: 0
        }));
        setApkSegments(newSegments);
      }
    } else if (group === 'epk') {
      if (isGG) {
        setEpkGgData(data as GgRecord[]);
        // Actualizar ggData combinado
        setGgData([...apkGgData, ...data as GgRecord[]]);
      } else {
        setEpkData(data as ApkRecord[]);
        // Actualizar segmentos de EPK con count en 0 (el usuario lo configurará manualmente)
        const newSegments = Array.from(segmentNames).map(seg => ({ 
          segment: seg, 
          count: 0
        }));
        setEpkSegments(newSegments);
      }
    }

    // Actualizar segmentos globales si hay nuevos (solo de vueltas)
    if (segmentNames.size > 0) {
      const currentSegments = getSegments();
      const newSegments = Array.from(segmentNames).map(seg => ({
        segment: seg,
        count: 0,
      }));
      
      // Merge con segmentos existentes
      const mergedSegments = [...currentSegments];
      newSegments.forEach(newSeg => {
        const existing = mergedSegments.find(s => s.segment === newSeg.segment);
        if (existing) {
          existing.count += newSeg.count;
        } else {
          mergedSegments.push(newSeg);
        }
      });
      
      setSegmentsState(mergedSegments);
      saveSegments(mergedSegments);
    }

    console.log(`✅ Datos guardados en ${group} ${isGG ? '(GG)' : '(Vueltas)'}`);
  }, []);

  const setConcepts = (newConcepts: Concept[]) => {
    setConceptsState(newConcepts);
    saveConcepts(newConcepts);
  };

  const setSegments = (newSegments: Segment[]) => {
    setSegmentsState(newSegments);
    saveSegments(newSegments);
  };

  const setSegmentsByGroup = (group: DataGroup, newSegments: Segment[]) => {
    saveSegmentsByGroup(group, newSegments);
    if (group === 'apk') {
      setApkSegments(newSegments);
    } else {
      setEpkSegments(newSegments);
    }
    // Actualizar también el array combinado (para compatibilidad)
    const apk = group === 'apk' ? newSegments : apkSegments;
    const epk = group === 'epk' ? newSegments : epkSegments;
    setSegmentsState([...apk, ...epk]);
  };

  const loadData = useCallback(() => {
    setApkData(getDataByGroup('apk').data);
    setEpkData(getDataByGroup('epk').data);
    const apkGg = getDataByGroup('apk').gg;
    const epkGg = getDataByGroup('epk').gg;
    setApkGgData(apkGg);
    setEpkGgData(epkGg);
    setGgData([...apkGg, ...epkGg]);
    setConceptsState(getConcepts());
    setSegmentsState(getSegments());
    setApkSegments(getSegmentsByGroup('apk'));
    setEpkSegments(getSegmentsByGroup('epk'));
  }, []);

  const clearData = useCallback(() => {
    setApkData([]);
    setApkGgData([]);
    setEpkData([]);
    setEpkGgData([]);
    setGgData([]);
    setConceptsState([]);
    setSegmentsState([]);
    setApkSegments([]);
    setEpkSegments([]);
    localStorage.clear();
  }, []);

  const clearGroupData = useCallback((group: DataGroup) => {
    const emptyData = initializeProcessData();
    saveDataByGroup(group, emptyData);
    
    if (group === 'apk') {
      setApkData([]);
      setApkGgData([]);
      setApkSegments([]);
      // Recargar GG combinado
      const epkGg = getDataByGroup('epk').gg;
      setGgData(epkGg);
    } else if (group === 'epk') {
      setEpkData([]);
      setEpkGgData([]);
      setEpkSegments([]);
      // Recargar GG combinado
      const apkGg = getDataByGroup('apk').gg;
      setGgData(apkGg);
    }
    // Actualizar segmentos combinados
    setSegmentsState([...apkSegments, ...epkSegments]);
  }, [apkSegments, epkSegments]);

  return (
    <AppContext.Provider
      value={{
        apkData,
        apkGgData,
        epkData,
        epkGgData,
        ggData,
        concepts,
        segments,
        apkSegments,
        epkSegments,
        setDataByGroup,
        setConcepts,
        setSegments,
        setSegmentsByGroup,
        loadData,
        clearData,
        clearGroupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};
