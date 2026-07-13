/**
 * ==========================================================================
 * ALMACÉN DE REPARACIONES (CAPA DE DATOS)
 * Única fuente de verdad para el array de reparaciones en memoria. Ningún
 * otro módulo debe leer o escribir "repairs" directamente en localStorage:
 * todos pasan por getRepairs()/persistRepairs() para mantener la copia en
 * memoria y la copia persistida siempre sincronizadas.
 * ==========================================================================
 */

import { safeStorageGet, safeStorageSet } from './storage.js';

/**
 * @typedef {Object} Repair
 * @property {number} id - Identificador único (timestamp de creación).
 * @property {number} amount - Monto cobrado.
 * @property {string} description - Descripción del trabajo.
 * @property {string} date - Fecha en formato ISO "YYYY-MM-DD".
 */

/** @type {Repair[]} Copia en memoria de las reparaciones guardadas. */
let repairs = safeStorageGet('repairs', []);

/**
 * Devuelve el array de reparaciones actualmente en memoria.
 * Nota: es la referencia interna del módulo. Para modificar los datos,
 * construí un array NUEVO (no lo mutes con push/unshift/splice) y pasalo
 * a persistRepairs().
 *
 * @returns {Repair[]} Lista de reparaciones.
 */
export function getRepairs() {
    return repairs;
}

/**
 * Guarda un nuevo array de reparaciones en localStorage y, solo si el
 * guardado fue exitoso, actualiza también la copia en memoria. Si falla
 * (por ejemplo por cuota excedida), el estado en memoria no cambia, evitando
 * que la interfaz llegue a mostrar datos que en realidad no se guardaron.
 *
 * @param {Repair[]} nextRepairs - Nuevo array completo de reparaciones.
 * @returns {boolean} true si se persistió correctamente.
 */
export function persistRepairs(nextRepairs) {
    const success = safeStorageSet('repairs', nextRepairs);
    if (success) {
        repairs = nextRepairs;
    }
    return success;
}
