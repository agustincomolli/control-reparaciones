/**
 * ==========================================================================
 * ESTADÍSTICAS
 * Calcula y muestra el total facturado del mes en curso y el promedio
 * mensual histórico (promedio entre todos los meses en los que hubo al
 * menos un trabajo registrado).
 * ==========================================================================
 */

import { monthTotalElement, monthlyAverageElement } from './dom.js';
import { getRepairs } from './repairs-store.js';

/**
 * Recalcula y renderiza las dos tarjetas de estadísticas ("Este mes" y
 * "Promedio"). Debe llamarse cada vez que el array de reparaciones cambia.
 */
export function calculateStats() {
    const repairs = getRepairs();

    if (repairs.length === 0) {
        monthTotalElement.innerText = '$0';
        monthlyAverageElement.innerText = '$0';
        return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`;

    let currentMonthTotal = 0;
    /** Acumula el total facturado por cada mes ("YYYY-MM" -> monto). */
    const monthlyTotals = {};

    repairs.forEach((repair) => {
        const yearMonth = repair.date.substring(0, 7);

        if (yearMonth === currentYearMonth) {
            currentMonthTotal += repair.amount;
        }

        if (!monthlyTotals[yearMonth]) {
            monthlyTotals[yearMonth] = 0;
        }
        monthlyTotals[yearMonth] += repair.amount;
    });

    const monthsTracked = Object.keys(monthlyTotals).length;
    const totalEarnedAllTime = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
    const average = monthsTracked > 0 ? (totalEarnedAllTime / monthsTracked) : 0;

    monthTotalElement.innerText = `$${currentMonthTotal.toLocaleString('es-AR')}`;
    monthlyAverageElement.innerText = `$${Math.round(average).toLocaleString('es-AR')}`;
}
