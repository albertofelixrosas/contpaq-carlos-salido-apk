## 🔍 Preguntas para Documentación UML y Análisis del Dominio

### **📊 ANÁLISIS DEL ARCHIVO EXCEL DETECTADO**

**Estructura identificada:**
- Total de registros de movimiento: ~131
- Cuentas contables: 14 (formato: XXX-XXX-XXX-XXX-XX)
- Segmentos únicos: 4 (19, 20, 21, 22 - representan vueltas/lotes de producción)
- Columnas de datos: Fecha, Tipo, Número, Concepto, Ref, Cargos, Abonos, Saldo

**Ejemplo de jerarquía detectada:**
```
133-000-000-000-00 (PRODUCCION DE CERDOS EN PROCESO)
  └─ 133-020-000-000-00 (OBRA CIVIL)
       └─ Segmento: 19 EPK2-42.2
            └─ 03/Oct/2025 | Egresos | 308 | ULLOA HIGUERA NORA ALICIA | F/3535 | $4,250
```

---

### **A. Entidades y Relaciones del Negocio**

#### 1. **Cuentas Contables y Subcuentas**
   - ✅ Entiendo que hay una jerarquía: `133-000` (padre) → `133-020` (subcuenta OBRA CIVIL)
   - ¿Las subcuentas siempre empiezan con el mismo prefijo `133-`?
   Si
   - ¿El segundo número (020, 023, 024, etc.) determina el tipo de gasto?
   Si
   - ¿Necesitas procesar todas las subcuentas o solo algunas específicas?
   Todas

#### 2. **Segmentos/Vueltas (EPK2-42.2, EPK2-43, etc.)**
   - Veo que los segmentos representan lotes de producción (vueltas de cerdos)
   Estas en lo correcto
   - ¿Cada número (19, 20, 21, 22) es una vuelta diferente?
   Si
   - ¿El formato "EPK2-XX.X" tiene algún significado (ubicación, tipo de granja)?
   Algo así, si tiene significado pero no es relevante para el programa. Para aclarar, simplemente en caso de ser diferentes a pesar de que "comiencen igual", deben de ser tratados como diferentes veultas.
   - ¿Los segmentos pueden cambiar entre archivos o son siempre similares?
   Siempre son similares

#### 3. **Conceptos (OBRA CIVIL, DIESEL, VARIOS, etc.)**
   - Veo que tu código actual convierte proveedores en conceptos (ej: "ULLOA HIGUERA" → "OBRA CIVIL")
   Si, lo que pasa es que es una re-clasificación, pues para la funcionalidad final, que es poder identificar los gastos, lo que interesa es a que tipo de gastos pertenece, y no el origen del gasto. Pero sí, es lo que el usuario hace manualmente en un excel.
   - ¿Los conceptos son categorías de gasto predefinidas?
   Si, exactamente eso
   - ¿Cuántos conceptos diferentes manejas? (vi: OBRA CIVIL, DIESEL, EQ. TRANSPORTE, VARIOS, GASOLINA, ADMON SUELDOS, DEPRECIACIONES, SUELDOS Y SALARIOS)
   ALIMENTO,LECHONES,OBRA CIVIL,SUELDOS GJAS,SUELDOS ADMON,MEDICINA,VACUNA,GASOLINA,RENTA,VARIOS,EQ. TRANSPORTE,ENERGICA ELECTRICA,DIESEL,LIMPIEZA,GAS,UNIFORMES Y BOTAS
   - ¿Los conceptos se asignan automáticamente según reglas o manualmente?
   Ambas. Es que se tiene un criterio global, pero si un movimiento no cumple o se encuentra fuera de los criterios, no se altera de manera automatica, sino que se tiene que revisar manualmente.

#### 4. **Tipos de Datos APK vs GG**
   - ¿Qué diferencia hay entre un archivo APK y un archivo GG?
   Los archivos tienen gastos que quedaron por fuera, es decir, lo que se tienen que dividir entre las granjas, y se consideran a parte. Pero la estructura de los archivos es practicamente identica.
   - ¿Son estructuras de Excel idénticas pero con diferentes reglas de negocio?
   Si
   - ¿GG significa "Gastos Generales"?
   Si

