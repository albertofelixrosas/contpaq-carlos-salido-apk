// ========================================
// SELECCIÓN DE ELEMENTOS DEL DOM
// ========================================

const uploadForm = document.querySelector("#uploadForm")
const fileInput = document.querySelector("#fileInput")
const fileName = document.querySelector("#fileName")
const tableSection = document.querySelector("#tableSection")
const resultTable = document.querySelector("#resultTable")
const copyBtn = document.querySelector("#copyBtn")
const modal = document.querySelector("#modal")
const modalMessage = document.querySelector("#modalMessage")
const closeModalBtn = document.querySelector("#closeModal")
const toast = document.querySelector("#toast")
const segmentEditor = document.querySelector("#segmentEditor")
const noDataComponent = document.querySelector("#noData")
const radioOptions = document.querySelector("#radioOptions")

// Elementos del componente de conceptos
const conceptInput = document.querySelector("#conceptInput")
const addConceptBtn = document.querySelector("#addConceptBtn")
const clearAllConceptsBtn = document.querySelector("#clearAllConceptsBtn")
const conceptsList = document.querySelector("#conceptsList")
const conceptsCounter = document.querySelector("#conceptsCounter")

// Elementos del carrusel de verificación
const verifyBtn = document.querySelector("#verifyBtn")
const verifyCarousel = document.querySelector("#verifyCarousel")
const closeCarouselBtn = document.querySelector("#closeCarousel")
const currentIndexSpan = document.querySelector("#currentIndex")
const totalRecordsSpan = document.querySelector("#totalRecords")
const dataFecha = document.querySelector("#dataFecha")
const dataProveedor = document.querySelector("#dataProveedor")
const dataFactura = document.querySelector("#dataFactura")
const dataConcepto = document.querySelector("#dataConcepto")
const dataVuelta = document.querySelector("#dataVuelta")
const conceptSelect = document.querySelector("#conceptSelect")
const prevRecordBtn = document.querySelector("#prevRecord")
const nextRecordBtn = document.querySelector("#nextRecord")
const changeConceptBtn = document.querySelector("#changeConceptBtn")
const skipRecordBtn = document.querySelector("#skipRecord")

// Variables del carrusel
let currentRecordIndex = 0
let apkDataArray = []
let ggDataArray = []

// Elementos del componente de sustitución masiva
const massReplacementManager = document.querySelector("#massReplacementManager")
const currentDataType = document.querySelector("#currentDataType")
const totalRecordsCount = document.querySelector("#totalRecordsCount")
const conceptsCheckboxList = document.querySelector("#conceptsCheckboxList")
const selectAllConceptsBtn = document.querySelector("#selectAllConcepts")
const clearAllSelectionBtn = document.querySelector("#clearAllSelection")
const targetConceptSelect = document.querySelector("#targetConceptSelect")
const replacementSummary = document.querySelector("#replacementSummary")
const previewReplacementBtn = document.querySelector("#previewReplacementBtn")
const executeReplacementBtn = document.querySelector("#executeReplacementBtn")

// Elementos del estado de tabla
const tableTitle = document.querySelector("#tableTitle")
const tableDescription = document.querySelector("#tableDescription")
const tableActions = document.querySelector("#tableActions")
const emptyTableState = document.querySelector("#emptyTableState")
const currentTableType = document.querySelector("#currentTableType")

// Elementos del panel flotante de tipo de datos
const dataTypeSelector = document.querySelector("#dataTypeSelector")

// Elementos de los filtros de tabla
const tableFilters = document.querySelector("#tableFilters")
const clearFiltersBtn = document.querySelector("#clearFiltersBtn")
const proveedorFilter = document.querySelector("#proveedorFilter")
const conceptoFilter = document.querySelector("#conceptoFilter")
const vueltaFilter = document.querySelector("#vueltaFilter")
const vueltaFilterContainer = document.querySelector("#vueltaFilterContainer")
const filterResultsCount = document.querySelector("#filterResultsCount")

// Elementos de totales de tabla
const tableTotals = document.querySelector("#tableTotals")
const totalGeneral = document.querySelector("#totalGeneral")
const totalFiltrado = document.querySelector("#totalFiltrado")
const prorrateoTotals = document.querySelector("#prorrateoTotals")
const totalProrrateo = document.querySelector("#totalProrrateo")

// Elementos del componente de prorrateo
const confirmProrrateoBtn = document.querySelector("#confirmProrrateoBtn")
const prorrateoSection = document.querySelector("#prorrateoSection")
const generateProrrateoBtn = document.querySelector("#generateProrrateoBtn")
const copyProrrateoBtn = document.querySelector("#copyProrrateoBtn")
const downloadProrrateoBtn = document.querySelector("#downloadProrrateoBtn")
const prorrateoTable = document.querySelector("#prorrateoTable")
const emptyProrrateoState = document.querySelector("#emptyProrrateoState")
const conceptsCount = document.querySelector("#conceptsCount")
const vueltasCount = document.querySelector("#vueltasCount")
const totalCerdos = document.querySelector("#totalCerdos")
const registrosGenerados = document.querySelector("#registrosGenerados")

// ========================================
// EVENTOS
// ========================================


// =======================================
// REGEX
// =======================================

const accountNumberRegex = /^\d{3}-\d{3}-\d{3}-\d{3}-\d{2}$/
const excelCommonDateRegex =
  /^([0-2]?\d|3[01])\/(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)\/\d{4}\s?$/

// Evento: Mostrar nombre del archivo seleccionado
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    fileName.textContent = `Archivo seleccionado: ${file.name}`
  } else {
    fileName.textContent = ""
  }
})

// Evento: Envío del formulario
uploadForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const file = fileInput.files[0]

  if (!file) {
    showModal("No fue posible procesar el archivo")
    return
  }

  // Mostrar modal de procesamiento
  showModal("Procesando archivo...")

  // Dependiendo del valor del checkbox, se puede llamar a diferentes funciones (radioOptions)
  const selectedOption = document.querySelector('input[name="step"]:checked').value
  console.log("Opción seleccionada:", selectedOption)
  if (selectedOption === "apk") {
    // Lógica para APK's (si es necesario)
    generateResultsTableForAPK()
      .then(() => {
        // Mostrar sección de tabla
        tableSection.classList.remove("hidden")
        showModal("Procesamiento exitoso")
      })
      .catch((error) => {
        showModal("No fue posible procesar el archivo: " + error)
      })
  } else if (selectedOption === "gg") {
    // Lógica para GG's (si es necesario)
    generateResultsTableForGG()
      .then(() => {
        // Mostrar sección de tabla
        tableSection.classList.remove("hidden")
        showModal("Procesamiento exitoso")
      })
      .catch((error) => {
        showModal("No fue posible procesar el archivo: " + error)
      })
  }


})

// Evento: Cerrar modal
closeModalBtn.addEventListener("click", () => {
  hideModal()
})

// Evento: Cerrar modal al hacer clic en el overlay
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.classList.contains("modal-overlay")) {
    hideModal()
  }
})

// Evento: Copiar tabla al portapapeles
copyBtn.addEventListener("click", () => {
  copyTableToClipboard()
})

// Evento mostrar el componente de edición de segmentos si hay datos en localStorage
document.addEventListener("DOMContentLoaded", () => {
  initializeConceptsManager()
  updateMassReplacementVisibility()
  initializeTableDisplay()
  initializeCollapsibleComponents()
  restoreCollapseStates()
  updateConfirmProrrateoButton()
})

// Eventos del componente de conceptos
addConceptBtn.addEventListener("click", () => {
  addConcept()
})

conceptInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    addConcept()
  }
})

conceptInput.addEventListener("input", () => {
  validateConceptInput()
})

clearAllConceptsBtn.addEventListener("click", () => {
  showConfirmDialog("¿Estás seguro de que quieres eliminar todos los conceptos?", () => {
    clearAllConcepts()
  })
})

// Eventos del carrusel de verificación
verifyBtn.addEventListener("click", () => {
  openVerifyCarousel()
})

closeCarouselBtn.addEventListener("click", () => {
  // Verificar si estamos en modo individual o carrusel
  if (currentIndividualRecord) {
    closeIndividualRecordModal()
  } else {
    closeVerifyCarousel()
  }
})

verifyCarousel.addEventListener("click", (e) => {
  if (e.target === verifyCarousel || e.target.classList.contains("carousel-overlay")) {
    // Verificar si estamos en modo individual o carrusel
    if (currentIndividualRecord) {
      closeIndividualRecordModal()
    } else {
      closeVerifyCarousel()
    }
  }
})

prevRecordBtn.addEventListener("click", () => {
  navigateRecord(-1)
})

nextRecordBtn.addEventListener("click", () => {
  navigateRecord(1)
})

changeConceptBtn.addEventListener("click", () => {
  changeRecordConcept()
})

skipRecordBtn.addEventListener("click", () => {
  navigateRecord(1)
})

conceptSelect.addEventListener("change", () => {
  validateChangeButton()
  validateIndividualChangeButton() // También validar para modal individual
})

// Eventos de teclado para el carrusel
document.addEventListener("keydown", (e) => {
  if (!verifyCarousel.classList.contains("hidden")) {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault()
        navigateRecord(-1)
        break
      case "ArrowRight":
        e.preventDefault()
        navigateRecord(1)
        break
      case "Enter":
        e.preventDefault()
        if (!changeConceptBtn.disabled) {
          changeRecordConcept()
        }
        break
      case "Escape":
        e.preventDefault()
        closeVerifyCarousel()
        break
    }
  }
})

// Evento para actualizar la visibilidad del componente de edición de segmentos cuando se actualice el localStorage
updateSegmentEditorVisibility()

// Eventos del componente de sustitución masiva
selectAllConceptsBtn.addEventListener("click", () => {
  selectAllConcepts()
})

clearAllSelectionBtn.addEventListener("click", () => {
  clearAllConceptSelection()
})

targetConceptSelect.addEventListener("change", () => {
  updateReplacementSummary()
})

previewReplacementBtn.addEventListener("click", () => {
  previewMassReplacement()
})

executeReplacementBtn.addEventListener("click", () => {
  executeMassReplacement()
})

// Eventos para cambios en los radio buttons
document.querySelectorAll('input[name="step"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updateMassReplacementVisibility()
    updateTableDisplay()
  })
})

// Eventos de los filtros de tabla
proveedorFilter.addEventListener('input', () => {
  applyTableFilters()
})

conceptoFilter.addEventListener('change', () => {
  applyTableFilters()
})

vueltaFilter.addEventListener('change', () => {
  applyTableFilters()
})

clearFiltersBtn.addEventListener('click', () => {
  clearAllTableFilters()
})

// Eventos del componente de prorrateo
confirmProrrateoBtn.addEventListener('click', () => {
  showProrrateoSection()
})

generateProrrateoBtn.addEventListener('click', () => {
  generateProrrateoData()
})

copyProrrateoBtn.addEventListener('click', () => {
  copyProrrateoToClipboard()
})

downloadProrrateoBtn.addEventListener('click', () => {
  downloadProrrateoAsExcel()
})



// ========================================
// FUNCIONES DE MODAL
// ========================================

/**
 * Muestra el modal con un mensaje específico
 * @param {string} message - Mensaje a mostrar en el modal
 */
function showModal(message) {
  // Detectar si el mensaje contiene HTML
  if (message.includes('<') && message.includes('>')) {
    modalMessage.innerHTML = message
  } else {
    modalMessage.textContent = message
  }
  modal.classList.remove("hidden")
}

/**
 * Oculta el modal
 */
function hideModal() {
  modal.classList.add("hidden")
}

// ========================================
// FUNCIONES DE MANEJO DE ESTRUCTURA DE DATOS
// ========================================

/**
 * Inicializa la estructura de datos para APK
 * @returns {Object} Estructura de datos inicializada
 */
function initializeProcessData() {
  return {
    data: [],
    segments: [],
    gg: [],
    prorrateo: []
  };
}

/**
 * Obtiene los datos de APK desde localStorage
 * @returns {Object} Datos del proceso
 */
function getProcessData() {
  const stored = localStorage.getItem('apk');
  return stored ? JSON.parse(stored) : initializeProcessData();
}

/**
 * Guarda los datos de APK en localStorage
 * @param {Object} data - Datos a guardar
 */
function saveProcessData(data) {
  localStorage.setItem('apk', JSON.stringify(data));
}

/**
 * Formatea un valor numérico como moneda mexicana
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Valor formateado como moneda
 */
function formatCurrency(value) {
  const numberFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const numericValue = parseFloat(value) || 0;
  return numberFormatter.format(numericValue);
}

/**
 * Calcula y actualiza los totales de la tabla principal
 * @param {Array<Object>} allData - Todos los datos de la tabla
 * @param {Array<Object>} filteredData - Datos filtrados actualmente visibles
 */
function updateTableTotals(allData, filteredData) {
  if (!tableTotals || !totalGeneral || !totalFiltrado) return;

  const numberFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  // Calcular total general
  const totalGeneralValue = allData.reduce((sum, record) => {
    const importe = parseFloat(record.importe) || 0;
    return sum + importe;
  }, 0);

  // Calcular total filtrado
  const totalFiltradoValue = filteredData.reduce((sum, record) => {
    const importe = parseFloat(record.importe) || 0;
    return sum + importe;
  }, 0);

  // Actualizar elementos del DOM
  totalGeneral.textContent = numberFormatter.format(totalGeneralValue);
  totalFiltrado.textContent = numberFormatter.format(totalFiltradoValue);

  // Mostrar la sección de totales si hay datos
  if (allData.length > 0) {
    tableTotals.classList.remove("hidden");
  } else {
    tableTotals.classList.add("hidden");
  }
}

/**
 * Calcula y actualiza el total de la tabla de prorrateo
 * @param {Array<Object>} prorrateoData - Datos del prorrateo
 */
