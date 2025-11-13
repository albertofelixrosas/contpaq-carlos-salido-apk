# 🚀 Guía Rápida de Inicio - Para GitHub Copilot

## 📋 Qué Revisar Antes de Continuar

### 1. **Contexto del Negocio** (5 min)
Lee rápidamente:
- `docs/README.md` - Secciones: "Casos de Uso", "Datos del Sistema", "Flujo de Trabajo"
- `docs/uml/domain-model.md` - Sección: "Entidades del Dominio" (solo los 5 primeros)

### 2. **Código Ya Disponible** (2 min)
Revisa que existen:
- ✅ `src/types/index.ts` - 12 tipos definidos
- ✅ `src/types/schemas.ts` - 5 schemas Zod
- ✅ `src/services/localStorage.ts` - 28 funciones listas

### 3. **Roadmap de Migración** (3 min)
- `docs/migration/00-overview.md` - Sección: "Roadmap de Migración"
- Identifica en qué fase estamos: **Fase 1 (Fundamentos)**

---

## 🎯 Siguiente Tarea: Fase 1 - Fundamentos

### Objetivo
Configurar el tema Material-UI y el layout principal con navegación por tabs.

### Sub-tareas (en orden)

#### 1. **Configurar Tema MUI** (`src/theme/`)
Crear archivos:
- `colors.ts` - Definir paleta (ya documentada en docs/README.md)
- `typography.ts` - Configurar Poppins
- `theme.ts` - Crear tema con `createTheme()`

**Paleta de colores a usar:**
```typescript
primary: '#3a86ff',
secondary: '#ff6b35',
success: '#28a745',
error: '#dc3545',
warning: '#ffc107',
info: '#17a2b8',
```

**Tipografía:**
```typescript
fontFamily: 'Poppins, sans-serif'
```

#### 2. **Crear Layout Principal** (`src/components/Layout/`)
Componentes a crear:
- `AppLayout.tsx` - Container principal con AppBar
- `Header.tsx` - Título y descripción
- `Navigation.tsx` - Tabs de navegación

**Tabs necesarios:**
1. Carga de Datos (upload + tipo selector)
2. Tabla de Datos (visualización + filtros)
3. Conceptos (gestión de catálogo)
4. Segmentos (configuración)
5. Prorrateo (generación y resultados)

#### 3. **Sistema de Notificaciones** (`src/components/Feedback/`)
Componentes a crear:
- `Notification.tsx` - Snackbar de MUI para toasts
- `ConfirmDialog.tsx` - Dialog para confirmaciones
- `ErrorBoundary.tsx` - Manejo de errores React

#### 4. **Hooks Globales** (`src/hooks/`)
Hooks a crear:
- `useNotification.ts` - Hook para mostrar notificaciones
- `useConfirmDialog.ts` - Hook para diálogos de confirmación

#### 5. **Actualizar App.tsx**
- Envolver con `ThemeProvider` de MUI
- Envolver con `ErrorBoundary`
- Renderizar `AppLayout`
- Configurar contexto de notificaciones

---

## 📝 Plantillas de Código

### Theme (`src/theme/theme.ts`)
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3a86ff',
    },
    secondary: {
      main: '#ff6b35',
    },
    // ... resto de colores
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    // ... configuración de pesos
  },
});
```

### App.tsx Base
```typescript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { AppLayout } from './components/Layout/AppLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout />
    </ThemeProvider>
  );
}

export default App;
```

### Hook de Notificación (`src/hooks/useNotification.ts`)
```typescript
import { useState } from 'react';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = (
    message: string,
    severity: NotificationState['severity'] = 'info'
  ) => {
    setNotification({ open: true, message, severity });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
```

---

## ✅ Criterios de Aceptación - Fase 1

Antes de pasar a Fase 2, verificar:

- [ ] El tema MUI está aplicado globalmente
- [ ] La paleta de colores coincide con la especificada
- [ ] La tipografía Poppins se carga correctamente
- [ ] El AppBar muestra título "Resumen de Contpaq"
- [ ] Los tabs de navegación son funcionales
- [ ] Las notificaciones (Snackbar) funcionan
- [ ] Los diálogos de confirmación funcionan
- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] La app corre sin errores en desarrollo

---

## 🔍 Casos de Uso Relacionados con Fase 1

- **CU-General**: Todos los casos de uso necesitan el layout y notificaciones
- **Navegación**: El usuario debe poder moverse entre secciones
- **Feedback**: El usuario debe recibir confirmaciones y errores

---

## 📚 Referencias Rápidas

### MUI Components Principales a Usar
- `AppBar` + `Toolbar` - Header
- `Tabs` + `Tab` - Navegación
- `Container` - Layout
- `Box` - Spacing y estructura
- `Snackbar` + `Alert` - Notificaciones
- `Dialog` - Confirmaciones

### Documentación MUI
- Theme: https://mui.com/material-ui/customization/theming/
- AppBar: https://mui.com/material-ui/react-app-bar/
- Tabs: https://mui.com/material-ui/react-tabs/
- Snackbar: https://mui.com/material-ui/react-snackbar/

---

## 🎨 Diseño Visual Objetivo

```
┌─────────────────────────────────────────────────────────┐
│  🏢 Resumen de Contpaq                                  │  ← AppBar
│  Sube tu archivo y descarga el resultado               │
├─────────────────────────────────────────────────────────┤
│  [Carga] [Tabla] [Conceptos] [Segmentos] [Prorrateo]  │  ← Tabs
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  CONTENIDO DEL TAB                      │  ← Container
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Comandos Útiles Durante Desarrollo

```bash
# Iniciar dev server (ya estás en la raíz)
npm run dev

# Ver errores de TypeScript
npx tsc --noEmit

# Instalar dependencia adicional si es necesaria
npm install <package>
```

---

## 🐛 Posibles Errores y Soluciones

### Error: "Module not found: @mui/material"
**Solución**: Ya está instalado, verificar imports

### Error: "Property 'palette' does not exist"
**Solución**: Importar tipos correctamente desde @mui/material

### Error: Font Poppins no se carga
**Solución**: Agregar en `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## 📊 Progreso Esperado

Después de completar Fase 1:
- ✅ Base visual establecida
- ✅ Navegación funcional
- ✅ Sistema de feedback listo
- 🎯 Listo para implementar features de negocio (Fase 2)

**Tiempo estimado Fase 1**: 2-3 horas

---

## 💡 Tips para Copilot

1. **Usa los tipos existentes**: Importa desde `src/types/index.ts`
2. **Sigue las convenciones**: Revisa `docs/migration/00-overview.md` sección "Convenciones"
3. **Consulta casos de uso**: `docs/uml/use-cases.md` tiene todos los flujos
4. **Reutiliza servicios**: `src/services/localStorage.ts` ya tiene todo lo necesario

---

**¡Listo para comenzar! 🚀**

Una vez completes Fase 1, continúa con el documento que crearé:
`docs/migration/02-excel-processing.md`