### **B. Flujos de Trabajo (User Stories)**

5. **Flujo Principal**
   - ¿Cuál es el flujo completo desde que el usuario abre la app hasta que exporta el resultado?
   Primero, el usuario sube el archivo y lo "procesa" con el programa. El usuario analiza que movimientos deben de cambiar de concepto manualmente y tras finalizar su analisis y sustitución de conceptos es cuando finalmente "exporta" el resultado, pero la exportación por ahora es simplemente un texto plano con formato para que encaje con su formato de su excel con el que actualmente trabaja.
   - ¿Hay pasos que puedan omitirse o son todos obligatorios?
   Son todos obligatorios
   - ¿El usuario puede volver atrás en el flujo sin perder datos?
   Creo que sería una mejora muy buena implementar un historico de cambios, pero por ahora si se equivoca tiene que hacer el proceso desde el principio (y actualmente borrar los datos se hace mediante las herramientas de desarrollador y no mediante la interfaz de usuario)

6. **Casos de Error**
   - ¿Qué pasa si el Excel tiene un formato incorrecto?
   No se procede, y se tiene que indicar al usuario que el archivo que subio no es valido
   - ¿Qué pasa si falta alguna columna esperada?
   No se procede, y se tiene que indicar al usuario que el archivo que subio no es valido
   - ¿Cómo se manejan los valores nulos o vacíos?
   Actualmente se dejan como nulos, pero al momento de hacer la suma de los cargos, se consideran como si fuese un valor de 0

7. **Exportación**
   - ¿El archivo exportado debe tener el mismo formato que el original?
   Para nada, tiene que ser una tabla con un formato que es comodo para el usuario visualizar y de paso tambien, copiar mediante una funcionalidad de un botón
   - ¿Se agregan columnas nuevas en la exportación?
   No
   - ¿Qué nombre debe tener el archivo exportado?
   Debería de haber un nombre generico que se cree a partir del tipo de archivo procesado y la fecha actual (se maneja por periodos de meses)

### **C. Reglas de Negocio**

8. **Validaciones**
   - ¿Hay montos mínimos o máximos permitidos?
   No, incluso pueden haber monton negativos 
   - ¿Hay conceptos que no pueden combinarse?
   Cada movimiento tiene exactamente un solo concepto asociado, el usuario decide cual será
   - ¿Los porcentajes de prorrateo deben sumar 100%?
   Si, en teoría debería ser exacto o en todo caso una aproximación

9. **Cálculos**
   - ¿Cómo se calculan los totales?
   A base de sumar los movimientos que pertenezcan al mismo concepto y rango de fechas asociadas al periodo que se esta analizando / calculando
   - ¿Hay impuestos o descuentos que aplicar?
   No
   - ¿Los cálculos son simples o hay fórmulas complejas?
   Son simples, por lo regular solo sumas o en todo caso para la división de gastos generales una regla de tres

### **D. Interfaz de Usuario**

10. **Navegación**
    - ¿Usarás pestañas, pasos (wizard), o una sola página con secciones?
    Creo que si deberían de existir pestañas, pues hay más de una sección y creo que en una sola pagina no se alcanzarían a mostrar todas comodamente.
    - ¿Qué acciones deben estar siempre visibles?
    Donde se muestre el total absoluto de los cargos, algunos botones que sean un hipervinculo para ser dirigido a una sección de interes y algun componente que muestre si ya se cargaron los dos archivos fundamentales (para que así se proceda con la división de gastos)
    - ¿Hay atajos de teclado importantes?
    No

11. **Feedback al Usuario**
    - ¿Qué notificaciones son críticas? (errores, confirmaciones, advertencias)
    Confirmaciones y erroes solamente
    - ¿Necesitas mostrar progreso en algún proceso?
    No, todo debería de ser casi inmediato pues son archivos excel que pesan muy poco