function updateProrrateoTotals(prorrateoData) {
  if (!prorrateoTotals || !totalProrrateo) return;

  const numberFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  // Calcular total del prorrateo
  const totalProrrateoValue = prorrateoData.reduce((sum, record) => {
    const importe = parseFloat(record.importe) || 0;
    return sum + importe;
  }, 0);

  // Actualizar elemento del DOM
  totalProrrateo.textContent = numberFormatter.format(totalProrrateoValue);

  // Mostrar la sección de totales si hay datos
  if (prorrateoData.length > 0) {
    prorrateoTotals.classList.remove("hidden");
  } else {
    prorrateoTotals.classList.add("hidden");
  }
}

// ========================================
// FUNCIONES DE TABLA - ARQUITECTURA MODULAR
// ========================================

/*
GUÍA DE ARQUITECTURA REFACTORIZADA:

Esta sección ha sido refactorizada para separar responsabilidades y hacer el código más modular.
La nueva arquitectura está dividida en las siguientes capas:

1. PROCESAMIENTO DE DATOS:
   - processApkDataFromExcel(rawData) → Procesa datos raw de Excel y retorna objetos APK
   - processGgDataFromExcel(rawData) → Procesa datos raw de Excel y retorna objetos GG
   - getProcessedDataFromStorage(dataType) → Obtiene datos procesados de localStorage

2. GENERACIÓN DE UI/TABLA:
   - createTableHeader(headers) → Crea elemento thead con encabezados
   - createApkTableBody(data) → Crea tbody específico para datos APK
   - createGgTableBody(data) → Crea tbody específico para datos GG
   - createGenericTableBody(data) → Crea tbody genérico para cualquier estructura
   - clearAndSetupTable(element, headers) → Limpia tabla y establece encabezados

3. GESTIÓN DE ALMACENAMIENTO:
   - saveApkDataToLocalStorage(data, segments) → Guarda datos APK en localStorage
   - saveGgDataToLocalStorage(data) → Guarda datos GG en localStorage

4. FUNCIONES DE UTILIDAD:
   - getHeadersForDataType(type) → Obtiene encabezados según tipo de datos
   - generateTableFromProcessedData() → Función genérica para generar tablas

5. FUNCIONES PRINCIPALES (ORQUESTADORAS):
   - processExcelAndGenerateTable() → Función principal que integra todo el proceso
   - generateResultsTableForAPK() → Función simplificada para APK
   - generateResultsTableForGG() → Función simplificada para GG

VENTAJAS DE LA NUEVA ARQUITECTURA:
- ✅ Separación de responsabilidades (procesamiento vs renderizado)
- ✅ Funciones reutilizables para nuevas funcionalidades
- ✅ Fácil testing individual de cada capa
- ✅ Extensibilidad para nuevos tipos de datos
- ✅ Código más limpio y mantenible

PARA NUEVAS FUNCIONALIDADES:
1. Crear nueva función de procesamiento: processNewTypeDataFromExcel()
2. Crear función específica de tbody si es necesario
3. Usar generateTableFromProcessedData() para renderizar
4. Usar getProcessedDataFromStorage() para obtener datos existentes
*/

/**
 * Crea y retorna el elemento thead con los encabezados especificados
 * @param {Array<string>} headers - Array de strings con los nombres de los encabezados
 * @param {string} dataType - Tipo de datos para configurar ordenamiento
 * @returns {HTMLTableSectionElement} - Elemento thead con los encabezados
 */
function createTableHeader(headers, dataType = 'apk') {
  const thead = document.createElement("thead")
  const headerRow = document.createElement("tr")

  // Campos que permiten ordenamiento
  const sortableFields = ['Fecha', 'Proveedor', 'Importe', 'Concepto']

  headers.forEach((header, index) => {
    const th = document.createElement("th")

    if (sortableFields.includes(header)) {
      // Hacer la cabecera clickeable
      th.classList.add('sortable-header')
      th.textContent = header

      // Agregar evento de click para ordenamiento
      th.addEventListener('click', handleHeaderClick)

      // Agregar atributos data para identificar el campo y tipo
      th.setAttribute('data-field', header)
      th.setAttribute('data-type', dataType)
    } else {
      th.textContent = header
      th.classList.add('non-sortable-header')
    }

    headerRow.appendChild(th)
  })

  thead.appendChild(headerRow)
  return thead
}

/**
 * Limpia la tabla y establece los encabezados
 * @param {HTMLTableElement} tableElement - Elemento de tabla a limpiar
 * @param {Array<string>} headers - Array de encabezados
 * @param {string} dataType - Tipo de datos para configurar ordenamiento
 */
function clearAndSetupTable(tableElement, headers, dataType = 'apk') {
  // Limpiar tabla existente
  tableElement.innerHTML = ""

  // Crear y agregar encabezados
  const thead = createTableHeader(headers, dataType)
  tableElement.appendChild(thead)
}

/**
 * Obtiene los encabezados correspondientes según el tipo de datos
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 * @returns {Array<string>} - Array de encabezados
 */
function getHeadersForDataType(dataType) {
  const idHeader = ["ID"]
  const baseHeaders = ["Fecha", "Egresos", "Folio", "Proveedor", "Factura", "Importe", "Concepto"]
  const typeSpecificHeader = dataType === "apk" ? "Vuelta" : "Segmento"
  const endHeaders = ["Mes", "Año"]

  return [...idHeader, ...baseHeaders, typeSpecificHeader, ...endHeaders]
}

/**
 * Procesa un archivo Excel y genera la tabla resultante para datos APK (Refactorizada)
 */
async function generateResultsTableForAPK() {
  try {
    await processExcelAndGenerateTable(fileInput.files[0], "apk", resultTable)
    // Actualizar visualización de tabla
    updateTableDisplay()
  } catch (error) {
    console.error("Error generando tabla APK:", error)
    showModal("Error al procesar el archivo APK")
  }
}

/**
 * Procesa un archivo Excel y genera la tabla resultante para datos GG (Refactorizada)
 */
async function generateResultsTableForGG() {
  try {
    await processExcelAndGenerateTable(fileInput.files[0], "gg", resultTable)
    // Actualizar visualización de tabla
    updateTableDisplay()
  } catch (error) {
    console.error("Error generando tabla GG:", error)
    showModal("Error al procesar el archivo GG")
  }
}

/**
 * Función genérica para generar tablas con datos procesados
 * @param {HTMLTableElement} tableElement - Elemento de tabla donde renderizar
 * @param {Array<Object>} processedData - Datos ya procesados
 * @param {Array<string>} headers - Encabezados de la tabla
 * @param {string} dataType - Tipo de datos para identificar el procesamiento
 */
function generateTableFromProcessedData(tableElement, processedData, headers, dataType) {
  try {
    // 1. Configurar tabla
    clearAndSetupTable(tableElement, headers, dataType)

    // 2. Crear cuerpo de tabla según el tipo
    let tbody
    if (dataType === "apk") {
      tbody = createApkTableBody(processedData)
    } else if (dataType === "gg") {
      tbody = createGgTableBody(processedData)
    } else {
      // Función genérica para otros tipos de datos
      tbody = createGenericTableBody(processedData)
    }

    // 3. Agregar cuerpo a la tabla
    tableElement.appendChild(tbody)

    // 4. Restaurar indicadores de ordenamiento si existen
    if (currentSortState.field && currentSortState.dataType === dataType) {
      updateSortIndicators(currentSortState.field, currentSortState.ascending)
    }

    // 5. Inicializar filtros con los nuevos datos
    initializeTableFilters(dataType, processedData)

    // 6. Actualizar totales de la tabla
    updateTableTotals(processedData, processedData)

  } catch (error) {
    console.error(`Error generando tabla ${dataType}:`, error)
    throw error
  }
}

/**
 * Crea un tbody genérico para cualquier tipo de datos estructurados
 * @param {Array<Object>} data - Datos estructurados
 * @returns {HTMLTableSectionElement} - Elemento tbody
 */
