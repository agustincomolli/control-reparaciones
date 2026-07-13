/**
 * ==========================================================================
 * REFERENCIAS AL DOM
 * Punto único de acceso a los elementos del HTML. Ningún otro módulo debería
 * usar document.getElementById directamente: todos importan sus referencias
 * desde acá. Esto evita errores de tipeo duplicados y centraliza el chequeo
 * de que el HTML y el JS estén sincronizados.
 * ==========================================================================
 */

/**
 * Busca un elemento por id y lanza un error explícito si no existe.
 * Preferible a que la app falle más adelante con un TypeError críptico
 * ("Cannot read properties of null") en un punto lejano del código.
 *
 * @param {string} id - Id del elemento HTML a buscar.
 * @returns {HTMLElement} El elemento encontrado.
 * @throws {Error} Si no existe ningún elemento con ese id.
 */
export function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`No se encontró el elemento con id "${id}".`);
    }
    return element;
}

// ---- Cabecera y selector de tema ----
export const themeBtn = getRequiredElement('themeBtn');
export const themeIcon = getRequiredElement('themeIcon');

// ---- Formulario de carga de trabajos ----
export const form = getRequiredElement('repairForm');
export const amountInput = getRequiredElement('amount');
export const descriptionInput = getRequiredElement('description');
export const dateInput = getRequiredElement('date');
export const feedbackMessage = getRequiredElement('feedbackMessage');

// ---- Historial de trabajos ----
export const historyList = getRequiredElement('historyList');
export const historyFeedback = getRequiredElement('historyFeedback');

// ---- Estadísticas ----
export const monthTotalElement = getRequiredElement('monthTotal');
export const monthlyAverageElement = getRequiredElement('monthlyAverage');

// ---- Modal genérico de feedback / confirmación ----
export const feedbackModal = getRequiredElement('feedbackModal');
export const feedbackModalTitle = getRequiredElement('feedbackModalTitle');
export const feedbackModalMessage = getRequiredElement('feedbackModalMessage');
export const feedbackModalCancel = getRequiredElement('feedbackModalCancel');
export const feedbackModalConfirm = getRequiredElement('feedbackModalConfirm');

// ---- Modal de importar/exportar datos ----
export const dataActionsBtn = getRequiredElement('dataActionsBtn');
export const dataActionsModal = getRequiredElement('dataActionsModal');
export const dataActionsCancel = getRequiredElement('dataActionsCancel');
export const exportExcelBtn = getRequiredElement('exportExcelBtn');
export const exportJsonBtn = getRequiredElement('exportJsonBtn');
export const importJsonBtn = getRequiredElement('importJsonBtn');
export const importBackupInput = getRequiredElement('importBackupInput');
