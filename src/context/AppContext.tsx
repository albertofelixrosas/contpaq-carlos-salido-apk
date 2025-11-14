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
  initializePredefinedConcepts,
  initializeProcessData,
} from '../services/localStorage';

interface AppContextType {
  // Data - 2 grupos principales
  apkData: ApkRecord[];        // Aparcería - Vueltas
  ggData: GgRecord[];          // Gastos Generales (combinados de APK y EPK)
  epkData: ApkRecord[];        // Producción/Engorda - Vueltas
  concepts: Concept[];
  segments: Segment[];
  
  // Actions
  setDataByGroup: (group: DataGroup, data: ApkRecord[] | GgRecord[], isGG: boolean) => void;
  setConcepts: (concepts: Concept[]) => void;
  setSegments: (segments: Segment[]) => void;
  
  // Helpers
  loadData: () => void;
  clearData: () => void;
  clearGroupData: (group: DataGroup) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar los 2 grupos desde localStorage
  const [apkData, setApkData] = useState<ApkRecord[]>(() => getDataByGroup('apk').data);
  const [epkData, setEpkData] = useState<ApkRecord[]>(() => getDataByGroup('epk').data);
  const [ggData, setGgData] = useState<GgRecord[]>(() => {
    // Combinar GG de ambos grupos
    const apkGg = getDataByGroup('apk').gg;
    const epkGg = getDataByGroup('epk').gg;
    return [...apkGg, ...epkGg];
  });
  
  const [concepts, setConceptsState] = useState<Concept[]>(() => {
    initializePredefinedConcepts();
    return getConcepts();
  });
  const [segments, setSegmentsState] = useState<Segment[]>(() => getSegments());

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
      currentProcessData.segments = Array.from(segmentNames).map(seg => ({ segment: seg, count: 0 }));
    }

    // Guardar en localStorage
    saveDataByGroup(group, currentProcessData);

    // Actualizar estado correspondiente
    if (group === 'apk') {
      if (isGG) {
        // Actualizar solo GG de APK, mantener EPK
        const epkGg = getDataByGroup('epk').gg;
        setGgData([...data as GgRecord[], ...epkGg]);
      } else {
        setApkData(data as ApkRecord[]);
      }
    } else if (group === 'epk') {
      if (isGG) {
        // Actualizar solo GG de EPK, mantener APK
        const apkGg = getDataByGroup('apk').gg;
        setGgData([...apkGg, ...data as GgRecord[]]);
      } else {
        setEpkData(data as ApkRecord[]);
      }
    }

    // Actualizar segmentos globales si hay nuevos (solo de vueltas)
    if (segmentNames.size > 0) {
      const currentSegments = getSegments();
      const newSegments = Array.from(segmentNames).map(seg => ({
        segment: seg,
        count: (data as ApkRecord[]).filter(r => r.vuelta === seg).length,
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

  const loadData = useCallback(() => {
    setApkData(getDataByGroup('apk').data);
    setEpkData(getDataByGroup('epk').data);
    const apkGg = getDataByGroup('apk').gg;
    const epkGg = getDataByGroup('epk').gg;
    setGgData([...apkGg, ...epkGg]);
    setConceptsState(getConcepts());
    setSegmentsState(getSegments());
  }, []);

  const clearData = useCallback(() => {
    setApkData([]);
    setEpkData([]);
    setGgData([]);
    setConceptsState([]);
    setSegmentsState([]);
    localStorage.clear();
  }, []);

  const clearGroupData = useCallback((group: DataGroup) => {
    const emptyData = initializeProcessData();
    saveDataByGroup(group, emptyData);
    
    if (group === 'apk') {
      setApkData([]);
      // Recargar GG para mantener solo EPK
      const epkGg = getDataByGroup('epk').gg;
      setGgData(epkGg);
    } else if (group === 'epk') {
      setEpkData([]);
      // Recargar GG para mantener solo APK
      const apkGg = getDataByGroup('apk').gg;
      setGgData(apkGg);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        apkData,
        ggData,
        epkData,
        concepts,
        segments,
        setDataByGroup,
        setConcepts,
        setSegments,
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