function createGenericTableBody(data) {
  const tbody = document.createElement("tbody")

  data.forEach((rowData) => {
    const tr = document.createElement("tr")
    Object.entries(rowData).forEach(([key, value]) => {
      const td = document.createElement("td")
      // Asegurar que siempre haya contenido, aunque sea vacío
      if (value !== null && value !== undefined) {
        // Aplicar formato de moneda si la columna contiene "importe"
        if (key.toLowerCase().includes('importe')) {
          td.textContent = formatCurrency(value)
        } else {
          td.textContent = String(value)
        }
      } else {
        td.textContent = ''
      }
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })

  return tbody
}

/**
 * Función principal que procesa archivo Excel y genera tabla completa
 * @param {File} file - Archivo Excel a procesar
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 * @param {HTMLTableElement} tableElement - Elemento de tabla donde renderizar
 */
async function processExcelAndGenerateTable(file, dataType, tableElement) {
  try {
    // 1. Procesar archivo Excel
    const rawData = await processExcelFile(file)

    // 2. Procesar datos según el tipo
    let processedResult
    if (dataType === "apk") {
      processedResult = processApkDataFromExcel(rawData)
      const accounts = generateAccountsData(rawData)
      console.log("Cuentas generadas para APK:")
      console.table(accounts)
      // Guardar en localStorage
      saveApkDataToLocalStorage(processedResult.processedData, processedResult.segmentNames)
      updateSegmentEditorVisibility()
      updateConfirmProrrateoButton()
    } else if (dataType === "gg") {
      processedResult = processGgDataFromExcel(rawData)
      const accounts = generateAccountsData(rawData)
      console.log("Cuentas generadas para las vueltas:")
      console.table(accounts)
      // Guardar en localStorage
      saveGgDataToLocalStorage(processedResult)
      updateConfirmProrrateoButton()
    } else {
      throw new Error(`Tipo de datos no soportado: ${dataType}`)
    }

    // 3. Generar tabla
    const headers = getHeadersForDataType(dataType)
    if (dataType === "apk") {
      generateTableFromProcessedData(tableElement, processedResult.processedData, headers, dataType)
    } else if (dataType === "gg") {
      generateTableFromProcessedData(tableElement, processedResult, headers, dataType)
    }

    // 4. Actualizar componente de sustitución masiva
    updateMassReplacementVisibility()

    if (dataType === "apk") {
      return processedResult.processedData
    } else {
      return processedResult
    }

  } catch (error) {
    console.error(`Error en processExcelAndGenerateTable para ${dataType}:`, error)
    throw error
  }
}

/**
 * Obtiene datos procesados de un tipo específico desde localStorage
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 * @returns {Array<Object>} - Datos procesados o array vacío si no existen
 */
function getProcessedDataFromStorage(dataType) {
  try {
    const processData = getProcessData();

    if (dataType === "apk") {
      return processData.data || [];
    } else if (dataType === "gg") {
      return processData.gg || [];
    }

    return [];
  } catch (error) {
    console.error(`Error obteniendo datos ${dataType} de localStorage:`, error);
    return [];
  }
}

/**
 * Procesa los datos raw de Excel y los convierte en datos APK estructurados
 * @param {string[][]} rawData - Datos raw de Excel
 * @returns {{ processedData: Array<Object>, segmentNames: Set<string> }} - Datos procesados y nombres de segmentos
 */
function processApkDataFromExcel(rawData) {
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = ""
  let currentSegmentName = ""
  const segmentNames = new Set()
  const apkData = []
  let recordId = 1  // ID auto-incremental comenzando en 1

  // Se lee las filas de principio a fin
  for (let i = 1; i < rawData.length; i++) {
    // Se obtiene la fila actual
    const row = rawData[i]
    // Se obtiene el valor de la primera columna
    const firstCell = String(row?.[0] || '').trim()

    // Se identifica el tipo de fila según el valor de la primera columna

    // 133-000-000-000-00	PRODUCCION DE CERDOS EN PROCESO
    // 1️⃣ Si la primera celda es un codigo de cuenta contable
    if (firstCell.match(accountNumberRegex)) {
      // La segunda celda es el nombre de la cuenta contable, y se guarda en la variable de estado
      currentAccountName = String(row?.[1] || '').trim()
    }
    // Segmento:  100 GG
    // 2️⃣ Si la primera celda empieza con "segmento"
    if (firstCell.toLowerCase().startsWith('segmento')) {
      // El nombre del segmento se encuentra despues de "Segmento:  " en esa misma celda

      // Quiero que despues de usar "split" y usar "filter", el orden de los elementos sea invertido
      currentSegmentName = firstCell.split(' ')
        .filter((_, index) => index > 2)
        .toReversed()
        .filter((_, index) => index === 0)
        .join(' ')
        .trim()
      // currentSegmentName = firstCell.split(' ').filter((_, index) => index > 2).join(' ').trim()
    }
    // 3️⃣ Si la primera celda es una fecha común de Excel
    if (firstCell.match(excelCommonDateRegex)) {
      // Se crea un objeto con los datos de la fila
      const rowObject = createObjectFromRow(row)

      // Quiero convertir el objeto a un nuevo objeto que incluya los valores actuales de segmento y cuenta contable
      // FECHA	EGRESOS	FOLIO	PROVEEDOR	FACTURA	 IMPORTE 	CONCEPTO	VUELTA	MES	AÑO

      const { monthString, year } = parseDateString(rowObject.fecha)

      // En caso de que un valor no exista, se asigna cadena vacía o 0
      // Se crea el nuevo objeto con la estructura deseada
      // ID auto-incremental, Fecha, Egresos, Folio, Proveedor, Factura, Importe, Concepto, Vuelta, Mes, Año
      const newRowObject = {
        id: recordId++,  // ID auto-incremental único
        fecha: rowObject.fecha,
        egresos: rowObject.tipo,
        folio: rowObject.numero || "",
        proveedor: rowObject.concepto || "",
        factura: rowObject.ref || "",
        importe: rowObject.cargos || 0,
        concepto: currentAccountName,
        vuelta: currentSegmentName,
        mes: monthString,
        año: year,
      }

      apkData.push(newRowObject)
      segmentNames.add(newRowObject.vuelta)
    }
  }

  return {
    processedData: apkData,
    segmentNames: segmentNames
  }
}

/**
 * Crea y retorna el elemento tbody con las filas de datos APK
 * @param {Array<Object>} apkData - Datos APK procesados
 * @returns {HTMLTableSectionElement} - Elemento tbody con las filas
 */
function createApkTableBody(apkData) {
  const tbody = document.createElement("tbody")

  apkData.forEach((rowData, index) => {
    // Se crea una nueva fila en la tabla
    const tr = document.createElement("tr")

    // Agregar atributo data-record-id para identificar la fila
    tr.setAttribute('data-record-id', rowData.id)
    tr.setAttribute('data-record-index', index)
    tr.classList.add('table-row-clickable')

    // Agregar event listener para abrir modal individual
    tr.addEventListener('click', () => {
      openIndividualRecordModal(rowData, 'apk')
    })

    // Se agregan las celdas a la fila asegurando que cada campo tenga su td
    Object.entries(rowData).forEach(([key, value], index) => {
      const td = document.createElement("td")

      // Formatear importes usando la función utilitaria
      if (value !== null && value !== undefined) {
        // Aplicar formato de moneda al campo "Importe" (índice 6)
        if (index === 6) {
          td.textContent = formatCurrency(value)
        } else {
          td.textContent = String(value)
        }
      } else {
        td.textContent = ''
      }

      tr.appendChild(td)
    })
    // Se agrega la fila al cuerpo de la tabla
    tbody.appendChild(tr)
  })

  return tbody
}

/**
 * Guarda los datos APK procesados en localStorage
 * @param {Array<Object>} apkData - Datos APK a guardar
 * @param {Set<string>} segmentNames - Nombres de segmentos encontrados
 */
function saveApkDataToLocalStorage(apkData, segmentNames) {
  const processData = getProcessData();

  // Actualizar los datos principales y segmentos
  processData.data = apkData;
  processData.segments = Array.from(segmentNames).map(segment => ({
    segment,
    count: 0,
  }));

  // Guardar la estructura completa
  saveProcessData(processData);
}

/**
 * Genera el cuerpo de la tabla a partir de los datos proporcionados (Refactorizada)
 * @param {string[][]} data - Datos raw de Excel
 */
function generateTableBodyForAPK(data) {
  // 1. Procesar los datos
  const { processedData, segmentNames } = processApkDataFromExcel(data)

  // 2. Crear el cuerpo de la tabla
  const tbody = createApkTableBody(processedData)

  // 3. Guardar en localStorage
  saveApkDataToLocalStorage(processedData, segmentNames)

  // 4. Agregar el cuerpo a la tabla y actualizar UI
  resultTable.appendChild(tbody)
  updateSegmentEditorVisibility()
}

/**
 * Procesa los datos raw de Excel y los convierte en datos GG estructurados
 * @param {string[][]} rawData - Datos raw de Excel
 * @returns {Array<Object>} - Datos procesados y nombres de segmentos
 */
function processGgDataFromExcel(rawData) {

  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = ""
  let currentSegmentName = ""
  let currentAccountCode = ""

  const ggData = []
  let recordId = 1  // ID auto-incremental comenzando en 1
  
  // Se lee las filas de principio a fin
  for (let i = 1; i < rawData.length; i++) {
    // Se obtiene la fila actual
    const row = rawData[i]
    // Se obtiene el valor de la primera columna
    const firstCell = String(row?.[0] || '').trim()

    // Se identifica el tipo de fila según el valor de la primera columna

    // 133-000-000-000-00	PRODUCCION DE CERDOS EN PROCESO
    // 1️⃣ Si la primera celda es un codigo de cuenta contable
    if (firstCell.match(accountNumberRegex)) {
      // La segunda celda es el nombre de la cuenta contable, y se guarda en la variable de estado
      currentAccountName = String(row?.[1] || '').trim()
      currentAccountCode = firstCell
    }
    // Segmento:  100 GG
    // 2️⃣ Si la primera celda empieza con "segmento"
    if (firstCell.toLowerCase().startsWith('segmento')) {
      // El nombre del segmento se encuentra despues de "Segmento:  " en esa misma celda
      // currentSegmentName = firstCell.split(' ').filter((_, index) => index > 2).join(' ').trim()
      currentSegmentName = firstCell.split(' ')
        .filter((_, index) => index > 2)
        .toReversed()
        .filter((_, index) => index === 0)
        .join(' ')
        .trim()
    }
    // 3️⃣ Si la primera celda es una fecha común de Excel
    if (firstCell.match(excelCommonDateRegex)) {
      // Se crea un objeto con los datos de la fila
      const rowObject = createObjectFromRow(row)

      // Quiero convertir el objeto a un nuevo objeto que incluya los valores actuales de segmento y cuenta contable
      // FECHA	EGRESOS	FOLIO	PROVEEDOR	FACTURA	 IMPORTE 	CONCEPTO	SEGMENTO	MES	AÑO

      const { monthString, year } = parseDateString(rowObject.fecha)

      // Extraer la subcuenta del código contable
      // Ejemplo: 133-037-000-000-00 -> subcuenta 037 para finalmente 37
      // La subcuenta es la segunda parte del código separado por guiones
      const subAccountCode = parseInt(currentAccountCode.split('-').slice(1, 2).join('') || 0) 
      let finalConcept = changeGGConceptByProcessType(rowObject, subAccountCode, currentAccountName);

      const newRowObject = {
        id: recordId++,  // ID auto-incremental único
        fecha: rowObject.fecha,
        egresos: rowObject.tipo,
        folio: rowObject.numero || "",
        proveedor: rowObject.concepto || "",
        factura: rowObject.ref || "",
        importe: rowObject.cargos || 0,
        concepto: finalConcept,
        vuelta: currentSegmentName, // En GG también se llama 'vuelta' internamente pero se muestra como 'Segmento'
        mes: monthString,
        año: year,
      }

      ggData.push(newRowObject)
    }
  }

  return ggData
}

/** 
 * @param {{ fecha: string; tipo: string; numero: string;  concepto: string; ref: string; cargos: string; }} rowObject
 * @param {number} subAccountCode
 * @param {string} defaultConcept
 * @returns {string} concepto resultado del ajuste
*/
function changeGGConceptByProcessType(rowObject, subAccountCode, defaultConcept) {
  // Lógica para cambiar el concepto

  let finalConcept = defaultConcept;
  
  // Conceptos predefinidos
  const preLoadConceptMap = {
    "OBRA CIVIL": "OBRA CIVIL",
    "DIESEL": "DIESEL",
    "EQ. TRANSPORTE": "EQ. TRANSPORTE",
    "VARIOS": "VARIOS",
    "GASOLINA": "GASOLINA",
    "ADMON SUELDOS": "ADMON SUELDOS",
    "DEPRECIACIONES": "DEPRECIACIONES",
    "SUELDOS Y SALARIOS": "SUELDOS Y SALARIOS"
  }

  if (['GRANJ', 'ADMIN'].some(word => rowObject.concepto.startsWith(word))) {
    if (rowObject.concepto.startsWith('GRANJ')) {
      finalConcept = preLoadConceptMap["SUELDOS Y SALARIOS"]
    } else if (rowObject.concepto.startsWith('ADMIN')) {
      finalConcept = preLoadConceptMap["ADMON SUELDOS"]
    }
  } else if ([20, 34, 37, 39].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["VARIOS"]
  } else if ([30].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["DEPRECIACIONES"]
  } else if ([25].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["EQ. TRANSPORTE"]
  } else if ([18].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["DIESEL"]
  } else if ([17].includes(subAccountCode)) {
    finalConcept = preLoadConceptMap["GASOLINA"]
  }

  return finalConcept;
}

/**
 * Procesa los datos raw de Excel y los convierte en datos GG estructurados
 * @param {string[][]} rawData - Datos raw de Excel
 * @returns {{ accounts: Array<{code: string, name: string}> }} - Datos de cuentas contables
 */
function generateAccountsData(rawData) {
  // Variables para mantener el estado actual de los valores del segmento y cuenta contable
  let currentAccountName = ""
  let currentAccountCode = ""

  const accounts = []

  // Se lee las filas de principio a fin
  for (let i = 1; i < rawData.length; i++) {
    // Se obtiene la fila actual
    const row = rawData[i]
    // Se obtiene el valor de la primera columna
    const firstCell = String(row?.[0] || '').trim()
    const secondCell = String(row?.[1] || '').trim()

    // Se identifica el tipo de fila según el valor de la primera columna

    // 133-000-000-000-00	PRODUCCION DE CERDOS EN PROCESO
    // 1️⃣ Si la primera celda es un codigo de cuenta contable
    if (firstCell.match(accountNumberRegex)) {
      // La segunda celda es el nombre de la cuenta contable, y se guarda en la variable de estado
      currentAccountName = secondCell
      currentAccountCode = firstCell
      accounts.push({ code: currentAccountCode, name: currentAccountName })
    }
  }

  return accounts
}

/**
 * Crea y retorna el elemento tbody con las filas de datos GG
 * @param {Array<Object>} ggData - Datos GG procesados
 * @returns {HTMLTableSectionElement} - Elemento tbody con las filas
 */
function createGgTableBody(ggData) {
  const tbody = document.createElement("tbody")

  ggData.forEach((rowData, index) => {
    // Se crea una nueva fila en la tabla
    const tr = document.createElement("tr")

    // Agregar atributo data-record-id para identificar la fila
    tr.setAttribute('data-record-id', rowData.id)
    tr.setAttribute('data-record-index', index)
    tr.classList.add('table-row-clickable')

    // Agregar event listener para abrir modal individual
    tr.addEventListener('click', () => {
      openIndividualRecordModal(rowData, 'gg')
    })

    // Se agregan las celdas a la fila asegurando que cada campo tenga su td
    Object.entries(rowData).forEach(([key, value], index) => {
      const td = document.createElement("td")

      // Formatear importes usando la función utilitaria
      if (value !== null && value !== undefined) {
        // Aplicar formato de moneda al campo "Importe" (índice 6)
        if (index === 6) {
          td.textContent = formatCurrency(value)
        } else {
          td.textContent = String(value)
        }
      } else {
        td.textContent = ''
      }
      tr.appendChild(td)
    })
    // Se agrega la fila al cuerpo de la tabla
    tbody.appendChild(tr)
  })

  return tbody
}

/**
 * Guarda los datos GG procesados en localStorage
 * @param {Array<Object>} ggData - Datos GG a guardar
 */
function saveGgDataToLocalStorage(ggData) {
  const processData = getProcessData();

  // Actualizar los datos de gastos generales
  processData.gg = ggData;

  // Guardar la estructura completa
  saveProcessData(processData);
}

/**
 * Genera el cuerpo de la tabla a partir de los datos proporcionados (Refactorizada)
 * @param {string[][]} data - Datos raw de Excel
 */
function generateTableBodyForGG(data) {
  // 1. Procesar los datos
  const processedData = processGgDataFromExcel(data)

  const accounts = generateAccountsData(data)
  console.log("Cuentas contables extraídas:", accounts)

  // 2. Crear el cuerpo de la tabla
  const tbody = createGgTableBody(processedData)

  // 3. Guardar en localStorage
  saveGgDataToLocalStorage(processedData)

  // 4. Agregar el cuerpo a la tabla
  resultTable.appendChild(tbody)
}

function showSegmentEditor() {
  segmentEditor.classList.remove("hidden")
}

function hideSegmentEditor() {
  segmentEditor.classList.add("hidden")
}

function showNoDataComponent() {
  noDataComponent.classList.remove("hidden")
}

function hideNoDataComponent() {
  noDataComponent.classList.add("hidden")
}

/**
 * Crea un objeto a partir de una fila de datos
 * @param {string[]} row - Fila de datos
 * @returns {{ fecha: string, tipo: string, numero: string, concepto: string, ref: string, cargos: string }} - Objeto con los datos de la fila
 */
function createObjectFromRow(row) {
  return {
    fecha: row[0],
    tipo: row[1],
    numero: row[2],
    concepto: row[3],
    ref: row[4],
    cargos: row[5]
  }
}

/**
 * Copia el contenido de la tabla al portapapeles
 * Formato: filas separadas por \n, columnas separadas por \t
 */
function copyTableToClipboard() {
  // Verificar si hay datos para copiar
  if (resultTable.classList.contains("hidden")) {
    showModal("No hay datos para copiar. Procesa un archivo primero.")
    return
  }

  const rows = resultTable.querySelectorAll("tr")
  if (rows.length === 0) {
    showModal("La tabla está vacía. No hay datos para copiar.")
    return
  }

  let tableText = ""

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll("th, td")
    const rowData = Array.from(cells)
      .map((cell) => cell.textContent)
      .join("\t")
    tableText += rowData

    // Agregar salto de línea excepto en la última fila
    if (index < rows.length - 1) {
      tableText += "\n"
    }
  })

  // Usar la API moderna de Clipboard
  navigator.clipboard
    .writeText(tableText)
    .then(() => {
      showToast()
    })
    .catch((err) => {
      console.error("Error al copiar al portapapeles:", err)
    })
}

// ========================================
// FUNCIONES DE TOAST
// ========================================

/**
 * Muestra la notificación toast
 */
function showToast() {
  toast.classList.remove("hidden")

  // Ocultar automáticamente después de 3 segundos
  setTimeout(() => {
    hideToast()
  }, 3000)
}

/**
 * Oculta la notificación toast
 */
function hideToast() {
  toast.classList.add("hidden")
}

/*
========================================
PROCESAR ARCHIVO EXCEL
========================================

*/

/**
 * Procesa un archivo Excel y devuelve un array de arrays con los datos
 * @param {File} file - Archivo Excel a procesar
 * @returns {Promise<Array<Array<string>>>} - Promesa que resuelve con los datos del archivo
 */
