# 📘 Plan de Migración a React + Vite + TypeScript

## 🎯 Objetivo

Migrar la aplicación Contpaq desde HTML/CSS/JS vanilla a una arquitectura moderna usando:
- **React 18** con TypeScript
- **Vite** como bundler
- **Material-UI (MUI)** para componentes UI
- **TanStack Table** para tablas avanzadas
- **React Hook Form + Zod** para formularios y validación
- **SheetJS (xlsx)** para procesamiento de Excel

---

## 📊 Estado Actual vs Estado Objetivo

### Estado Actual ❌
- HTML vanilla con JavaScript sin tipos
- CSS puro con clases globales
- Manipulación directa del DOM
- Estado global en localStorage sin abstracción
- Funciones monolíticas difíciles de mantener
- Sin componentes reutilizables
- Sin validaciones formales

### Estado Objetivo ✅
- React con TypeScript fuertemente tipado
- Material-UI con tema personalizado
- Componentes funcionales reutilizables
- Hooks personalizados para lógica de negocio
- Arquitectura por features escalable
- Validación con schemas Zod
- TanStack Table para tablas robustas

---

## 🗂️ Estructura del Proyecto Final

```
contpaq-react/
├── public/
│   └── favicon.svg
├── src/
│   ├── features/              # Características por dominio
│   │   ├── concepts/          # Gestión de conceptos
│   │   │   ├── components/
│   │   │   │   ├── ConceptsManager.tsx
│   │   │   │   ├── ConceptForm.tsx
│   │   │   │   ├── ConceptList.tsx
│   │   │   │   └── ConceptItem.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useConcepts.ts
│   │   │   │   └── useConceptForm.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── file-upload/       # Carga de archivos
│   │   │   ├── components/
│   │   │   │   ├── FileUploadForm.tsx
│   │   │   │   └── DataTypeSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useFileUpload.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── data-table/        # Tabla de datos
│   │   │   ├── components/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TableFilters.tsx
│   │   │   │   ├── TableTotals.tsx
│   │   │   │   └── RecordEditModal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDataTable.ts
│   │   │   │   ├── useTableFilters.ts
│   │   │   │   └── useRecordEdit.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── mass-replacement/  # Sustitución masiva
│   │   │   ├── components/
│   │   │   │   └── MassReplacementPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useMassReplacement.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── segment-editor/    # Editor de segmentos
│   │   │   ├── components/
│   │   │   │   └── SegmentEditorForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSegments.ts
│   │   │   └── index.ts
│   │   │
│   │   └── prorrateo/         # Prorrateo
│   │       ├── components/
│   │       │   ├── ProrrateoPanel.tsx
│   │       │   ├── ProrrateoTable.tsx
│   │       │   └── ProrrateoSummary.tsx
│   │       ├── hooks/
│   │       │   └── useProrrateo.ts
│   │       └── index.ts
│   │
│   ├── components/            # Componentes compartidos
│   │   ├── Layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── Feedback/
│   │   │   ├── Notification.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── Common/
│   │       ├── EmptyState.tsx
│   │       └── LoadingState.tsx
│   │
│   ├── hooks/                 # Hooks globales
│   │   ├── useLocalStorage.ts
│   │   ├── useNotification.ts
│   │   └── useConfirmDialog.ts
│   │
│   ├── services/              # Servicios de datos
│   │   ├── localStorage.ts    # ✅ YA CREADO
│   │   ├── excelProcessor.ts
│   │   └── prorrateoCalculator.ts
│   │
│   ├── types/                 # Definiciones TypeScript
│   │   ├── index.ts           # ✅ YA CREADO
│   │   └── schemas.ts         # ✅ YA CREADO
│   │
│   ├── utils/                 # Utilidades
│   │   ├── formatters.ts      # Formateo de moneda, fechas
│   │   ├── validators.ts      # Validaciones custom
│   │   └── constants.ts       # Constantes globales
│   │
│   ├── theme/                 # Tema Material-UI
│   │   ├── theme.ts
│   │   ├── colors.ts
│   │   └── typography.ts
│   │
│   ├── App.tsx                # Componente raíz
│   ├── main.tsx               # Punto de entrada
│   └── vite-env.d.ts          # Tipos de Vite
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🗺️ Roadmap de Migración

### ✅ **Fase 0: Setup Inicial** (COMPLETADO)
- [x] Crear proyecto con Vite + React + TypeScript
- [x] Instalar dependencias (MUI, TanStack Table, React Hook Form, Zod, xlsx)
- [x] Crear estructura de carpetas
- [x] Definir tipos TypeScript básicos
- [x] Crear schemas Zod de validación
- [x] Implementar servicio de localStorage

### 🎯 **Fase 1: Fundamentos** (SIGUIENTE)
1. Configurar tema Material-UI
2. Crear layout principal con AppBar y navegación por tabs
3. Implementar sistema de notificaciones (Snackbar + Dialog)
4. Crear componentes de feedback (EmptyState, ErrorBoundary)

### 🎯 **Fase 2: Procesamiento de Excel**
5. Migrar lógica de procesamiento Excel a `excelProcessor.ts`
6. Crear servicio de cálculo de prorrateo
7. Implementar hooks de negocio base

### 🎯 **Fase 3: Features Core**
8. **Feature: File Upload**
   - Componente de carga con MUI
   - Hook useFileUpload
   - Selector de tipo de datos

9. **Feature: Data Table**
   - Configurar TanStack Table
   - Implementar filtros
   - Implementar ordenamiento
   - Totales dinámicos

10. **Feature: Concepts Management**
    - CRUD completo de conceptos
    - Hook useConcepts
    - Formulario con React Hook Form + Zod

### 🎯 **Fase 4: Features Avanzados**
11. **Feature: Record Editing**
    - Modal de edición individual
    - Carrusel de verificación
    - Navegación por teclado

12. **Feature: Mass Replacement**
    - Panel de selección múltiple
    - Vista previa de cambios
    - Ejecución de sustitución masiva

13. **Feature: Segment Editor**
    - Formulario dinámico de segmentos
    - Validación de cantidades

14. **Feature: Prorrateo**
    - Generador de prorrateo
    - Tabla de resultados
    - Exportación a Excel

### 🎯 **Fase 5: Integración y Pulido**
15. Integrar todos los features en App.tsx
16. Implementar navegación entre tabs
17. Manejar estados globales (datos cargados, ready para prorrateo)
18. Testing manual completo
19. Optimización de rendimiento
20. Documentación de código

---

## 📋 Checklist de Migración

### Preparación
- [x] Analizar código vanilla existente
- [x] Documentar reglas de negocio
- [x] Crear modelos de dominio UML
- [x] Definir casos de uso
- [ ] Identificar funcionalidades críticas

### Desarrollo
- [ ] Setup de proyecto completado
- [ ] Tema MUI configurado
- [ ] Layout principal funcional
- [ ] Sistema de notificaciones
- [ ] Procesamiento Excel migrado
- [ ] Cada feature funcionando independientemente
- [ ] Integración completa

### Calidad
- [ ] Sin errores de TypeScript
- [ ] Sin warnings de ESLint
- [ ] Todos los casos de uso implementados
- [ ] Testing manual exitoso
- [ ] Documentación actualizada

---

## 🎨 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (`DataTable.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useDataTable.ts`)
- **Servicios**: camelCase (`excelProcessor.ts`)
- **Tipos**: PascalCase (`ApkRecord`, `Concept`)
- **Interfaces**: PascalCase con `I` opcional (`ITableFilters` o `TableFilters`)

### Estructura de Componentes
```typescript
// 1. Imports
import React from 'react';
import { Box, Button } from '@mui/material';
import type { Props } from './types';

