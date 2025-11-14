# Mapeo por Texto de Concepto

## Descripción

El sistema de mapeo por texto permite clasificar los registros basándose en el contenido del campo "Concepto" (Proveedor) del pago, **con prioridad sobre el mapeo por código de cuenta**.

## Prioridad de Mapeo

Cuando se procesa un archivo Excel, el sistema aplica los mapeos en el siguiente orden:

1. **PRIORIDAD ALTA** 🔴 - Mapeo por Texto de Concepto
   - Busca patrones en el campo "Proveedor"
   - Ejemplo: "GRANJAS NOM SEM 39..." → "SUELDOS GJAS"

2. **PRIORIDAD MEDIA** 🟡 - Mapeo por Código de Cuenta
   - Basado en el código extraído de la cuenta contable
   - Ejemplo: "133-001-000-000-00" → extrae "001" → mapea según configuración

3. **FALLBACK** 🟢 - Texto Original
   - Si no hay ningún mapeo, se usa el texto original de la cuenta contable

## Configuración

### Interfaz Gráfica

1. Ve a la pestaña **"Mapeo Texto"** en la navegación
2. Haz clic en **"Agregar Mapeo"**
3. Completa los campos:
   - **Patrón de Texto**: El texto a buscar (ej: "GRANJAS", "ADMIN")
   - **Tipo de Coincidencia**:
     - `Empieza con`: El texto debe estar al inicio
     - `Contiene`: El texto puede estar en cualquier parte
     - `Exacto`: Coincidencia exacta
   - **Concepto Destino**: El concepto al que se mapeará (ej: "SUELDOS GJAS")
   - **Prioridad**: Número que indica el orden de evaluación (1 = más alto)
   - **Tipo de Datos**: APK, GG, o ambos

### Formato de Importación

Puedes importar mapeos desde un archivo `.txt` con el siguiente formato:

```
GRANJAS|startsWith|SUELDOS GJAS|1|apk
ADMIN|startsWith|SUELDOS ADM|2|apk
NOMINA|contains|SUELDOS|3|both
```

**Formato**: `PATRON|TIPO_MATCH|CONCEPTO_DESTINO|PRIORIDAD|TIPO_DATOS`

- `PATRON`: Texto a buscar
- `TIPO_MATCH`: `startsWith`, `contains`, o `exact`
- `CONCEPTO_DESTINO`: Concepto final
- `PRIORIDAD`: Número (menor = mayor prioridad)
- `TIPO_DATOS`: `apk`, `gg`, o `both`

## Ejemplos de Uso

### Ejemplo 1: Nóminas de Granjas

**Registro de entrada**:
- Proveedor: "GRANJAS NOM SEM 39 DEL 25 SEPT AL 01 DE OCT 2025"
- Cuenta: "133-001-000-000-00 | PRODUCCION DE CERDOS"

**Mapeo configurado**:
- Patrón: "GRANJAS"
- Tipo: `Empieza con`
- Destino: "SUELDOS GJAS"

**Resultado**: El concepto se asigna como "SUELDOS GJAS" (mapeo por texto tiene prioridad)

### Ejemplo 2: Personal Administrativo

**Registro de entrada**:
- Proveedor: "ADMINISTRATIVOS NOM DEL 01 AL 15 DE OCTUBRE 2025"
- Cuenta: "133-002-000-000-00 | GASTOS ADMINISTRATIVOS"

**Mapeo configurado**:
- Patrón: "ADMIN"
- Tipo: `Empieza con`
- Destino: "SUELDOS ADM"

**Resultado**: El concepto se asigna como "SUELDOS ADM"

### Ejemplo 3: Sin Mapeo por Texto

**Registro de entrada**:
- Proveedor: "MATERIALES CONSTRUCCION SA DE CV"
- Cuenta: "133-005-000-000-00 | MATERIALES Y SUMINISTROS"
- Mapeo por código "005" configurado: "MATERIALES"

**Resultado**: Como no hay mapeo por texto que coincida, se usa el mapeo por código → "MATERIALES"

## Gestión de Prioridades

Si tienes múltiples mapeos que podrían coincidir, el sistema usa el campo **Prioridad** para determinar cuál aplicar:

```
GRANJAS|startsWith|SUELDOS GJAS|1|apk
GRANJAS NOM|startsWith|NOMINAS ESPECIALES|2|apk
```

Con el concepto "GRANJAS NOM SEM 39...", ambos patrones coinciden, pero se aplicará "SUELDOS GJAS" porque tiene prioridad 1 (menor número = mayor prioridad).

## Almacenamiento

Los mapeos se guardan en `localStorage` con la clave `textConceptMappings` y persisten entre sesiones del navegador.

## Exportar/Importar

- **Exportar**: Crea un archivo `.txt` con todos los mapeos configurados
- **Importar**: Carga mapeos desde un archivo `.txt` (reemplaza los existentes)