async function processExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // Leer el archivo como ArrayBuffer
    reader.readAsArrayBuffer(file)

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result
        // Leer el archivo Excel usando SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: "array" })

        // Obtener la primera hoja del archivo
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // Convertir los datos de la hoja a un array de arrays
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        resolve(data)
      } catch (error) {
        reject("Error al procesar el archivo Excel: " + error.message)
      }
    }

    reader.onerror = (error) => {
      reject("Error al leer el archivo: " + error.message)
    }
  })
}

/**
 * Convierte una fecha en formato "DD/Mmm/YYYY" a un objeto con el mes y el año
 * @param {string} dateString - Fecha en formato "DD/Mmm/YYYY"
 * @returns {{ monthString: string, year: number }} - Objeto con el mes y el año
 */
function parseDateString(dateString) {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ]

  const [_, month, year] = dateString.split('/')

  if (!months.includes(month)) {
    throw new Error(`Mes inválido: ${month}`)
  }

  return {
    monthString: month,
    year: parseInt(year, 10)
  }
}

// ========================================
// ACTUALIZAR VISIBILIDAD DEL COMPONENTE DE SEGMENTOS
// ========================================

/**
 * Actualiza la visibilidad del componente de edición de segmentos
 */
function updateSegmentEditorVisibility() {
  const segmentEditor = document.querySelector(".segment-editor")
  const processData = getProcessData();
  const segmentList = processData.segments || [];

  if (segmentList.length > 0) {
    segmentEditor.classList.remove("hidden")
    populateSegmentForm()
  } else {
    segmentEditor.classList.add("hidden")
  }
}

// ========================================
// ACTUALIZAR FORMULARIO DE SEGMENTOS
// ========================================

/**
 * Llena el formulario de segmentos con los datos del localStorage
 */
function populateSegmentForm() {
  const segmentGrid = document.querySelector("#segmentGrid")
  const processData = getProcessData()
  const segmentList = processData.segments || []

  // Limpiar contenido existente
  segmentGrid.innerHTML = ""

  // Crear elementos dinámicamente
  segmentList.forEach(({ segment, count }) => {
    const segmentItem = document.createElement("div")
    segmentItem.classList.add("segment-item")

    const segmentName = document.createElement("span")
    segmentName.classList.add("segment-name")
    segmentName.textContent = segment

    const segmentInput = document.createElement("input")
    segmentInput.type = "number"
    segmentInput.classList.add("segment-input")
    segmentInput.value = count
    segmentInput.min = 0

    segmentItem.appendChild(segmentName)
    segmentItem.appendChild(segmentInput)
    segmentGrid.appendChild(segmentItem)
  })
}

/**
 * Actualiza los datos del localStorage con los valores del formulario
 */
function updateSegmentData() {
  const segmentGrid = document.querySelector("#segmentGrid")
  const segmentItems = segmentGrid.querySelectorAll(".segment-item")

  const updatedSegmentList = Array.from(segmentItems).map((item) => {
    const segment = item.querySelector(".segment-name").textContent
    const count = parseInt(item.querySelector(".segment-input").value, 10) || 0

    return { segment, count }
  })

  // Guardar en la nueva estructura de datos
  const processData = getProcessData()
  processData.segments = updatedSegmentList
  saveProcessData(processData)

  showToast("Segmentos actualizados correctamente")
  populateSegmentForm()
  updateConfirmProrrateoButton()
}

// Evento: Envío del formulario de segmentos
const segmentForm = document.querySelector("#segmentForm")
segmentForm.addEventListener("submit", (e) => {
  e.preventDefault()
  updateSegmentData()
})

// Llenar el formulario al cargar la página
populateSegmentForm()

// ========================================
// GESTIÓN DE CONCEPTOS
// ========================================

/**
 * Inicializa el gestor de conceptos cargando los datos del localStorage
 */
function initializeConceptsManager() {
  loadConceptsFromStorage()
  updateConceptsCounter()
  validateConceptInput()
}

/**
 * Obtiene los conceptos del localStorage
 * @returns {Array<string>} Array de conceptos
 */
function getConceptsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("concepts")) || []
  } catch (error) {
    console.error("Error al leer conceptos del localStorage:", error)
    return []
  }
}

/**
 * Guarda los conceptos en el localStorage
 * @param {Array<string>} concepts Array de conceptos a guardar
 */
function saveConceptsToStorage(concepts) {
  try {
    localStorage.setItem("concepts", JSON.stringify(concepts))
  } catch (error) {
    console.error("Error al guardar conceptos en localStorage:", error)
    showModal("Error al guardar los conceptos")
  }
}

/**
 * Valida la entrada del input de concepto
 */
function validateConceptInput() {
  const value = conceptInput.value.trim()
  const isValid = value.length > 0 && value.length <= 100

  addConceptBtn.disabled = !isValid

  // Cambiar estilo del input según validación
  if (value.length > 0 && !isValid) {
    conceptInput.style.borderColor = "#dc3545"
  } else {
    conceptInput.style.borderColor = value.length > 0 ? "#28a745" : "#e5e5e5"
  }
}

/**
 * Agrega un nuevo concepto
 */
function addConcept() {
  const conceptText = conceptInput.value.trim()

  if (!conceptText) {
    conceptInput.focus()
    return
  }

  if (conceptText.length > 100) {
    showModal("El concepto no puede tener más de 100 caracteres")
    return
  }

  const concepts = getConceptsFromStorage()

  // Verificar si el concepto ya existe (sin distinguir mayúsculas/minúsculas)
  const conceptExists = concepts.some(
    concept => concept.toLowerCase() === conceptText.toLowerCase()
  )

  if (conceptExists) {
    showModal("Este concepto ya existe en la lista")
    conceptInput.focus()
    return
  }

  // Agregar el nuevo concepto
  concepts.push(conceptText)
  saveConceptsToStorage(concepts)

  // Actualizar la UI
  loadConceptsFromStorage()
  updateConceptsCounter()

  // Limpiar el input
  conceptInput.value = ""
  validateConceptInput()
  conceptInput.focus()

  showToast()
}

/**
 * Elimina un concepto específico
 * @param {number} index Índice del concepto a eliminar
 */
function deleteConcept(index) {
  const concepts = getConceptsFromStorage()

  if (index >= 0 && index < concepts.length) {
    concepts.splice(index, 1)
    saveConceptsToStorage(concepts)
    loadConceptsFromStorage()
    updateConceptsCounter()
    showToast()
  }
}

/**
 * Edita un concepto específico
 * @param {number} index Índice del concepto a editar
 * @param {string} newText Nuevo texto del concepto
 */
function editConcept(index, newText) {
  const conceptText = newText.trim()

  if (!conceptText) {
    showModal("El concepto no puede estar vacío")
    return false
  }

  if (conceptText.length > 100) {
    showModal("El concepto no puede tener más de 100 caracteres")
    return false
  }

  const concepts = getConceptsFromStorage()

  // Verificar si el concepto ya existe (excluyendo el actual)
  const conceptExists = concepts.some(
    (concept, i) => i !== index && concept.toLowerCase() === conceptText.toLowerCase()
  )

  if (conceptExists) {
    showModal("Este concepto ya existe en la lista")
    return false
  }

  if (index >= 0 && index < concepts.length) {
    concepts[index] = conceptText
    saveConceptsToStorage(concepts)
    loadConceptsFromStorage()
    showToast()
    return true
  }

  return false
}

/**
 * Elimina todos los conceptos
 */
function clearAllConcepts() {
  saveConceptsToStorage([])
  loadConceptsFromStorage()
  updateConceptsCounter()
  showToast()
}

/**
 * Carga y muestra los conceptos desde el localStorage
 */
function loadConceptsFromStorage() {
  const concepts = getConceptsFromStorage()

  if (concepts.length === 0) {
    showEmptyConceptsMessage()
  } else {
    renderConceptsList(concepts)
  }
}

/**
 * Muestra el mensaje cuando no hay conceptos
 */
function showEmptyConceptsMessage() {
  conceptsList.innerHTML = `
    <div class="empty-concepts">
      <p class="empty-message">No hay conceptos guardados</p>
      <p class="empty-hint">Agrega tu primer concepto usando el formulario de arriba</p>
    </div>
  `
}

/**
 * Renderiza la lista de conceptos
 * @param {Array<string>} concepts Array de conceptos a mostrar
 */
function renderConceptsList(concepts) {
  const conceptsHTML = concepts.map((concept, index) => `
    <div class="concept-item" data-index="${index}">
      <span class="concept-text">${escapeHtml(concept)}</span>
      <div class="concept-actions">
        <button class="btn-edit-concept" onclick="startEditConcept(${index})">
          ✏️ Editar
        </button>
        <button class="btn-delete-concept" onclick="confirmDeleteConcept(${index})">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `).join("")

  conceptsList.innerHTML = conceptsHTML
}

/**
 * Inicia el modo de edición para un concepto
 * @param {number} index Índice del concepto a editar
 */
function startEditConcept(index) {
  const concepts = getConceptsFromStorage()
  const conceptItem = document.querySelector(`[data-index="${index}"]`)

  if (!conceptItem || index >= concepts.length) return

  const currentText = concepts[index]

  conceptItem.innerHTML = `
    <input type="text" class="edit-concept-input" value="${escapeHtml(currentText)}" maxlength="100">
    <div class="concept-actions">
      <button class="btn-save-concept" onclick="saveEditConcept(${index})">
        ✓ Guardar
      </button>
      <button class="btn-cancel-concept" onclick="cancelEditConcept(${index})">
        ✕ Cancelar
      </button>
    </div>
  `

  const input = conceptItem.querySelector(".edit-concept-input")
  input.focus()
  input.select()

  // Guardar en Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveEditConcept(index)
    } else if (e.key === "Escape") {
      cancelEditConcept(index)
    }
  })
}

/**
 * Guarda la edición de un concepto
 * @param {number} index Índice del concepto
 */
function saveEditConcept(index) {
  const conceptItem = document.querySelector(`[data-index="${index}"]`)
  const input = conceptItem.querySelector(".edit-concept-input")

  if (input) {
    const success = editConcept(index, input.value)
    if (!success) {
      // Si falló, mantener el modo de edición y enfocar el input
      input.focus()
      input.select()
    }
  }
}

/**
 * Cancela la edición de un concepto
 * @param {number} index Índice del concepto
 */
function cancelEditConcept(index) {
  loadConceptsFromStorage()
}

/**
 * Confirma la eliminación de un concepto
 * @param {number} index Índice del concepto a eliminar
 */
function confirmDeleteConcept(index) {
  const concepts = getConceptsFromStorage()
  if (index >= 0 && index < concepts.length) {
    const conceptText = concepts[index]
    showConfirmDialog(
      `¿Estás seguro de que quieres eliminar el concepto "${conceptText}"?`,
      () => deleteConcept(index)
    )
  }
}

/**
 * Actualiza el contador de conceptos
 */
function updateConceptsCounter() {
  const concepts = getConceptsFromStorage()
  conceptsCounter.textContent = concepts.length
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Ejecuta directamente la función de confirmación (sin mostrar diálogo)
 * @param {string} message Mensaje a mostrar (solo para documentación)
 * @param {Function} onConfirm Función a ejecutar
 */
function showConfirmDialog(message, onConfirm) {
  // Ejecutar directamente sin confirmación - asumimos que el usuario siempre confirma
  if (typeof onConfirm === "function") {
    onConfirm()
  }
}

/**
 * Obtiene todos los conceptos como array
 * @returns {Array<string>} Array de conceptos
 */
function getAllConcepts() {
  return getConceptsFromStorage()
}

/**
 * Verifica si existe un concepto específico
 * @param {string} conceptText Texto del concepto a buscar
 * @returns {boolean} true si existe, false si no
 */
function conceptExists(conceptText) {
  const concepts = getConceptsFromStorage()
  return concepts.some(
    concept => concept.toLowerCase() === conceptText.toLowerCase()
  )
}

// ========================================
// CARRUSEL DE VERIFICACIÓN APK
// ========================================

/**
 * Abre el carrusel de verificación de datos (APK o GG)
 */
function openVerifyCarousel() {
  // Determinar qué tipo de datos usar basándose en el radio button seleccionado
  const selectedOption = document.querySelector('input[name="step"]:checked').value

  let currentDataArray = []
  let dataType = ""

  if (selectedOption === "apk") {
    // Usuario seleccionó APK
    apkDataArray = getApkDataFromStorage()

    if (apkDataArray.length === 0) {
      showModal("No hay datos APK para verificar. Procesa primero un archivo APK.")
      return
    }

    currentDataArray = apkDataArray
    dataType = "APK"
  } else if (selectedOption === "gg") {
    // Usuario seleccionó GG
    ggDataArray = getGgDataFromStorage()

    if (ggDataArray.length === 0) {
      showModal("No hay datos GG para verificar. Procesa primero un archivo GG.")
      return
    }

    // Para GG usamos ggDataArray como referencia principal
    apkDataArray = ggDataArray
    currentDataArray = ggDataArray
    dataType = "GG"
  } else {
    showModal("Selecciona el tipo de datos a verificar (APK o GG).")
    return
  }

  // Actualizar el título del carrusel según el tipo de datos
  updateCarouselTitle(dataType)

  // Inicializar el carrusel
  currentRecordIndex = 0
  populateConceptSelector()
  displayCurrentRecord()
  updateNavigationButtons()

  // Mostrar el carrusel
  verifyCarousel.classList.remove("hidden")
}

/**
 * Cierra el carrusel de verificación
 */
function closeVerifyCarousel() {
  verifyCarousel.classList.add("hidden")
  currentRecordIndex = 0
  conceptSelect.value = ""
}

/**
 * Obtiene los datos APK del localStorage usando la nueva arquitectura
 * @returns {Array<Object>} Array de objetos APK
 */
function getApkDataFromStorage() {
  try {
    const processData = getProcessData();
    return processData.data || [];
  } catch (error) {
    console.error("Error al leer datos APK del localStorage:", error)
    return []
  }
}

/**
 * Guarda los datos APK en el localStorage usando la nueva arquitectura
 * @param {Array<Object>} data Array de objetos APK a guardar
 */
function saveApkDataToStorage(data) {
  try {
    const processData = getProcessData();
    processData.data = data;
    saveProcessData(processData);
  } catch (error) {
    console.error("Error al guardar datos APK en localStorage:", error)
    showModal("Error al guardar los datos")
  }
}

/**
 * Obtiene los datos GG del localStorage usando la nueva arquitectura
 * @returns {Array<Object>} Array de objetos GG
 */
function getGgDataFromStorage() {
  try {
    const processData = getProcessData();
    return processData.gg || [];
  } catch (error) {
    console.error("Error al leer datos GG del localStorage:", error)
    return []
  }
}

/**
 * Guarda los datos GG en el localStorage usando la nueva arquitectura
 * @param {Array<Object>} data Array de objetos GG a guardar
 */
function saveGgDataToStorage(data) {
  try {
    const processData = getProcessData();
    processData.gg = data;
    saveProcessData(processData);
  } catch (error) {
    console.error("Error al guardar datos GG en localStorage:", error)
    showModal("Error al guardar los datos")
  }
}

/**
 * Actualiza el título del carrusel según el tipo de datos
 * @param {string} dataType Tipo de datos ("APK" o "GG")
 */
function updateCarouselTitle(dataType) {
  const carouselTitle = document.querySelector(".carousel-title")
  if (carouselTitle) {
    carouselTitle.textContent = `Verificar Datos ${dataType}`
  }
}

/**
 * Popula el selector de conceptos con los conceptos disponibles
 */
function populateConceptSelector() {
  const concepts = getConceptsFromStorage()

  // Limpiar opciones existentes excepto la primera
  conceptSelect.innerHTML = '<option value="">Seleccionar concepto...</option>'

  // Ordenar conceptos alfabéticamente (insensible a mayúsculas/minúsculas)
  const sortedConcepts = concepts.sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })

  // Agregar conceptos ordenados como opciones
  sortedConcepts.forEach(concept => {
    const option = document.createElement("option")
    option.value = concept
    option.textContent = concept
    conceptSelect.appendChild(option)
  })

  // Actualizar totales basándose en el radio button seleccionado
  const selectedOption = document.querySelector('input[name="step"]:checked').value
  let totalRecords = 0

  if (selectedOption === "apk") {
    const apkData = getApkDataFromStorage()
    totalRecords = apkData.length
  } else if (selectedOption === "gg") {
    const ggData = getGgDataFromStorage()
    totalRecords = ggData.length
  }

  totalRecordsSpan.textContent = totalRecords
}

