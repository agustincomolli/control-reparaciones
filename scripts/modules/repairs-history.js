/**
 * ==========================================================================
 * HISTORIAL DE REPARACIONES
 * Renderiza la lista de los últimos trabajos y gestiona el flujo de
 * eliminación (con confirmación previa mediante el modal de feedback).
 * ==========================================================================
 */

import { historyList } from './dom.js';
import { getRepairs, persistRepairs } from './repairs-store.js';
import { openFeedbackModal, showFeedback, showHistoryFeedback } from './modals.js';
import { formatDateDMY } from './utils.js';

/** Cantidad máxima de trabajos que se muestran en el historial visible. */
const MAX_VISIBLE_ITEMS = 10;

/**
 * Crea el nodo DOM de una fila del historial para una reparación.
 * @param {import('./repairs-store.js').Repair} repair
 * @returns {HTMLElement}
 */
function createHistoryItem(repair) {
    const item = document.createElement('div');
    item.className = 'item';

    const itemInfo = document.createElement('div');
    itemInfo.className = 'item-info';

    const descriptionSpan = document.createElement('span');
    descriptionSpan.className = 'item-desc';
    descriptionSpan.textContent = repair.description;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'item-date';
    dateSpan.textContent = formatDateDMY(repair.date);

    itemInfo.append(descriptionSpan, dateSpan);

    const itemActions = document.createElement('div');
    itemActions.className = 'item-actions';

    const amountDiv = document.createElement('div');
    amountDiv.className = 'item-amount';
    amountDiv.textContent = `$${repair.amount.toLocaleString('es-AR')}`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.dataset.id = String(repair.id);
    deleteButton.title = 'Eliminar trabajo';
    deleteButton.setAttribute('aria-label', 'Eliminar trabajo');
    deleteButton.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>`;

    itemActions.append(amountDiv, deleteButton);
    item.append(itemInfo, itemActions);
    return item;
}

/**
 * Renderiza en el DOM los últimos MAX_VISIBLE_ITEMS trabajos, ordenados por
 * fecha descendente (y por descripción como criterio de desempate).
 * Debe llamarse cada vez que el array de reparaciones cambia.
 */
export function renderHistory() {
    historyList.classList.add('is-updating');
    historyList.innerHTML = '';

    const repairs = getRepairs();

    if (repairs.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:1.1rem; padding: 10px;">No hay registros aún.</p>';
        requestAnimationFrame(() => {
            historyList.classList.remove('is-updating');
        });
        return;
    }

    const sortedRepairs = [...repairs]
        .sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return a.description.localeCompare(b.description, 'es', { sensitivity: 'base' });
        })
        .slice(0, MAX_VISIBLE_ITEMS);

    sortedRepairs.forEach((repair) => {
        historyList.appendChild(createHistoryItem(repair));
    });

    requestAnimationFrame(() => {
        historyList.classList.remove('is-updating');
    });
}

/**
 * Conecta el listener de eliminación en la lista de historial (delegación
 * de eventos sobre el contenedor, ya que las filas se recrean en cada
 * render). Pide confirmación antes de borrar y refresca la interfaz al
 * finalizar. Debe llamarse una única vez al arrancar la aplicación.
 *
 * @param {() => void} onRepairDeleted - Callback ejecutado tras un borrado
 *   exitoso (normalmente updateApp, para volver a renderizar y recalcular
 *   estadísticas).
 */
export function initHistoryDeletion(onRepairDeleted) {
    historyList.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-btn');
        if (!deleteButton) return;

        const id = Number(deleteButton.dataset.id);

        openFeedbackModal('¿Seguro que querés eliminar este trabajo?', {
            title: 'Confirmar eliminación',
            type: 'confirm',
            onConfirm: () => {
                const nextRepairs = getRepairs().filter((repair) => repair.id !== id);
                if (!persistRepairs(nextRepairs)) {
                    showFeedback('No se pudo eliminar el trabajo. Revisá el almacenamiento del navegador.', 'error');
                    return;
                }
                onRepairDeleted();
                showHistoryFeedback('Trabajo eliminado.');
            }
        });
    });
}
