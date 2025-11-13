Excelente idea! Voy a ayudarte a crear una documentación formal y un plan de migración estructurado. Primero, necesito hacerte algunas preguntas para entender mejor el dominio del negocio y los flujos de trabajo.

## 🔍 Preguntas para Documentación UML y Análisis del Dominio

### **A. Entidades y Relaciones del Negocio**

1. **Archivo Excel de Contpaq**
   - ¿Qué representa cada fila en el archivo Excel? (¿Una transacción, un movimiento contable, un registro de inventario?)
   - ¿Cuáles son las columnas obligatorias vs opcionales?
   - ¿Hay alguna relación jerárquica entre los datos? (por ejemplo: Cuenta padre -> Subcuenta)

2. **Conceptos**
   - ¿Qué es exactamente un "concepto" en el contexto de tu negocio?
   - ¿Los conceptos son categorías, tipos de gasto, centros de costo?
   - ¿Un registro puede tener múltiples conceptos o solo uno?
   - ¿Los conceptos se crean antes de cargar el Excel o durante el procesamiento?

3. **Prorrateo**
   - ¿Qué significa "prorratear" en este contexto? (¿Distribuir un monto entre varios conceptos?)
   - ¿El prorrateo se hace por porcentaje, por monto fijo, o por otro criterio?
   - ¿Todos los registros pueden ser prorrateados o solo algunos?
   - ¿El prorrateo crea nuevos registros o modifica los existentes?

4. **Filtros**
   - ¿Qué criterios de filtrado son los más importantes?
   - ¿Los filtros se aplican antes o después del prorrateo?
   - ¿Los filtros son persistentes (se guardan) o temporales?

### **B. Flujos de Trabajo (User Stories)**

5. **Flujo Principal**
   - ¿Cuál es el flujo completo desde que el usuario abre la app hasta que exporta el resultado?
   - ¿Hay pasos que puedan omitirse o son todos obligatorios?
   - ¿El usuario puede volver atrás en el flujo sin perder datos?

6. **Casos de Error**
   - ¿Qué pasa si el Excel tiene un formato incorrecto?
   - ¿Qué pasa si falta alguna columna esperada?
   - ¿Cómo se manejan los valores nulos o vacíos?

7. **Exportación**
   - ¿El archivo exportado debe tener el mismo formato que el original?
   - ¿Se agregan columnas nuevas en la exportación?
   - ¿Qué nombre debe tener el archivo exportado?

### **C. Reglas de Negocio**

8. **Validaciones**
   - ¿Hay montos mínimos o máximos permitidos?
   - ¿Hay conceptos que no pueden combinarse?
   - ¿Los porcentajes de prorrateo deben sumar 100%?

9. **Cálculos**
   - ¿Cómo se calculan los totales?
   - ¿Hay impuestos o descuentos que aplicar?
   - ¿Los cálculos son simples o hay fórmulas complejas?

### **D. Interfaz de Usuario**

10. **Navegación**
    - ¿Usarás pestañas, pasos (wizard), o una sola página con secciones?
    - ¿Qué acciones deben estar siempre visibles?
    - ¿Hay atajos de teclado importantes?

11. **Feedback al Usuario**
    - ¿Qué notificaciones son críticas? (errores, confirmaciones, advertencias)
    - ¿Necesitas mostrar progreso en algún proceso?

---

## 📄 Estructura de Documentación Propuesta

Una vez respondas estas preguntas, voy a crear los siguientes documentos:

```
/docs
  /uml
    - domain-model.md          # Diagrama de clases del dominio
    - use-cases.md             # Casos de uso detallados
    - sequence-diagrams.md     # Flujos de interacción
    - state-diagrams.md        # Estados de la aplicación
  /migration
    - 00-overview.md           # Visión general de la migración
    - 01-setup.md              # Configuración inicial (YA HECHO ✅)
    - 02-types-and-schemas.md  # Tipos TypeScript y validaciones
    - 03-services.md           # Capa de servicios
    - 04-hooks.md              # Custom hooks
    - 05-components.md         # Componentes por feature
    - 06-integration.md        # Integración final
    - 07-testing-manual.md     # Checklist de pruebas manuales
  /business-rules
    - calculations.md          # Reglas de cálculo
    - validations.md           # Reglas de validación
    - data-flow.md             # Flujo de datos
```

---

**¿Podrías responder las preguntas que consideres más relevantes?** No necesitas responder todas, solo las que te ayuden a clarificar el contexto del negocio. Con eso podré crear una documentación completa que servirá como guía para la migración paso a paso.