/**
 * Muestra el registro actual en el carrusel
 */
function displayCurrentRecord() {
  if (!apkDataArray || currentRecordIndex < 0 || currentRecordIndex >= apkDataArray.length) {
    return
  }

  const record = apkDataArray[currentRecordIndex]
  if (!record) {
    return
  }

  // Determinar si estamos trabajando con datos GG basándose en el radio button seleccionado
  const selectedOption = document.querySelector('input[name="step"]:checked').value
  const isGGData = selectedOption === "gg"

  // Actualizar la etiqueta de "Vuelta"/"Segmento" según el tipo de datos
  const vueltaLabel = document.querySelector('.data-row:last-child .data-label')
  if (vueltaLabel) {
    vueltaLabel.textContent = isGGData ? "Segmento:" : "Vuelta:"
  }

  // Actualizar información del registro
  currentIndexSpan.textContent = currentRecordIndex + 1
  dataFecha.textContent = record.fecha || ""
  dataProveedor.textContent = record.proveedor || ""
  dataFactura.textContent = record.factura || ""
  dataConcepto.textContent = record.concepto || ""
  dataVuelta.textContent = record.vuelta || ""

  // Resetear selector de conceptos
  conceptSelect.value = ""
  validateChangeButton()
}

/**
 * Navega entre registros
 * @param {number} direction Dirección de navegación (-1 para anterior, 1 para siguiente)
 */
function navigateRecord(direction) {
  if (!apkDataArray || apkDataArray.length === 0) {
    return
  }
  
  const newIndex = currentRecordIndex + direction

  if (newIndex >= 0 && newIndex < apkDataArray.length) {
    currentRecordIndex = newIndex
    displayCurrentRecord()
    updateNavigationButtons()
  }
}

/**
 * Actualiza el estado de los botones de navegación
 */
function updateNavigationButtons() {
  if (!apkDataArray || apkDataArray.length === 0) {
    prevRecordBtn.disabled = true
    nextRecordBtn.disabled = true
    return
  }
  
  prevRecordBtn.disabled = currentRecordIndex <= 0
  nextRecordBtn.disabled = currentRecordIndex >= apkDataArray.length - 1
}

/**
 * Valida si se puede habilitar el botón de cambiar
 */
function validateChangeButton() {
  const selectedConcept = conceptSelect.value.trim()
  
  // Validar que el array y el índice existan
  if (!apkDataArray || currentRecordIndex < 0 || currentRecordIndex >= apkDataArray.length) {
    changeConceptBtn.disabled = true
    return
  }
  
  const currentConcept = apkDataArray[currentRecordIndex]?.concepto || ""

  // Habilitar solo si se seleccionó un concepto diferente al actual
  changeConceptBtn.disabled = !selectedConcept || selectedConcept === currentConcept
}

/**
 * Cambia el concepto del registro actual
 */
function changeRecordConcept() {
  const selectedConcept = conceptSelect.value.trim()

  if (!selectedConcept) {
    showModal("Selecciona un concepto para continuar")
    return
  }

  // Validar que el array y el índice existan
  if (!apkDataArray || currentRecordIndex < 0 || currentRecordIndex >= apkDataArray.length) {
    showModal("Error: No se encontró el registro a actualizar")
    return
  }

  const currentRecord = apkDataArray[currentRecordIndex]
  if (!currentRecord) {
    showModal("Error: Registro no válido")
    return
  }

  const currentConcept = currentRecord.concepto || ""

  if (selectedConcept === currentConcept) {
    showModal("El concepto seleccionado es el mismo que el actual")
    return
  }

  // Actualizar el concepto en el array directamente
  apkDataArray[currentRecordIndex].concepto = selectedConcept

  // Determinar qué tipo de datos estamos manejando basándose en el radio button seleccionado
  const selectedOption = document.querySelector('input[name="step"]:checked').value

  if (selectedOption === "apk") {
    // Estamos trabajando con datos APK
    saveApkDataToStorage(apkDataArray)
  } else if (selectedOption === "gg") {
    // Estamos trabajando con datos GG
    saveGgDataToStorage(apkDataArray) // apkDataArray contiene los datos GG en este contexto
  }

  // Actualizar la tabla si está visible
  updateTableAfterConceptChange()

  // Mostrar confirmación
  showToast()

  // Avanzar al siguiente registro o cerrar si es el último
  if (currentRecordIndex < apkDataArray.length - 1) {
    navigateRecord(1)
  } else {
    // Es el último registro, cerrar automáticamente
    closeVerifyCarousel()
  }
}

/**
 * Actualiza la tabla después de cambiar un concepto
 */
function updateTableAfterConceptChange() {
  // Verificar si la tabla está visible y contiene datos
  if (!tableSection.classList.contains("hidden") && resultTable.querySelector("tbody")) {
    // Regenerar el cuerpo de la tabla con los nuevos datos
    const tbody = resultTable.querySelector("tbody")
    tbody.innerHTML = ""

    // Determinar qué datos usar para actualizar basándose en el radio button seleccionado
    const selectedOption = document.querySelector('input[name="step"]:checked').value
    const isGGData = selectedOption === "gg"

    // Recrear las filas con los datos actualizados
    apkDataArray.forEach(record => {
      const tr = document.createElement("tr")

      // Crear celdas en el orden correcto
      // Para GG, el header "Vuelta" se llama "Segmento" pero los datos son iguales
      const values = [
        record.fecha,
        record.egresos,
        record.folio,
        record.proveedor,
        record.factura,
        record.importe,
        record.concepto, // Este es el campo que pudo haber cambiado
        record.vuelta,   // En GG esto se muestra como "Segmento"
        record.mes,
        record.año
      ]

      values.forEach((value, index) => {
        const td = document.createElement("td")
        // Asegurar que siempre haya contenido, aunque sea vacío
        if (index === 5) {
          td.textContent = formatCurrency(value)
        } else {
          td.textContent = value !== null && value !== undefined ? String(value) : ""
        }
        tr.appendChild(td)
      })

      tbody.appendChild(tr)
    })
  }
}

/**
 * Función helper para mostrar toast personalizado
 * @param {string} message Mensaje personalizado (opcional)
 */
function showToast(message = "¡Concepto actualizado correctamente!") {
  const toastMessage = document.querySelector(".toast-message")
  const originalMessage = toastMessage.textContent

  toastMessage.textContent = message
  toast.classList.remove("hidden")

  setTimeout(() => {
    hideToast()
    toastMessage.textContent = originalMessage
  }, 3000)
}

// ========================================
// GESTIÓN DE SUSTITUCIÓN MASIVA
// ========================================

/**
 * Actualiza la visibilidad del componente de sustitución masiva
 */
function updateMassReplacementVisibility() {
  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  const data = getProcessedDataFromStorage(selectedOption)

  if (data && data.length > 0) {
    massReplacementManager.classList.remove("hidden")
    updateMassReplacementData(selectedOption, data)
  } else {
    massReplacementManager.classList.add("hidden")
    resetMassReplacementComponent()
  }
}

/**
 * Resetea el componente de sustitución masiva a su estado inicial
 */
function resetMassReplacementComponent() {
  currentDataType.textContent = "-"
  totalRecordsCount.textContent = "0"
  conceptsCheckboxList.innerHTML = `
    <div class="empty-concepts-data">
      <p class="empty-message">No hay datos cargados</p>
      <p class="empty-hint">Procesa un archivo para ver los conceptos disponibles</p>
    </div>
  `
  targetConceptSelect.innerHTML = '<option value="">Seleccionar concepto destino...</option>'
  replacementSummary.innerHTML = '<p class="summary-text">Selecciona conceptos para ver el resumen</p>'
  executeReplacementBtn.disabled = true
}

/**
 * Actualiza los datos del componente de sustitución masiva
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 * @param {Array<Object>} data - Datos procesados
 */
function updateMassReplacementData(dataType, data) {
  // Actualizar información general
  currentDataType.textContent = dataType.toUpperCase()
  totalRecordsCount.textContent = data.length

  // Obtener conceptos únicos y sus conteos
  const conceptCounts = getConceptCounts(data)

  // Poblar lista de checkboxes de conceptos
  populateConceptCheckboxes(conceptCounts)

  // Poblar selector de concepto destino
  populateTargetConceptSelector()

  // Limpiar selección anterior
  clearAllConceptSelection()
}

/**
 * Obtiene los conceptos únicos y sus conteos de los datos
 * @param {Array<Object>} data - Datos procesados
 * @returns {Map<string, number>} - Mapa de conceptos y sus conteos
 */
function getConceptCounts(data) {
  const conceptCounts = new Map()

  data.forEach(record => {
    const concept = record.concepto || ""
    if (concept.trim()) {
      conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1)
    }
  })

  return conceptCounts
}

/**
 * Pobla la lista de checkboxes con los conceptos disponibles
 * @param {Map<string, number>} conceptCounts - Mapa de conceptos y conteos
 */
function populateConceptCheckboxes(conceptCounts) {
  if (conceptCounts.size === 0) {
    conceptsCheckboxList.innerHTML = `
      <div class="empty-concepts-data">
        <p class="empty-message">No se encontraron conceptos</p>
        <p class="empty-hint">Los datos procesados no contienen conceptos válidos</p>
      </div>
    `
    return
  }

  // Convertir a array y ordenar alfabéticamente
  const sortedConcepts = Array.from(conceptCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))

  const checkboxHTML = sortedConcepts.map(([concept, count], index) => `
    <div class="concept-checkbox-item" data-concept="${escapeHtml(concept)}">
      <input 
        type="checkbox" 
        id="conceptCheck_${index}" 
        class="concept-checkbox"
        value="${escapeHtml(concept)}"
      >
      <label for="conceptCheck_${index}" class="concept-checkbox-label">
        ${escapeHtml(concept)}
      </label>
      <span class="concept-count">${count}</span>
    </div>
  `).join("")

  conceptsCheckboxList.innerHTML = checkboxHTML

  // Agregar event listeners a los checkboxes
  conceptsCheckboxList.querySelectorAll('.concept-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateCheckboxItemStyle(checkbox)
      updateReplacementSummary()
    })
  })
}

/**
 * Actualiza el estilo del item del checkbox según su estado
 * @param {HTMLInputElement} checkbox - Elemento checkbox
 */
function updateCheckboxItemStyle(checkbox) {
  const item = checkbox.closest('.concept-checkbox-item')
  if (checkbox.checked) {
    item.classList.add('selected')
  } else {
    item.classList.remove('selected')
  }
}

/**
 * Pobla el selector de concepto destino con conceptos guardados
 */
function populateTargetConceptSelector() {
  const savedConcepts = getConceptsFromStorage()

  // Limpiar opciones existentes excepto la primera
  targetConceptSelect.innerHTML = '<option value="">Seleccionar concepto destino...</option>'

  // Ordenar conceptos alfabéticamente
  const sortedConcepts = savedConcepts.sort((a, b) => a.localeCompare(b))

  sortedConcepts.forEach(concept => {
    const option = document.createElement('option')
    option.value = concept
    option.textContent = concept
    targetConceptSelect.appendChild(option)
  })
}

/**
 * Selecciona todos los conceptos disponibles
 */
function selectAllConcepts() {
  const checkboxes = conceptsCheckboxList.querySelectorAll('.concept-checkbox')
  checkboxes.forEach(checkbox => {
    checkbox.checked = true
    updateCheckboxItemStyle(checkbox)
  })
  updateReplacementSummary()
}

