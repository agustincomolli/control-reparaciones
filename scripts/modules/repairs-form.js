/**
 * ==========================================================================
 * FORMULARIO DE CARGA DE TRABAJOS
 * Valida y agrega nuevas reparaciones al historial a partir del formulario
 * principal (monto, descripción y fecha).
 * ==========================================================================
 */

import { form, amountInput, descriptionInput, dateInput } from './dom.js';
import { getRepairs, persistRepairs } from './repairs-store.js';
import { showFeedback } from './modals.js';
import { getTodayISODate } from './utils.js';

/** Acepta números positivos con hasta 2 decimales (ej: "1500", "1500.5", "1500.50"). */
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const MAX_AMOUNT = 999999999.99;

/**
 * Valida los datos crudos del formulario.
 *
 * @param {string} amountValue - Valor crudo del input de monto.
 * @param {string} date - Valor crudo del input de fecha (YYYY-MM-DD).
 * @param {string} today - Fecha de hoy en formato ISO, límite superior permitido.
 * @returns {{valid: true, amount: number} | {valid: false, message: string, field: 'amount'|'date'}}
 */
function validateRepairInput(amountValue, date, today) {
    const amount = parseFloat(amountValue);

    if (!amountValue || !AMOUNT_PATTERN.test(amountValue) || Number.isNaN(amount) || amount <= 0 || amount > MAX_AMOUNT) {
        return { valid: false, field: 'amount', message: 'El monto debe ser un número mayor a cero y con hasta 2 decimales.' };
    }

    if (!date) {
        return { valid: false, field: 'date', message: 'Selecciona una fecha válida.' };
    }

    const selectedDate = new Date(`${date}T00:00:00`);
    const todayDate = new Date(`${today}T00:00:00`);
    if (selectedDate > todayDate) {
        return { valid: false, field: 'date', message: 'No se pueden registrar trabajos con fecha futura.' };
    }

    return { valid: true, amount };
}

/**
 * Inicializa el formulario: fija la fecha por defecto en "hoy" y conecta el
 * listener de envío. Debe llamarse una única vez al arrancar la aplicación.
 *
 * @param {() => void} onRepairAdded - Callback ejecutado tras guardar un
 *   trabajo con éxito (normalmente updateApp, para refrescar historial y
 *   estadísticas).
 */
export function initRepairForm(onRepairAdded) {
    // "today" se calcula una sola vez al iniciar la app (igual que en la
    // versión anterior), no en cada envío. Si la app queda abierta pasada
    // la medianoche, la fecha máxima permitida no se actualiza sola: es el
    // mismo comportamiento que ya tenía la versión sin modularizar.
    const today = getTodayISODate();
    dateInput.value = today;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const amountValue = amountInput.value.trim();
        const description = descriptionInput.value.trim() || 'Reparación';
        const date = dateInput.value;

        const validation = validateRepairInput(amountValue, date, today);
        if (!validation.valid) {
            showFeedback(validation.message, 'error');
            (validation.field === 'amount' ? amountInput : dateInput).focus();
            return;
        }

        const newRepair = {
            id: Date.now(),
            amount: validation.amount,
            description,
            date
        };

        const nextRepairs = [newRepair, ...getRepairs()];
        if (!persistRepairs(nextRepairs)) {
            showFeedback('No se pudo guardar el trabajo. Verificá el espacio disponible o los permisos del navegador.', 'error');
            return;
        }

        form.reset();
        dateInput.value = today;
        onRepairAdded();
        showFeedback('Trabajo guardado correctamente.', 'success');
    });
}
