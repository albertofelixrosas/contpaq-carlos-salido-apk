# 📘 Documentación Completa - Sistema Contpaq

## 🎯 Visión General

Este proyecto migra una aplicación web de procesamiento de datos contables desde HTML/CSS/JavaScript vanilla a una arquitectura moderna con **React + TypeScript + Material-UI**.

---

## 📁 Estructura de la Documentación

### 🏗️ **UML y Modelado** (`/docs/uml/`)

1. **[domain-model.md](./uml/domain-model.md)** 
   - Entidades del dominio (Movimiento, Concepto, Segmento, etc.)
   - Relaciones entre entidades
   - Reglas de negocio principales
   - Diagrama de clases UML
   - Estados del sistema

2. **[use-cases.md](./uml/use-cases.md)**
   - 8 casos de uso detallados
   - Flujos principales y alternativos
   - Criterios de aceptación
   - Diagramas de secuencia

### 🚀 **Plan de Migración** (`/docs/migration/`)

3. **[00-overview.md](./migration/00-overview.md)** - **ESTE DOCUMENTO**
   - Roadmap completo de migración
   - Estructura del proyecto final
   - Convenciones de código
   - Checklist de progreso

4. **Guías Paso a Paso** (Próximos documentos a crear):
   - `01-setup.md` - ✅ Configuración inicial (YA COMPLETADO)
   - `02-theme-and-layout.md` - Tema MUI y layout
   - `03-excel-processing.md` - Procesamiento de Excel
   - `04-file-upload.md` - Feature de carga de archivos
   - `05-data-table.md` - Feature de tabla con TanStack
   - `06-concepts.md` - Feature de gestión de conceptos
   - `07-record-editing.md` - Feature de edición de registros
   - `08-mass-replacement.md` - Feature de sustitución masiva
   - `09-segments.md` - Feature de segmentos
   - `10-prorrateo.md` - Feature de prorrateo
   - `11-integration.md` - Integración final
   - `12-testing.md` - Testing manual

### 📊 **Reglas de Negocio** (`/docs/business-rules/`)

5. **Documentos Pendientes**:
   - `calculations.md` - Lógica de cálculos y prorrateo
   - `validations.md` - Reglas de validación
   - `data-flow.md` - Flujo de datos en la app

---

## 🎯 Casos de Uso Principales

| ID | Caso de Uso | Frecuencia | Complejidad |
|----|-------------|------------|-------------|
| CU-001 | Cargar archivo APK | Alta | Media |
| CU-002 | Reclasificar conceptos | Muy Alta | Alta |
| CU-003 | Cargar archivo GG | Alta | Media |
| CU-004 | Configurar segmentos | Media | Baja |
| CU-005 | Generar prorrateo | Alta | Alta |
| CU-006 | Filtrar movimientos | Alta | Media |
| CU-007 | Exportar datos | Alta | Baja |
| CU-008 | Gestionar conceptos | Baja | Baja |

---

## 🏗️ Arquitectura del Sistema

### Capas de la Aplicación

```
┌─────────────────────────────────────────┐
│         PRESENTACIÓN (React)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Features │  │  Layout │  │  Theme  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       LÓGICA DE NEGOCIO (Hooks)         │
│  ┌───────────┐  ┌──────────────────┐   │
│  │  Custom   │  │  React Hook Form │   │
│  │   Hooks   │  │    + Zod         │   │
│  └───────────┘  └──────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        SERVICIOS (Services)             │
│  ┌────────────┐  ┌──────────────────┐  │
│  │ localStorage│  │  Excel Processor │  │
│  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      DATOS (LocalStorage)               │
│  { apk: {...}, concepts: [...] }        │
└─────────────────────────────────────────┘
```

---

## 📊 Datos del Sistema

### Estructura en localStorage

```javascript
// Clave: "apk"
{
  data: ApkRecord[],         // Movimientos APK
  segments: Segment[],       // Segmentos/vueltas
  gg: GgRecord[],           // Movimientos GG
  prorrateo: ProrrateoRecord[] // Prorrateo calculado
}

// Clave: "concepts"
Concept[]  // Catálogo de conceptos
```

### Tipos Principales

```typescript
interface ApkRecord {
  id: number;
  fecha: string;
  egresos: string;
  folio: string;
  proveedor: string;
  factura: string;
  importe: number;
  concepto: string;  // ← Reclasificado
  vuelta: string;
  mes: string;
  año: string;
}

interface Concept {
  id: string;
  text: string;
  createdAt: string;
}

interface Segment {
  segment: string;  // "19 EPK2-42.2"
  count: number;    // Cerdos para prorrateo
}
```

---

## 🔄 Flujo de Trabajo del Usuario

