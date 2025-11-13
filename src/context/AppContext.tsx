/**
 * Contexto global de la aplicación
 * Maneja el estado compartido entre todos los features
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ApkRecord, GgRecord, Concept, Segment } from '../types';
import {
  saveApkData,
  saveGgData,
  getApkData,
  getGgData,
  saveConcepts,
  getConcepts,
  saveSegments,
  getSegments,
} from '../services/localStorage';

interface AppContextType {
  // Data
  apkData: ApkRecord[];
  ggData: GgRecord[];
  concepts: Concept[];
  segments: Segment[];
  
  // Actions
  setApkData: (data: ApkRecord[]) => void;
  setGgData: (data: GgRecord[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  setSegments: (segments: Segment[]) => void;
  
  // Helpers
  loadData: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [apkData, setApkDataState] = useState<ApkRecord[]>(() => getApkData());
  const [ggData, setGgDataState] = useState<GgRecord[]>(() => getGgData());
  const [concepts, setConceptsState] = useState<Concept[]>(() => getConcepts());
  const [segments, setSegmentsState] = useState<Segment[]>(() => getSegments());

  const setApkData = (data: ApkRecord[]) => {
    console.log('🔵 AppContext.setApkData llamado con:', data.length, 'registros');
    console.log('🔵 Primer registro:', data[0]);
    setApkDataState(data);
    console.log('🔵 Estado APK actualizado');
    // Extraer segmentos únicos del campo "vuelta" en ApkRecord
    const segmentNames = new Set<string>();
    data.forEach(record => {
      if (record.vuelta) {
        segmentNames.add(record.vuelta);
      }
    });
    console.log('🔵 Segmentos encontrados:', Array.from(segmentNames));
    saveApkData(data, segmentNames);
    console.log('🔵 Datos APK guardados en localStorage');
  };

  const setGgData = (data: GgRecord[]) => {
    console.log('🔵 AppContext.setGgData llamado con:', data.length, 'registros');
    setGgDataState(data);
    console.log('🔵 Estado GG actualizado');
    saveGgData(data);
    console.log('🔵 Datos GG guardados en localStorage');
  };

  const setConcepts = (newConcepts: Concept[]) => {
    setConceptsState(newConcepts);
    saveConcepts(newConcepts);
  };

  const setSegments = (newSegments: Segment[]) => {
    setSegmentsState(newSegments);
    saveSegments(newSegments);
  };

  const loadData = useCallback(() => {
    setApkDataState(getApkData());
    setGgDataState(getGgData());
    setConceptsState(getConcepts());
    setSegmentsState(getSegments());
  }, []);

  const clearData = useCallback(() => {
    setApkDataState([]);
    setGgDataState([]);
    setConceptsState([]);
    setSegmentsState([]);
    localStorage.clear();
  }, []);

  return (
    <AppContext.Provider
      value={{
        apkData,
        ggData,
        concepts,
        segments,
        setApkData,
        setGgData,
        setConcepts,
        setSegments,
        loadData,
        clearData,
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
