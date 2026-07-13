/**
 * ==========================================================================
 * UTILIDADES GENÉRICAS
 * Funciones auxiliares puras (sin efectos secundarios) reutilizadas por
 * varios módulos de la aplicación.
 * ==========================================================================
 */

/**
 * Devuelve la fecha de hoy en formato ISO corto (YYYY-MM-DD), tal como lo
 * espera un <input type="date">.
 *
 * @returns {string} Fecha de hoy, ej: "2026-07-13".
 */
export function getTodayISODate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Convierte una fecha en formato ISO (YYYY-MM-DD) al formato de
 * visualización usado en la interfaz y en el Excel exportado (DD/MM/YYYY).
 *
 * @param {string} isoDate - Fecha en formato "YYYY-MM-DD".
 * @returns {string} Fecha formateada, ej: "13/07/2026".
 */
export function formatDateDMY(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}