```
1. INICIO
   └─> Seleccionar tipo: APK o GG

2. CARGAR APK
   └─> Subir archivo Excel
   └─> Sistema procesa y muestra tabla
   └─> Usuario reclasifica conceptos manualmente

3. CARGAR GG
   └─> Subir archivo Excel
   └─> Sistema procesa con reglas de GG
   └─> Usuario reclasifica conceptos

4. CONFIGURAR SEGMENTOS
   └─> Ingresar cantidad de cerdos por vuelta

5. GENERAR PRORRATEO
   └─> Sistema distribuye GG entre vueltas
   └─> Muestra tabla de resultados

6. EXPORTAR
   └─> Copiar al portapapeles o descargar Excel
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: UI library
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Material-UI v6**: Componentes UI
- **@emotion**: CSS-in-JS (peer dependency de MUI)

### Manejo de Datos
- **TanStack Table v8**: Tablas avanzadas
- **React Hook Form**: Formularios
- **Zod**: Validación de schemas
- **SheetJS (xlsx)**: Procesamiento de Excel

### Estado
- **useState/useEffect**: Estado local
- **Custom Hooks**: Lógica reutilizable
- **localStorage**: Persistencia (sin Redux/Context API)

---

## 📈 Progreso de la Migración

### ✅ Completado

- [x] Análisis del código vanilla
- [x] Documentación de dominio (UML)
- [x] Casos de uso detallados
- [x] Proyecto React + Vite creado
- [x] Dependencias instaladas
- [x] Estructura de carpetas
- [x] Tipos TypeScript definidos
- [x] Schemas Zod creados
- [x] Servicio de localStorage implementado

### 🎯 En Progreso

- [ ] Tema Material-UI
- [ ] Layout principal
- [ ] Sistema de notificaciones

### ⏳ Pendiente

- [ ] Migración de lógica de Excel
- [ ] Features individuales (8 features)
- [ ] Integración completa
- [ ] Testing manual

---

## 🎨 Tema y Diseño

### Paleta de Colores

```javascript
// Colores principales del diseño actual
primary: '#3a86ff',     // Azul principal
secondary: '#ff6b35',   // Naranja/rojo
success: '#28a745',     // Verde
error: '#dc3545',       // Rojo error
warning: '#ffc107',     // Amarillo
info: '#17a2b8',        // Cyan

// Neutrales
background: '#f5f5f7',  // Gris claro
surface: '#ffffff',     // Blanco
text: '#333333',        // Gris oscuro
```

### Tipografía

```javascript
fontFamily: 'Poppins, sans-serif',
weights: [300, 400, 500, 600]
```

---

## 📚 Conceptos Predefinidos

Lista completa de conceptos de gasto:

1. ALIMENTO
2. LECHONES
3. OBRA CIVIL
4. SUELDOS GJAS
5. SUELDOS ADMON
6. MEDICINA
7. VACUNA
8. GASOLINA
9. RENTA
10. VARIOS
11. EQ. TRANSPORTE
12. ENERGIA ELECTRICA
13. DIESEL
14. LIMPIEZA
15. GAS
16. UNIFORMES Y BOTAS

---

## 🔍 Reglas de Reclasificación Automática

### Por Subcuenta

```javascript
const subAccountRules = {
  '020': 'OBRA CIVIL',
  '023': 'UNIFORMES Y BOTAS',
  '024': 'VARIOS',
  '025': 'EQ. TRANSPORTE',
  '017': 'GASOLINA',
  '018': 'DIESEL',
  '030': 'DEPRECIACIONES',
  '034': 'VARIOS',
  '037': 'VARIOS',
  '039': 'VARIOS'
};
```

### Por Proveedor

```javascript
if (proveedor.startsWith('GRANJ')) {
  concepto = 'SUELDOS GJAS';
} else if (proveedor.startsWith('ADMIN')) {
  concepto = 'SUELDOS ADMON';
}
```

---

## 🧮 Cálculo de Prorrateo

### Fórmula

```javascript
totalCerdos = Σ(segment.count);

para cada movimientoGG:
  para cada segmento:
    importeProrrateado = movimientoGG.importe × (segmento.count / totalCerdos);
    
    nuevoRegistro = {
      ...movimientoGG,
      vuelta: segmento.segment,
      importe: importeProrrateado,
      id: auto_increment
    };
```

### Ejemplo

```
Movimiento GG: $10,000 (DIESEL)
Vueltas:
  - 19: 100 cerdos
  - 20: 150 cerdos
  - 21: 250 cerdos
Total: 500 cerdos

Prorrateo:
  - Vuelta 19: $10,000 × (100/500) = $2,000
  - Vuelta 20: $10,000 × (150/500) = $3,000
  - Vuelta 21: $10,000 × (250/500) = $5,000
```

---

## ⚙️ Configuración del Proyecto

### Requisitos

- Node.js 18+ 
- npm 9+
- Navegador moderno (Chrome/Edge recomendado)

### Instalación

```bash
cd contpaq-react
npm install
npm run dev
```

### Build para Producción

```bash
npm run build
# Archivos generados en /dist
```

---

## 🎯 Próximos Pasos para el Desarrollador

1. **Revisar Documentación**:
   - Leer [domain-model.md](./uml/domain-model.md) para entender entidades
   - Leer [use-cases.md](./uml/use-cases.md) para entender flujos

2. **Empezar Migración**:
   - Seguir [00-overview.md](./migration/00-overview.md) para roadmap
   - Implementar features en orden sugerido

3. **Consultar cuando sea necesario**:
   - Tipos ya están definidos en `/src/types/`
   - Servicio localStorage listo en `/src/services/`
   - Schemas Zod listos en `/src/types/schemas.ts`

---

## 📞 Soporte

Para dudas sobre el dominio del negocio o reglas específicas, consultar:
- Archivo de respuestas original: `respuestas.md`
- Casos de uso detallados: `use-cases.md`
- Modelo de dominio: `domain-model.md`

---

## ✅ Checklist Rápido

- [x] Proyecto creado
- [x] Dependencias instaladas
- [x] Tipos definidos
- [x] Documentación completa
- [ ] Tema configurado
- [ ] Layout implementado
- [ ] Features migrados
- [ ] Testing completado
- [ ] Listo para producción

---

**¡Listo para comenzar la migración! 🚀**

Empieza con el documento de migración #2: `02-theme-and-layout.md`