/**
 * Limpia la selección de todos los conceptos
 */
function clearAllConceptSelection() {
  const checkboxes = conceptsCheckboxList.querySelectorAll('.concept-checkbox')
  checkboxes.forEach(checkbox => {
    checkbox.checked = false
    updateCheckboxItemStyle(checkbox)
  })
  updateReplacementSummary()
}

/**
 * Obtiene los conceptos seleccionados
 * @returns {Array<string>} - Array de conceptos seleccionados
 */
function getSelectedConcepts() {
  const checkboxes = conceptsCheckboxList.querySelectorAll('.concept-checkbox:checked')
  return Array.from(checkboxes).map(checkbox => checkbox.value)
}

/**
 * Actualiza el resumen de la sustitución
 */
function updateReplacementSummary() {
  const selectedConcepts = getSelectedConcepts()
  const targetConcept = targetConceptSelect.value

  if (selectedConcepts.length === 0) {
    replacementSummary.innerHTML = '<p class="summary-text">Selecciona conceptos para reemplazar</p>'
    executeReplacementBtn.disabled = true
    return
  }

  if (!targetConcept) {
    replacementSummary.innerHTML = `
      <p class="summary-text">
        ${selectedConcepts.length} concepto(s) seleccionado(s). 
        <br>Selecciona un concepto destino para continuar.
      </p>
    `
    executeReplacementBtn.disabled = true
    return
  }

  // Validar que el concepto destino no esté en los conceptos origen
  if (selectedConcepts.includes(targetConcept)) {
    replacementSummary.innerHTML = `
      <p class="summary-text" style="color: #dc3545;">
        <strong>Error:</strong> El concepto destino no puede ser uno de los conceptos a reemplazar.
        <br>Selecciona un concepto diferente.
      </p>
    `
    executeReplacementBtn.disabled = true
    return
  }

  // Calcular total de registros afectados
  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  const data = getProcessedDataFromStorage(selectedOption)
  const affectedRecords = data.filter(record => selectedConcepts.includes(record.concepto)).length

  replacementSummary.innerHTML = `
    <div class="summary-active">
      <p><strong>Resumen de sustitución:</strong></p>
      <p>• Conceptos a reemplazar: ${selectedConcepts.length}</p>
      <p>• Registros afectados: ${affectedRecords}</p>
      <p>• Concepto destino: <em>${targetConcept}</em></p>
    </div>
  `

  executeReplacementBtn.disabled = false
}

/**
 * Muestra una vista previa de los cambios que se van a realizar
 */
function previewMassReplacement() {
  const selectedConcepts = getSelectedConcepts()
  const targetConcept = targetConceptSelect.value

  if (selectedConcepts.length === 0 || !targetConcept) {
    showModal("Selecciona conceptos origen y concepto destino para ver la vista previa")
    return
  }

  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  const data = getProcessedDataFromStorage(selectedOption)
  const affectedRecords = data.filter(record => selectedConcepts.includes(record.concepto))

  let previewHTML = `
    <div style="text-align: left; max-height: 300px; overflow-y: auto;">
      <h4>Vista Previa de Cambios (${affectedRecords.length} registros)</h4>
      <hr style="margin: 10px 0;">
  `

  const previewLimit = 10 // Mostrar máximo 10 registros en preview
  affectedRecords.slice(0, previewLimit).forEach((record, index) => {
    previewHTML += `
      <p style="margin: 5px 0; padding: 5px; background-color: #f8f9fa; border-radius: 3px;">
        <strong>${index + 1}.</strong> 
        <span style="color: #dc3545; text-decoration: line-through;">${record.concepto}</span>
        →
        <span style="color: #28a745; font-weight: bold;">${targetConcept}</span>
        <br><small style="color: #666;">Proveedor: ${record.proveedor} | Fecha: ${record.fecha}</small>
      </p>
    `
  })

  if (affectedRecords.length > previewLimit) {
    previewHTML += `<p style="text-align: center; color: #666; font-style: italic;">... y ${affectedRecords.length - previewLimit} registros más</p>`
  }

  previewHTML += `</div>`

  showModal(previewHTML)
}

/**
 * Ejecuta la sustitución masiva
 */
function executeMassReplacement() {
  const selectedConcepts = getSelectedConcepts()
  const targetConcept = targetConceptSelect.value

  if (selectedConcepts.length === 0 || !targetConcept) {
    showModal("Selecciona conceptos origen y concepto destino para ejecutar la sustitución")
    return
  }

  // Ejecutar directamente sin confirmación - asumimos que el usuario siempre confirma
  try {
    // Obtener datos actuales
    const selectedOption = document.querySelector('input[name="step"]:checked')?.value
    const data = getProcessedDataFromStorage(selectedOption)

    // Realizar sustitución
    let replacedCount = 0
    data.forEach(record => {
      if (selectedConcepts.includes(record.concepto)) {
        record.concepto = targetConcept
        replacedCount++
      }
    })

    // Guardar datos actualizados en localStorage
    if (selectedOption === "apk") {
      localStorage.setItem('apkData', JSON.stringify(data))
    } else if (selectedOption === "gg") {
      localStorage.setItem('ggData', JSON.stringify(data))
    }

    // Actualizar tabla si está visible
    if (!tableSection.classList.contains("hidden")) {
      const headers = getHeadersForDataType(selectedOption)
      generateTableFromProcessedData(resultTable, data, headers, selectedOption)
    }

    // Actualizar componente de sustitución masiva
    updateMassReplacementData(selectedOption, data)

    // Mostrar confirmación
    showToast(`¡Sustitución completada! ${replacedCount} registros actualizados.`)

  } catch (error) {
    console.error("Error ejecutando sustitución masiva:", error)
    showModal("Error al ejecutar la sustitución. Por favor, intenta de nuevo.")
  }
}

/**
 * Función de diagnóstico para verificar el estado del componente de sustitución masiva
 * Solo para desarrollo/debug
 */
function debugMassReplacementComponent() {
  console.log("=== DEBUG: Componente de Sustitución Masiva ===")

  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  const data = getProcessedDataFromStorage(selectedOption)

  console.log("Tipo de datos seleccionado:", selectedOption)
  console.log("Datos cargados:", data ? data.length : 0, "registros")
  console.log("Componente visible:", !massReplacementManager.classList.contains("hidden"))

  if (data && data.length > 0) {
    const conceptCounts = getConceptCounts(data)
    console.log("Conceptos únicos encontrados:", conceptCounts.size)
    console.log("Conceptos guardados disponibles:", getConceptsFromStorage().length)
  }

  console.log("============================================")
}

// ========================================
// UTILIDADES DE FECHA Y ORDENAMIENTO
// ========================================

/**
 * Convierte una fecha en formato personalizado "DD/Mmm/YYYY" a objeto Date
 * @param {string} dateString - Fecha en formato "05/Sep/2025"
 * @returns {Date|null} - Objeto Date o null si es inválida
 */
function parseCustomDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null

  const monthsMap = {
    'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
  }

  // Parsear formato DD/Mmm/YYYY
  const parts = dateString.trim().split('/')
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const monthStr = parts[1]
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(year) || !monthsMap.hasOwnProperty(monthStr)) {
    return null
  }

  const month = monthsMap[monthStr]
  return new Date(year, month, day)
}

/**
 * Compara dos valores para ordenamiento
 * @param {any} a - Primer valor
 * @param {any} b - Segundo valor
 * @param {string} type - Tipo de comparación ('date', 'number', 'text')
 * @param {boolean} ascending - Si es orden ascendente
 * @returns {number} - Resultado de comparación (-1, 0, 1)
 */
function compareValues(a, b, type, ascending = true) {
  let result = 0

  switch (type) {
    case 'date':
      const dateA = parseCustomDate(a)
      const dateB = parseCustomDate(b)
      if (!dateA && !dateB) result = 0
      else if (!dateA) result = 1
      else if (!dateB) result = -1
      else result = dateA.getTime() - dateB.getTime()
      break

    case 'number':
      const numA = parseFloat(a) || 0
      const numB = parseFloat(b) || 0
      result = numA - numB
      break

    case 'text':
    default:
      const strA = String(a || '').toLowerCase()
      const strB = String(b || '').toLowerCase()
      result = strA.localeCompare(strB)
      break
  }

  return ascending ? result : -result
}

/**
 * Estado actual del ordenamiento de tabla
 */
let currentSortState = {
  field: null,
  ascending: true,
  dataType: null
}

/**
 * Ordena la tabla por un campo específico
 * @param {string} field - Campo por el cual ordenar
 * @param {boolean} ascending - Dirección del ordenamiento
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 */
function sortTableByField(field, ascending, dataType) {
  // Obtener datos actuales
  const data = getCurrentData(dataType)
  if (!data || data.length === 0) return

  // Determinar tipo de comparación según el campo
  let compareType = 'text'
  if (field === 'Fecha') compareType = 'date'
  else if (field === 'Importe') compareType = 'number'

  // Mapear nombre del campo a propiedad del objeto
  const fieldMap = {
    'Fecha': 'fecha',
    'Proveedor': 'proveedor',
    'Importe': 'importe',
    'Concepto': 'concepto'
  }

  const fieldProperty = fieldMap[field]
  if (!fieldProperty) return

  // Ordenar datos
  const sortedData = [...data].sort((a, b) => {
    const primaryResult = compareValues(a[fieldProperty], b[fieldProperty], compareType, ascending)
    // Ordenamiento secundario por ID para estabilidad
    return primaryResult !== 0 ? primaryResult : compareValues(a.id, b.id, 'number', true)
  })

  // Actualizar estado de ordenamiento
  currentSortState = { field, ascending, dataType }

  // Guardar datos ordenados
  saveCurrentData(sortedData, dataType)

  // Regenerar tabla
  const headers = getHeadersForDataType(dataType)
  generateTableFromProcessedData(resultTable, sortedData, headers, dataType)

  // Actualizar indicadores visuales de ordenamiento
  updateSortIndicators(field, ascending)
}

/**
 * Actualiza los indicadores visuales de ordenamiento en las cabeceras
 * @param {string} activeField - Campo actualmente activo para ordenamiento
 * @param {boolean} ascending - Si el ordenamiento es ascendente
 */
function updateSortIndicators(activeField, ascending) {
  // Limpiar todos los indicadores
  const headers = resultTable.querySelectorAll('.sortable-header')
  headers.forEach(header => {
    header.classList.remove('sort-active', 'sort-asc-active', 'sort-desc-active')
  })

  // Activar indicador del campo actual
  const activeHeader = resultTable.querySelector(`[data-field="${activeField}"]`)
  if (activeHeader) {
    activeHeader.classList.add('sort-active')
    if (ascending) {
      activeHeader.classList.add('sort-asc-active')
    } else {
      activeHeader.classList.add('sort-desc-active')
    }
  }
}

/**
 * Maneja el evento de click en las cabeceras ordenables
 * @param {Event} event - Evento de click
 */
function handleHeaderClick(event) {
  const header = event.currentTarget
  const fieldName = header.dataset.field
  const dataType = header.dataset.type || getSelectedDataType()

  if (!fieldName) return

  // Determinar dirección de ordenamiento
  let ascending = true
  if (currentSortState.field === fieldName && currentSortState.dataType === dataType) {
    ascending = !currentSortState.ascending
  }

  // Ordenar tabla
  sortTableByField(fieldName, ascending, dataType)
}

/**
 * Obtiene los datos actuales del localStorage según el tipo
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 * @returns {Array<Object>} Datos procesados
 */
function getCurrentData(dataType) {
  const processData = getProcessData();

  if (dataType === 'apk') {
    return processData.data || [];
  } else if (dataType === 'gg') {
    return processData.gg || [];
  }

  return [];
}

/**
 * Guarda los datos ordenados en localStorage
 * @param {Array<Object>} sortedData - Datos ordenados
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 */
function saveCurrentData(sortedData, dataType) {
  const processData = getProcessData();

  if (dataType === 'apk') {
    processData.data = sortedData;
  } else if (dataType === 'gg') {
    processData.gg = sortedData;
  }

  saveProcessData(processData);
}

/**
 * Obtiene el tipo de datos seleccionado actualmente
 * @returns {string} Tipo de datos ('apk' o 'gg')
 */
function getSelectedDataType() {
  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  return selectedOption || 'apk'
}

// ========================================
// MODAL INDIVIDUAL DE REGISTRO
// ========================================

/**
 * Variable para almacenar el registro actualmente editándose en el modal individual
 */
let currentIndividualRecord = null
let currentIndividualDataType = null

/**
 * Abre el modal individual para editar un registro específico
 * @param {Object} record - Registro a editar
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 */
function openIndividualRecordModal(record, dataType) {
  currentIndividualRecord = { ...record } // Crear copia para evitar mutaciones
  currentIndividualDataType = dataType

  // Actualizar el título del modal según el tipo de datos
  const carouselTitle = document.querySelector('.carousel-title')
  if (carouselTitle) {
    carouselTitle.textContent = `Editar Registro ${dataType.toUpperCase()}`
  }

  // Ocultar botones de navegación (anterior/siguiente)
  const navigationButtons = document.querySelectorAll('#prevRecord, #nextRecord, #skipRecord')
  navigationButtons.forEach(btn => {
    btn.style.display = 'none'
  })

  // Actualizar el contador para mostrar "1 de 1"
  const currentIndexSpan = document.querySelector('#currentIndex')
  const totalRecordsSpan = document.querySelector('#totalRecords')
  if (currentIndexSpan) currentIndexSpan.textContent = '1'
  if (totalRecordsSpan) totalRecordsSpan.textContent = '1'

  // Poblar el selector de conceptos
  populateIndividualConceptSelector()

  // Mostrar los datos del registro
  displayIndividualRecord(record, dataType)

  // Actualizar el texto del botón de cambio
  const changeConceptBtn = document.querySelector('#changeConceptBtn')
  if (changeConceptBtn) {
    changeConceptBtn.onclick = () => changeIndividualRecordConcept()
  }

  // Mostrar el modal (reutilizando verifyCarousel)
  verifyCarousel.classList.remove('hidden')
}

