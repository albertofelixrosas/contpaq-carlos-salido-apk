/**
 * Contexto global de la aplicación
 * Maneja el estado compartido entre todos los features
 */

import { createContext, useContext, useState } from 'react';
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
  const [apkData, setApkDataState] = useState<ApkRecord[]>([]);
  const [ggData, setGgDataState] = useState<GgRecord[]>([]);
  const [concepts, setConceptsState] = useState<Concept[]>([]);
  const [segments, setSegmentsState] = useState<Segment[]>([]);

  const setApkData = (data: ApkRecord[]) => {
    setApkDataState(data);
    // Extraer segmentos únicos del campo "segmento" si existe en ApkRecord
    // Por ahora usamos un Set vacío, se puede mejorar después
    const segmentNames = new Set<string>();
    saveApkData(data, segmentNames);
  };

  const setGgData = (data: GgRecord[]) => {
    setGgDataState(data);
    saveGgData(data);
  };

  const setConcepts = (newConcepts: Concept[]) => {
    setConceptsState(newConcepts);
    saveConcepts(newConcepts);
  };

  const setSegments = (newSegments: Segment[]) => {
    setSegmentsState(newSegments);
    saveSegments(newSegments);
  };

  const loadData = () => {
    setApkDataState(getApkData());
    setGgDataState(getGgData());
    setConceptsState(getConcepts());
    setSegmentsState(getSegments());
  };

  const clearData = () => {
    setApkDataState([]);
    setGgDataState([]);
    setConceptsState([]);
    setSegmentsState([]);
    localStorage.clear();
  };

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
