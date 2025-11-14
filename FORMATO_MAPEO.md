# 📋 Formato de Archivo para Importar Mapeos de Conceptos

## Estructura del Archivo

El archivo `.txt` debe tener el siguiente formato en cada línea:

```
CODIGO|TEXTO_ORIGEN|CONCEPTO_DESTINO
```

### Campos:

1. **CODIGO**: El segundo número del código de cuenta (ej: `001`, `002`, `037`)
2. **TEXTO_ORIGEN**: (Opcional) Texto que aparece en el Excel
3. **CONCEPTO_DESTINO**: El concepto al que se mapeará

## Ejemplos

### Formato Completo:
```
001|PRODUCCION DE CERDOS EN PROCESO|ALIMENTO
002|COMPRA DE LECHONES|LECHONES
037|GASTOS VARIOS DE OPERACION|VARIOS
018|COMBUSTIBLES Y LUBRICANTES|DIESEL
025|EQUIPO DE TRANSPORTE|EQ. TRANSPORTE
```

### Formato Simplificado (sin texto origen):
```
001||ALIMENTO
002||LECHONES
037||VARIOS
018||DIESEL
025||EQ. TRANSPORTE
```

## Cómo Funciona

1. Al procesar un archivo Excel, el sistema detecta códigos como: `133-001-000-000-00`
2. Extrae el segundo número: `001`
3. Busca en los mapeos configurados
4. Si encuentra match, asigna el concepto destino
5. Si NO encuentra match, usa el texto original del Excel

## Ejemplo de Código de Cuenta

```
133-001-000-000-00
 │   │
 │   └── CODIGO para mapeo (001)
 └────── Tipo: 133 = APK, otros = GG
```

## Importar en la Aplicación

1. Ve a la pestaña "Mapeo"
2. Haz clic en "Importar"
3. Selecciona tu archivo `.txt`
4. Los mapeos se cargarán automáticamente

## Ejemplo de Archivo Completo

```txt
001|PRODUCCION DE CERDOS EN PROCESO|ALIMENTO
002|COMPRA DE ANIMALES|LECHONES
003|CONSTRUCCIONES EN PROCESO|OBRA CIVIL
004|SUELDOS Y SALARIOS GRANJAS|SUELDOS GJAS
005|SUELDOS Y SALARIOS ADMINISTRACION|SUELDOS ADMON
006|MEDICAMENTOS|MEDICINA
007|VACUNAS Y BIOLOGICOS|VACUNA
008|GASOLINA Y LUBRICANTES|GASOLINA
009|ARRENDAMIENTOS|RENTA
010|GASTOS DIVERSOS|VARIOS
011|VEHICULOS Y EQUIPO|EQ. TRANSPORTE
012|ENERGIA ELECTRICA|ENERGICA ELECTRICA
013|DIESEL|DIESEL
014|SERVICIOS DE LIMPIEZA|LIMPIEZA
015|GAS|GAS
016|UNIFORMES Y CALZADO|UNIFORMES Y BOTAS
```

## Notas Importantes

- El sistema es case-sensitive para el código
- Los conceptos destino deben existir previamente en la sección "Conceptos"
- Si subes un archivo con códigos duplicados, se sobrescribirán
- Puedes editar mapeos individuales después de importar