/**
 * Cierra el modal individual
 */
function closeIndividualRecordModal() {
  // Restaurar botones de navegación
  const navigationButtons = document.querySelectorAll('#prevRecord, #nextRecord, #skipRecord')
  navigationButtons.forEach(btn => {
    btn.style.display = ''
  })

  // Limpiar variables
  currentIndividualRecord = null
  currentIndividualDataType = null

  // Cerrar modal
  verifyCarousel.classList.add('hidden')
}

/**
 * Pobla el selector de conceptos para el modal individual
 */
function populateIndividualConceptSelector() {
  const concepts = getConceptsFromStorage()
  const conceptSelect = document.querySelector('#conceptSelect')

  // Limpiar opciones existentes excepto la primera
  conceptSelect.innerHTML = '<option value="">Seleccionar concepto...</option>'

  // Ordenar conceptos alfabéticamente
  const sortedConcepts = concepts.sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })

  // Agregar conceptos ordenados como opciones
  sortedConcepts.forEach(concept => {
    const option = document.createElement('option')
    option.value = concept
    option.textContent = concept
    conceptSelect.appendChild(option)
  })
}

/**
 * Muestra los datos del registro individual en el modal
 * @param {Object} record - Registro a mostrar
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 */
function displayIndividualRecord(record, dataType) {
  // Actualizar elementos de datos
  const dataFecha = document.querySelector('#dataFecha')
  const dataProveedor = document.querySelector('#dataProveedor')
  const dataFactura = document.querySelector('#dataFactura')
  const dataConcepto = document.querySelector('#dataConcepto')
  const dataVuelta = document.querySelector('#dataVuelta')

  if (dataFecha) dataFecha.textContent = record.fecha || ''
  if (dataProveedor) dataProveedor.textContent = record.proveedor || ''
  if (dataFactura) dataFactura.textContent = record.factura || ''
  if (dataConcepto) dataConcepto.textContent = record.concepto || ''
  if (dataVuelta) dataVuelta.textContent = record.vuelta || ''

  // Actualizar la etiqueta de "Vuelta"/"Segmento" según el tipo
  const vueltaLabel = document.querySelector('.data-row:last-child .data-label')
  if (vueltaLabel) {
    vueltaLabel.textContent = dataType === 'gg' ? 'Segmento:' : 'Vuelta:'
  }

  // Resetear selector de conceptos
  const conceptSelect = document.querySelector('#conceptSelect')
  if (conceptSelect) conceptSelect.value = ''

  // Validar botón de cambio
  validateIndividualChangeButton()
}

/**
 * Valida si se puede habilitar el botón de cambiar para el modal individual
 */
function validateIndividualChangeButton() {
  const conceptSelect = document.querySelector('#conceptSelect')
  const changeConceptBtn = document.querySelector('#changeConceptBtn')

  if (!conceptSelect || !changeConceptBtn || !currentIndividualRecord) return

  const selectedConcept = conceptSelect.value.trim()
  const currentConcept = currentIndividualRecord.concepto || ''

  // Habilitar solo si se seleccionó un concepto diferente al actual
  changeConceptBtn.disabled = !selectedConcept || selectedConcept === currentConcept
}

/**
 * Cambia el concepto del registro individual
 */
function changeIndividualRecordConcept() {
  if (!currentIndividualRecord || !currentIndividualDataType) return

  const conceptSelect = document.querySelector('#conceptSelect')
  const selectedConcept = conceptSelect.value.trim()

  if (!selectedConcept) {
    showModal('Selecciona un concepto para continuar')
    return
  }

  const currentConcept = currentIndividualRecord.concepto

  if (selectedConcept === currentConcept) {
    showModal('El concepto seleccionado es el mismo que el actual')
    return
  }

  // Actualizar el registro en los datos almacenados
  const data = getCurrentData(currentIndividualDataType)
  const recordIndex = data.findIndex(record => record.id === currentIndividualRecord.id)

  if (recordIndex !== -1) {
    // Actualizar el registro
    data[recordIndex].concepto = selectedConcept

    // Actualizar filtros ANTES de guardar y regenerar tabla
    if (originalTableData.length > 0) {
      // Actualizar datos originales de filtros
      const originalIndex = originalTableData.findIndex(record => record.id === currentIndividualRecord.id)
      if (originalIndex !== -1) {
        originalTableData[originalIndex].concepto = selectedConcept
      }
    }

    // Guardar en localStorage
    saveCurrentData(data, currentIndividualDataType)

    // Actualizar la tabla visible
    updateTableAfterIndividualChange()

    // Reaplicar filtros si están activos
    if (originalTableData.length > 0) {
      applyTableFilters()
    }

    // Mostrar confirmación
    showToast('¡Concepto actualizado correctamente!')

    // Cerrar modal
    closeIndividualRecordModal()
  } else {
    showModal('Error: No se pudo encontrar el registro para actualizar')
  }
}

/**
 * Actualiza la tabla después de cambiar un concepto individual
 */
function updateTableAfterIndividualChange() {
  const data = getCurrentData(currentIndividualDataType)
  const headers = getHeadersForDataType(currentIndividualDataType)
  generateTableFromProcessedData(resultTable, data, headers, currentIndividualDataType)
}

// ========================================
// SISTEMA DE FILTROS DE TABLA
// ========================================

/**
 * Variable global para mantener los datos originales sin filtrar
 */
let originalTableData = []

/**
 * Inicializa los filtros de tabla con los datos actuales
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 * @param {Array<Object>} data - Datos a usar para filtros
 */
function initializeTableFilters(dataType, data) {
  // Guardar datos originales
  originalTableData = [...data]

  // Mostrar sección de filtros si hay datos
  if (data && data.length > 0) {
    tableFilters.classList.remove('hidden')
    populateFilterOptions(dataType, data)
    clearAllTableFilters()
  } else {
    tableFilters.classList.add('hidden')
    originalTableData = []
  }
}

/**
 * Pobla las opciones de los selectores de filtro
 * @param {string} dataType - Tipo de datos ('apk' o 'gg')
 * @param {Array<Object>} data - Datos para extraer opciones únicas
 */
function populateFilterOptions(dataType, data) {
  // Filtro de Concepto - obtener conceptos únicos
  const uniqueConceptos = [...new Set(data.map(record => record.concepto).filter(Boolean))].sort()
  conceptoFilter.innerHTML = '<option value="">Todos los conceptos</option>'
  uniqueConceptos.forEach(concepto => {
    const option = document.createElement('option')
    option.value = concepto
    option.textContent = concepto
    conceptoFilter.appendChild(option)
  })

  // Filtro de Vuelta - solo para APK
  if (dataType === 'apk') {
    vueltaFilterContainer.classList.remove('hidden')
    const uniqueVueltas = [...new Set(data.map(record => record.vuelta).filter(Boolean))].sort()
    vueltaFilter.innerHTML = '<option value="">Todas las vueltas</option>'
    uniqueVueltas.forEach(vuelta => {
      const option = document.createElement('option')
      option.value = vuelta
      option.textContent = vuelta
      vueltaFilter.appendChild(option)
    })
  } else {
    // Para GG, ocultar filtro de vuelta
    vueltaFilterContainer.classList.add('hidden')
  }
}

/**
 * Aplica todos los filtros activos a la tabla
 */
function applyTableFilters() {
  if (originalTableData.length === 0) return

  const proveedorText = proveedorFilter.value.toLowerCase().trim()
  const conceptoSelected = conceptoFilter.value
  const vueltaSelected = vueltaFilter.value

  // Filtrar datos
  let filteredData = originalTableData.filter(record => {
    // Filtro por proveedor (incluye texto, case insensitive)
    const proveedorValue = (record.proveedor || '').toString().toLowerCase()
    const matchesProveedor = !proveedorText || proveedorValue.includes(proveedorText)

    // Filtro por concepto (exacto)
    const matchesConcepto = !conceptoSelected || record.concepto === conceptoSelected

    // Filtro por vuelta (exacto, solo para APK)
    const matchesVuelta = !vueltaSelected || record.vuelta === vueltaSelected

    return matchesProveedor && matchesConcepto && matchesVuelta
  })

  // Actualizar tabla con datos filtrados
  updateTableWithFilteredData(filteredData)

  // Actualizar contador de resultados
  updateFilterResultsCount(filteredData.length, originalTableData.length)

  // Actualizar totales con datos filtrados
  updateTableTotals(originalTableData, filteredData)
}

/**
 * Actualiza la tabla con los datos filtrados
 * @param {Array<Object>} filteredData - Datos filtrados a mostrar
 */