// 2. Types/Interfaces
interface ComponentProps {
  data: Data[];
  onSelect: (id: string) => void;
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ data, onSelect }) => {
  // 3a. Hooks
  const [state, setState] = useState();
  const customHook = useCustomHook();
  
  // 3b. Handlers
  const handleClick = () => {};
  
  // 3c. Effects
  useEffect(() => {}, []);
  
  // 3d. Render
  return (
    <Box>
      {/* JSX */}
    </Box>
  );
};
```

### Estructura de Hooks
```typescript
import { useState, useEffect } from 'react';
import type { ReturnType } from './types';

export const useCustomHook = (params): ReturnType => {
  // State
  const [data, setData] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Methods
  const method = () => {};
  
  // Return
  return {
    data,
    method,
    isLoading,
    error
  };
};
```

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Compilar para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint

# Instalación de dependencias adicionales
npm install <package>
```

---

## 📚 Recursos de Referencia

### Documentación Oficial
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)
- [TanStack Table](https://tanstack.com/table/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [SheetJS](https://docs.sheetjs.com/)

### Guías Internas
- [Modelo de Dominio](../uml/domain-model.md)
- [Casos de Uso](../uml/use-cases.md)
- [Reglas de Negocio](../business-rules/calculations.md)

---

## ⚠️ Notas Importantes

1. **Offline-first**: Todo debe funcionar sin conexión a internet
2. **No hay backend**: Toda la lógica es cliente-side
3. **localStorage**: Única fuente de persistencia
4. **Compatibilidad**: Solo necesita funcionar en navegadores modernos (Chrome/Edge)
5. **Excel**: Los archivos son pequeños (<5MB), no requiere workers
6. **Mejora futura**: Historial de cambios (undo/redo) - no implementar ahora

---

## 🎯 Próximos Pasos

Revisa los documentos de migración detallados en orden:
1. [`01-setup.md`](./01-setup.md) - Configuración inicial ✅
2. [`02-theme-and-layout.md`](./02-theme-and-layout.md) - Tema y layout
3. [`03-excel-processing.md`](./03-excel-processing.md) - Procesamiento Excel
4. [`04-file-upload.md`](./04-file-upload.md) - Feature de carga
5. [`05-data-table.md`](./05-data-table.md) - Feature de tabla
6. ... y así sucesivamente

Cada documento incluye:
- Código completo a crear
- Explicaciones paso a paso
- Criterios de aceptación
- Comandos para probar
