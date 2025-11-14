/**
 * Contexto global de la aplicación
 * Maneja el estado compartido entre todos los features
 * Ahora soporta 4 grupos: APK, APK-GG, EPK, EPK-GG
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
  // Data - 4 grupos separados
  apkData: ApkRecord[];        // Aparcería - Vueltas
  apkGgData: GgRecord[];       // Aparcería - Gastos Generales
  epkData: ApkRecord[];        // Producción/Engorda - Vueltas
  epkGgData: GgRecord[];       // Producción/Engorda - Gastos Generales
  concepts: Concept[];
  segments: Segment[];
  
  // Actions
  setDataByGroup: (group: DataGroup, data: ApkRecord[] | GgRecord[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  setSegments: (segments: Segment[]) => void;
  
  // Helpers
  loadData: () => void;
  clearData: () => void;
  clearGroupData: (group: DataGroup) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar los 4 grupos desde localStorage
  const [apkData, setApkData] = useState<ApkRecord[]>(() => getDataByGroup('apk').data);
  const [apkGgData, setApkGgData] = useState<GgRecord[]>(() => getDataByGroup('apk-gg').gg);
  const [epkData, setEpkData] = useState<ApkRecord[]>(() => getDataByGroup('epk').data);
  const [epkGgData, setEpkGgData] = useState<GgRecord[]>(() => getDataByGroup('epk-gg').gg);
  
  const [concepts, setConceptsState] = useState<Concept[]>(() => {
    initializePredefinedConcepts();
    return getConcepts();
  });
  const [segments, setSegmentsState] = useState<Segment[]>(() => getSegments());

  const setDataByGroup = useCallback((group: DataGroup, data: ApkRecord[] | GgRecord[]) => {
    console.log(`🔵 AppContext.setDataByGroup llamado para ${group}:`, data.length, 'registros');
    
    // Extraer segmentos si es un archivo con vueltas (no GG)
    const segmentNames = new Set<string>();
    if (group === 'apk' || group === 'epk') {
      (data as ApkRecord[]).forEach(record => {
        if (record.vuelta) {
          segmentNames.add(record.vuelta);
        }
      });
    } else if (group === 'apk-gg' || group === 'epk-gg') {
      (data as GgRecord[]).forEach(record => {
        if (record.segmento) {
          segmentNames.add(record.segmento);
        }
      });
    }

    // Crear ProcessData según el tipo
    const processData = initializeProcessData();
    if (group === 'apk' || group === 'epk') {
      processData.data = data as ApkRecord[];
      processData.segments = Array.from(segmentNames).map(seg => ({ segment: seg, count: 0 }));
    } else {
      processData.gg = data as GgRecord[];
    }

    // Guardar en localStorage
    saveDataByGroup(group, processData);

    // Actualizar estado correspondiente
    switch (group) {
      case 'apk':
        setApkData(data as ApkRecord[]);
        break;
      case 'apk-gg':
        setApkGgData(data as GgRecord[]);
        break;
      case 'epk':
        setEpkData(data as ApkRecord[]);
        break;
      case 'epk-gg':
        setEpkGgData(data as GgRecord[]);
        break;
    }

    // Actualizar segmentos globales si hay nuevos
    if (segmentNames.size > 0) {
      const currentSegments = getSegments();
      const newSegments = Array.from(segmentNames).map(seg => ({
        segment: seg,
        count: (data as any[]).filter(r => 
          (r.vuelta === seg || r.segmento === seg)
        ).length,
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

    console.log(`✅ Datos guardados en ${group}`);
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
    setApkGgData(getDataByGroup('apk-gg').gg);
    setEpkData(getDataByGroup('epk').data);
    setEpkGgData(getDataByGroup('epk-gg').gg);
    setConceptsState(getConcepts());
    setSegmentsState(getSegments());
  }, []);

  const clearData = useCallback(() => {
    setApkData([]);
    setApkGgData([]);
    setEpkData([]);
    setEpkGgData([]);
    setConceptsState([]);
    setSegmentsState([]);
    localStorage.clear();
  }, []);

  const clearGroupData = useCallback((group: DataGroup) => {
    switch (group) {
      case 'apk':
        setApkData([]);
        break;
      case 'apk-gg':
        setApkGgData([]);
        break;
      case 'epk':
        setEpkData([]);
        break;
      case 'epk-gg':
        setEpkGgData([]);
        break;
    }
    saveDataByGroup(group, initializeProcessData());
  }, []);

  return (
    <AppContext.Provider
      value={{
        apkData,
        apkGgData,
        epkData,
        epkGgData,
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