function updateTableWithFilteredData(filteredData) {
  // Obtener tipo de datos actual
  const selectedOption = document.querySelector('input[name="step"]:checked')?.value

  // Regenerar solo el tbody de la tabla
  const tbody = resultTable.querySelector('tbody')
  if (!tbody) return

  tbody.innerHTML = ''

  if (filteredData.length === 0) {
    // Mostrar mensaje de sin resultados
    const tr = document.createElement('tr')
    tr.className = 'no-results-row'
    const colspan = resultTable.querySelector('thead tr')?.children.length || 10
    tr.innerHTML = `
      <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #666; font-style: italic;">
        🔍 No se encontraron registros que coincidan con los filtros aplicados
      </td>
    `
    tbody.appendChild(tr)
    return
  }

  // Crear filas con datos filtrados
  filteredData.forEach((record, index) => {
    const tr = document.createElement('tr')

    // Agregar atributos y event listener para filas clickeables
    tr.setAttribute('data-record-id', record.id)
    tr.setAttribute('data-record-index', index)
    tr.classList.add('table-row-clickable')

    // Determinar tipo de datos actual para el modal
    const currentDataType = getSelectedDataType()
    tr.addEventListener('click', () => {
      openIndividualRecordModal(record, currentDataType)
    })

    Object.entries(record).forEach(([key, value], index) => {
      const td = document.createElement('td')
      // Asegurar que siempre haya contenido, aunque sea vacío
      if (key.toLowerCase().includes('importe')) {
        if (typeof value === 'string') {
          const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''))
          td.textContent = isNaN(numericValue) ? '' : formatCurrency(numericValue)
        } else {
          td.textContent = value === 0 ? '' : formatCurrency(value)
        }
      } else {
        td.textContent = value !== null && value !== undefined ? String(value) : ""
      }
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
}

/**
 * Actualiza el contador de resultados de filtros
 * @param {number} filtered - Cantidad de registros filtrados
 * @param {number} total - Cantidad total de registros
 */
function updateFilterResultsCount(filtered, total) {
  if (filtered === total) {
    filterResultsCount.textContent = `${total} registro${total !== 1 ? 's' : ''}`
  } else {
    filterResultsCount.textContent = `${filtered} de ${total} registro${total !== 1 ? 's' : ''}`
  }
}

/**
 * Limpia todos los filtros aplicados
 */
function clearAllTableFilters() {
  proveedorFilter.value = ''
  conceptoFilter.value = ''
  vueltaFilter.value = ''

  // Mostrar todos los datos originales
  if (originalTableData.length > 0) {
    updateTableWithFilteredData(originalTableData)
    updateFilterResultsCount(originalTableData.length, originalTableData.length)
  }
}

// ========================================
// GESTIÓN DE ESTADOS DE TABLA
// ========================================

/**
 * Actualiza la visualización de la tabla según el tipo de datos seleccionado
 */
function updateTableDisplay() {
  const selectedOption = document.querySelector('input[name="step"]:checked')?.value
  const data = getProcessedDataFromStorage(selectedOption)

  // Actualizar información del encabezado
  const dataTypeText = selectedOption === "apk" ? "APK" : "GG"
  const dataTypeDescription = selectedOption === "apk" ? "Datos de archivos APK procesados" : "Datos de archivos GG procesados"

  tableTitle.textContent = `Datos ${dataTypeText}`
  tableDescription.textContent = dataTypeDescription
  currentTableType.textContent = dataTypeText

  if (data && data.length > 0) {
    showTableWithData(data, selectedOption)
  } else {
    showEmptyTableState()
  }
}

/**
 * Muestra la tabla con datos
 * @param {Array<Object>} data - Datos a mostrar
 * @param {string} dataType - Tipo de datos ("apk" o "gg")
 */
function showTableWithData(data, dataType) {
  // Ocultar estado vacío
  emptyTableState.classList.add("hidden")

  // Mostrar tabla y acciones
  resultTable.classList.remove("hidden")
  tableActions.classList.remove("hidden")

  // Generar contenido de la tabla
  const headers = getHeadersForDataType(dataType)
  generateTableFromProcessedData(resultTable, data, headers, dataType)
}

/**
 * Muestra el estado vacío de la tabla
 */
function showEmptyTableState() {
  // Mostrar estado vacío
  emptyTableState.classList.remove("hidden")

  // Ocultar tabla, acciones, filtros y totales
  resultTable.classList.add("hidden")
  tableActions.classList.add("hidden")
  tableFilters.classList.add("hidden")
  tableTotals.classList.add("hidden")

  // Limpiar datos de filtros
  originalTableData = []
}

/**
 * Inicializa el estado de la tabla al cargar la página
 */
function initializeTableDisplay() {
  // La tabla siempre está visible, solo actualizamos su contenido
  updateTableDisplay()
}

// ========================================
// FUNCIONALIDAD DE COLAPSO DE COMPONENTES
// ========================================

/**
 * Inicializa la funcionalidad de colapso para los componentes
 */
function initializeCollapsibleComponents() {
  // Gestión de Conceptos
  const conceptsHeader = document.querySelector('.concepts-manager .collapsible-header')
  if (conceptsHeader) {
    conceptsHeader.addEventListener('click', () => {
      toggleComponent('concepts-manager')
    })
  }

  // Sustitución Masiva de Conceptos
  const massReplacementHeader = document.querySelector('.mass-replacement-manager .collapsible-header')
  if (massReplacementHeader) {
    massReplacementHeader.addEventListener('click', () => {
      toggleComponent('mass-replacement-manager')
    })
  }

  // Prorrateo de Gastos Generales
  const prorrateoHeader = document.querySelector('.prorrateo-section .collapsible-header')
  if (prorrateoHeader) {
    prorrateoHeader.addEventListener('click', () => {
      toggleProrrateoComponent()
    })
  }
}

/**
 * Alterna el estado de colapso de un componente
 * @param {string} componentClass - Clase del componente a alternar
 */
function toggleComponent(componentClass) {
  const component = document.querySelector(`.${componentClass}`)
  if (!component) return

  const isCollapsed = component.classList.contains('collapsed')

  if (isCollapsed) {
    expandComponent(component)
  } else {
    collapseComponent(component)
  }
}

/**
 * Colapsa un componente
 * @param {HTMLElement} component - Elemento del componente
 */
function collapseComponent(component) {
  const content = component.querySelector('.collapsible-content')
  if (!content) return

  // Obtener altura actual del contenido
  const currentHeight = content.scrollHeight

  // Establecer altura actual temporalmente
  content.style.maxHeight = currentHeight + 'px'

  // Forzar repaint
  content.offsetHeight

  // Agregar clase collapsed
  component.classList.add('collapsed')

  // Animar a altura 0
  requestAnimationFrame(() => {
    content.style.maxHeight = '0'
  })

  // Guardar estado
  const componentClass = component.classList[0]
  saveCollapseState(componentClass, true)
}

/**
 * Expande un componente
 * @param {HTMLElement} component - Elemento del componente
 */
function expandComponent(component) {
  const content = component.querySelector('.collapsible-content')
  if (!content) return

  // Remover clase collapsed
  component.classList.remove('collapsed')

  // Obtener altura natural del contenido
  const naturalHeight = content.scrollHeight

  // Establecer altura máxima para la animación
  content.style.maxHeight = naturalHeight + 'px'

  // Después de la animación, remover la altura fija
  setTimeout(() => {
    content.style.maxHeight = 'none'
  }, 300)

  // Guardar estado
  const componentClass = component.classList[0]
  saveCollapseState(componentClass, false)
}

/**
 * Guarda el estado de colapso en localStorage
 * @param {string} componentId - ID del componente
 * @param {boolean} isCollapsed - Si está colapsado
 */
function saveCollapseState(componentId, isCollapsed) {
  const states = JSON.parse(localStorage.getItem('componentCollapseStates') || '{}')
  states[componentId] = isCollapsed
  localStorage.setItem('componentCollapseStates', JSON.stringify(states))
}

/**
 * Carga el estado de colapso desde localStorage
 * @param {string} componentId - ID del componente
 * @returns {boolean} - Estado de colapso
 */
function loadCollapseState(componentId) {
  const states = JSON.parse(localStorage.getItem('componentCollapseStates') || '{}')
  return states[componentId] || false
}

/**
 * Alterna el estado de colapso del componente de prorrateo
 */
function toggleProrrateoComponent() {
  const prorrateoSection = document.querySelector('.prorrateo-section')
  const content = prorrateoSection.querySelector('.prorrateo-content')
  const indicator = prorrateoSection.querySelector('.collapse-indicator')

  if (!content || !indicator) return

  const isCollapsed = content.classList.contains('collapsed')

  if (isCollapsed) {
    // Expandir
    content.classList.remove('collapsed')
    indicator.textContent = '▼'
    saveCollapseState('prorrateo-section', false)
  } else {
    // Colapsar
    content.classList.add('collapsed')
    indicator.textContent = '▶'
    saveCollapseState('prorrateo-section', true)
  }
}

/**
 * Restaura los estados de colapso guardados
 */
function restoreCollapseStates() {
  // Gestión de Conceptos
  if (loadCollapseState('concepts-manager')) {
    const component = document.querySelector('.concepts-manager')
    if (component) {
      component.classList.add('collapsed')
    }
  }

  // Sustitución Masiva
  if (loadCollapseState('mass-replacement-manager')) {
    const component = document.querySelector('.mass-replacement-manager')
    if (component) {
      component.classList.add('collapsed')
    }
  }

  // Prorrateo de Gastos Generales
  if (loadCollapseState('prorrateo-section')) {
    const content = document.querySelector('.prorrateo-section .prorrateo-content')
    const indicator = document.querySelector('.prorrateo-section .collapse-indicator')
    if (content && indicator) {
      content.classList.add('collapsed')
      indicator.textContent = '▶'
    }
  }
}

// ========================================
// FUNCIONALIDAD DE PRORRATEO
// ========================================

/**
 * Actualiza el estado del botón de confirmación de prorrateo
 */
function updateConfirmProrrateoButton() {
  if (!confirmProrrateoBtn) return

  // Verificar si existen todos los datos necesarios
  const processData = getProcessData()

  const hasMainData = processData.data && processData.data.length > 0
  const hasGgData = processData.gg && processData.gg.length > 0
  const hasSegmentList = processData.segments && processData.segments.length > 0

  const allDataAvailable = hasMainData && hasGgData && hasSegmentList

  confirmProrrateoBtn.disabled = !allDataAvailable

  if (allDataAvailable) {
    confirmProrrateoBtn.textContent = '✓ Confirmar Prorrateo'
    confirmProrrateoBtn.title = 'Todos los datos están listos para el prorrateo'
  } else {
    confirmProrrateoBtn.textContent = '⚠ Datos Incompletos'
    const missing = []
    if (!hasMainData) missing.push('APK')
    if (!hasGgData) missing.push('GG')
    if (!hasSegmentList) missing.push('Segmentos')
    confirmProrrateoBtn.title = `Faltan datos: ${missing.join(', ')}`
  }
}

/**
 * Muestra la sección de prorrateo
 */
function showProrrateoSection() {
  if (!prorrateoSection) return

  // Verificar nuevamente que todos los datos estén disponibles
  if (confirmProrrateoBtn.disabled) {
    showModal('No se pueden generar los datos de prorrateo. Verifica que tengas datos APK, GG y configuración de segmentos.')
    return
  }

  // Mostrar la sección
  prorrateoSection.classList.remove('hidden')

  // Actualizar información del resumen
  updateProrrateoSummary()

  // Scroll hacia la sección
  prorrateoSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Actualiza el resumen de información del prorrateo
 */
function updateProrrateoSummary() {
  try {
    // Obtener datos del proceso actual
    const processData = getProcessData()
    const ggData = processData.gg || []
    const uniqueConcepts = [...new Set(ggData.map(record => record.concepto).filter(Boolean))]

    // Obtener datos de segmentos
    const segmentList = processData.segments || []
    const totalCerdosValue = segmentList.reduce((sum, segment) => sum + (segment.count || 0), 0)

    // Actualizar elementos del resumen
    if (conceptsCount) conceptsCount.textContent = uniqueConcepts.length
    if (vueltasCount) vueltasCount.textContent = segmentList.length
    if (totalCerdos) totalCerdos.textContent = totalCerdosValue.toLocaleString()
    if (registrosGenerados) registrosGenerados.textContent = uniqueConcepts.length * segmentList.length

  } catch (error) {
    console.error('Error actualizando resumen de prorrateo:', error)
  }
}

/**
 * Genera los datos de prorrateo
 */
function generateProrrateoData() {
  try {
    // Obtener datos del proceso actual
    const processData = getProcessData()
    const ggData = processData.gg || []
    const segmentList = processData.segments || []

    if (ggData.length === 0 || segmentList.length === 0) {
      showModal('No hay datos suficientes para generar el prorrateo.')
      return
    }

    // Calcular totales por concepto (incluir valores negativos)
    const conceptTotals = new Map()
    ggData.forEach(record => {
      const concepto = record.concepto
      const importe = parseFloat(record.importe) || 0

      if (concepto && importe !== 0) {
        conceptTotals.set(concepto, (conceptTotals.get(concepto) || 0) + importe)
      }
    })

    // Calcular total de cerdos
    const totalCerdosValue = segmentList.reduce((sum, segment) => sum + (segment.count || 0), 0)

    if (totalCerdosValue === 0) {
      showModal('El total de cerdos no puede ser 0. Verifica la configuración de segmentos.')
      return
    }

    // Generar registros de prorrateo
    const prorrateoRecords = []
    let recordId = 1

    // Obtener fecha (último día del mes anterior)
    const currentDate = new Date()
    // Cambiar prevMonth por currentMonth
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    const fechaProrrateo = formatDateForProrrateo(currentMonth)
    const { monthString, year } = parseDateForProrrateo(currentMonth)

    // Generar registros para cada combinación concepto-vuelta
    conceptTotals.forEach((totalImporte, concepto) => {
      segmentList.forEach(segment => {
        const porcentaje = segment.count / totalCerdosValue
        const importeProrrateo = totalImporte * porcentaje

        const record = {
          id: recordId++,
          fecha: fechaProrrateo,
          egresos: '',
          folio: '',
          proveedor: `${concepto} (prorrateo)`,
          factura: '',
          importe: Math.round(importeProrrateo * 100) / 100, // Redondear a 2 decimales
          concepto: concepto,
          vuelta: segment.segment,
          mes: monthString,
          año: year
        }

        prorrateoRecords.push(record)
      })
    })

    // Guardar datos de prorrateo en la nueva estructura
    processData.prorrateo = prorrateoRecords
    saveProcessData(processData)

    // Generar tabla
    generateProrrateoTable(prorrateoRecords)

    // Actualizar resumen
    if (registrosGenerados) registrosGenerados.textContent = prorrateoRecords.length

    showToast(`¡Prorrateo generado! ${prorrateoRecords.length} registros creados.`)

  } catch (error) {
    console.error('Error generando prorrateo:', error)
    showModal('Error al generar el prorrateo. Verifica que todos los datos sean válidos.')
  }
}

/**
 * Formatea una fecha para el prorrateo en formato DD/Mmm/YYYY
 * @param {Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
function formatDateForProrrateo(date) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const day = String(date.getDate()).padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Parsea una fecha para extraer mes y año
 * @param {Date} date - Fecha a parsear
 * @returns {Object} - Objeto con monthString y year
 */
function parseDateForProrrateo(date) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return {
    monthString: months[date.getMonth()],
    year: date.getFullYear()
  }
}

/**
 * Genera la tabla de prorrateo
 * @param {Array} prorrateoRecords - Datos del prorrateo
 */
function generateProrrateoTable(prorrateoRecords) {
  if (!prorrateoTable) return

  // Ocultar estado vacío y mostrar tabla
  emptyProrrateoState.classList.add('hidden')
  prorrateoTable.classList.remove('hidden')

  // Limpiar tabla
  prorrateoTable.innerHTML = ''

  // Crear encabezados (misma estructura que APK)
  const headers = ['ID', 'Fecha', 'Egresos', 'Folio', 'Proveedor', 'Factura', 'Importe', 'Concepto', 'Vuelta', 'Mes', 'Año']

  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')

  headers.forEach(header => {
    const th = document.createElement('th')
    th.textContent = header
    headerRow.appendChild(th)
  })

  thead.appendChild(headerRow)
  prorrateoTable.appendChild(thead)

  // Crear cuerpo de tabla
  const tbody = document.createElement('tbody')

  prorrateoRecords.forEach(record => {
    const tr = document.createElement('tr')

    // Crear celdas en el orden de los headers
    const values = [
      record.id,
      record.fecha,
      record.egresos,
      record.folio,
      record.proveedor,
      record.factura,
      record.importe,
      record.concepto,
      record.vuelta,
      record.mes,
      record.año
    ]

    values.forEach((value, index) => {
      const td = document.createElement('td')
      if (value !== null && value !== undefined) {
        // Aplicar formato de moneda al campo "Importe" (índice 6)
        if (index === 6) {
          td.textContent = formatCurrency(value)
        } else {
          td.textContent = String(value)
        }
      } else {
        td.textContent = ''
      }
      tr.appendChild(td)
    })

    tbody.appendChild(tr)
  })

  prorrateoTable.appendChild(tbody)

  // Actualizar totales del prorrateo
  updateProrrateoTotals(prorrateoRecords)
}

/**
 * Copia los datos de prorrateo al portapapeles
 */
function copyProrrateoToClipboard() {
  if (!prorrateoTable || prorrateoTable.classList.contains('hidden')) {
    showModal('No hay datos de prorrateo para copiar. Genera primero los datos.')
    return
  }

  const rows = prorrateoTable.querySelectorAll('tr')
  if (rows.length === 0) {
    showModal('La tabla de prorrateo está vacía.')
    return
  }

  let tableText = ''

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('th, td')
    const rowData = Array.from(cells)
      .map(cell => cell.textContent)
      .join('\t')
    tableText += rowData

    if (index < rows.length - 1) {
      tableText += '\n'
    }
  })

  navigator.clipboard
    .writeText(tableText)
    .then(() => {
      showToast('¡Datos de prorrateo copiados al portapapeles!')
    })
    .catch(err => {
      console.error('Error al copiar:', err)
      showModal('Error al copiar los datos al portapapeles.')
    })
}

/**
 * Descarga los datos de prorrateo como archivo Excel
 */
function downloadProrrateoAsExcel() {
  const prorrateoData = localStorage.getItem('prorrateoData')

  if (!prorrateoData) {
    showModal('No hay datos de prorrateo para descargar. Genera primero los datos.')
    return
  }

  try {
    const data = JSON.parse(prorrateoData)

    // Crear workbook
    const wb = XLSX.utils.book_new()

    // Convertir datos a formato de hoja
    const ws = XLSX.utils.json_to_sheet(data)

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Prorrateo')

    // Descargar archivo
    const fileName = `prorrateo_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    showToast('¡Archivo de prorrateo descargado correctamente!')

  } catch (error) {
    console.error('Error descargando archivo:', error)
    showModal('Error al generar el archivo de descarga.')
  }
}