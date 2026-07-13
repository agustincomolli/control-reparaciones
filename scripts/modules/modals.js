/**
 * ==========================================================================
 * DIÁLOGOS (MODALES) DE LA APLICACIÓN
 * Dos modales comparten el mismo patrón de accesibilidad (apertura con
 * foco automático, cierre con Escape, trampa de Tab dentro del diálogo,
 * cierre al hacer click fuera del contenido, y devolución de foco al
 * elemento que abrió el modal):
 *   - feedbackModal: mensajes de aviso y confirmaciones (ej: "¿Eliminar?").
 *   - dataActionsModal: menú de acciones de importar/exportar datos.
 * Este módulo también expone los mensajes de feedback inline (no modales)
 * que aparecen debajo del formulario y encima del historial.
 * ==========================================================================
 */

import {
    feedbackMessage,
    historyFeedback,
    feedbackModal,
    feedbackModalTitle,
    feedbackModalMessage,
    feedbackModalCancel,
    feedbackModalConfirm,
    dataActionsBtn,
    dataActionsModal,
    dataActionsCancel
} from './dom.js';

/** Guarda qué elemento tenía el foco antes de abrir un modal, para devolvérselo al cerrar. */
let lastFocusedElement = null;

/**
 * Muestra un mensaje temporal (4s) debajo del formulario de carga.
 * @param {string} message - Texto a mostrar.
 * @param {'success'|'error'} [type='success'] - Estilo visual del mensaje.
 */
export function showFeedback(message, type = 'success') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message ${type}`;
    clearTimeout(showFeedback.timeoutId);
    showFeedback.timeoutId = setTimeout(() => {
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
    }, 4000);
}

/**
 * Muestra un mensaje temporal (4s) encima del historial (usado para avisos
 * relacionados con el historial, como fallas al eliminar o borrados exitosos).
 * @param {string} message - Texto a mostrar.
 * @param {'error'|'success'} [type='error'] - Estilo visual del mensaje.
 */
export function showHistoryFeedback(message, type = 'error') {
    historyFeedback.textContent = message;
    historyFeedback.className = `history-feedback is-visible ${type}`;
    clearTimeout(showHistoryFeedback.timeoutId);
    showHistoryFeedback.timeoutId = setTimeout(() => {
        historyFeedback.textContent = '';
        historyFeedback.className = 'history-feedback';
    }, 4000);
}

/**
 * Cierra el modal de feedback/confirmación con su animación de salida,
 * limpia los handlers dinámicos de los botones y devuelve el foco.
 */
export function closeFeedbackModal() {
    feedbackModal.classList.add('is-closing');
    feedbackModal.classList.remove('is-open');
    window.setTimeout(() => {
        feedbackModal.classList.remove('is-closing');
        feedbackModal.setAttribute('aria-hidden', 'true');
        feedbackModalConfirm.onclick = null;
        feedbackModalCancel.onclick = null;
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    }, 180);
}

/**
 * Abre el modal de feedback/confirmación.
 *
 * @param {string} message - Texto principal del diálogo.
 * @param {Object} [options]
 * @param {string} [options.title='Aviso'] - Título del diálogo.
 * @param {'info'|'confirm'} [options.type='info'] - "info" muestra solo un
 *   botón "Aceptar". "confirm" muestra "Cancelar" + botón de confirmación.
 * @param {string} [options.confirmText='Confirmar'] - Texto del botón de confirmación.
 * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelar.
 * @param {() => void} [options.onConfirm] - Callback ejecutado si el usuario
 *   confirma (solo aplica cuando type === 'confirm'). Se llama con el modal
 *   ya cerrado. El identificador de qué se está confirmando queda a cargo
 *   de quien llama a openFeedbackModal (por closure), no del modal en sí.
 */
export function openFeedbackModal(message, options = {}) {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    feedbackModalTitle.textContent = options.title || 'Aviso';
    feedbackModalMessage.textContent = message;

    if (options.type === 'confirm') {
        feedbackModalCancel.style.display = 'inline-flex';
        feedbackModalConfirm.style.display = 'inline-flex';
        feedbackModalConfirm.textContent = options.confirmText || 'Confirmar';
        feedbackModalCancel.textContent = options.cancelText || 'Cancelar';

        feedbackModalCancel.onclick = () => closeFeedbackModal();
        feedbackModalConfirm.onclick = () => {
            const action = options.onConfirm;
            closeFeedbackModal();
            if (action) {
                action();
            }
        };
    } else {
        feedbackModalCancel.style.display = 'none';
        feedbackModalConfirm.style.display = 'inline-flex';
        feedbackModalConfirm.textContent = 'Aceptar';
        feedbackModalConfirm.onclick = () => closeFeedbackModal();
        feedbackModalCancel.onclick = null;
    }

    feedbackModal.classList.add('is-open');
    feedbackModal.setAttribute('aria-hidden', 'false');
    feedbackModalConfirm.focus();
}

/**
 * Cierra el modal de importar/exportar datos con su animación de salida y
 * devuelve el foco al elemento que lo abrió.
 */
export function closeDataActionsModal() {
    dataActionsModal.classList.add('is-closing');
    dataActionsModal.classList.remove('is-open');
    window.setTimeout(() => {
        dataActionsModal.classList.remove('is-closing');
        dataActionsModal.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    }, 180);
}

/**
 * Abre el modal de importar/exportar datos y mueve el foco al primer botón
 * de acción disponible.
 */
function openDataActionsModal() {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dataActionsModal.classList.add('is-open');
    dataActionsModal.setAttribute('aria-hidden', 'false');

    const firstActionButton = dataActionsModal.querySelector('button');
    if (firstActionButton) {
        firstActionButton.focus();
    }
}

/**
 * Agrega a un modal el comportamiento de teclado accesible estándar:
 * Escape para cerrar, y Tab/Shift+Tab atrapado entre el primer y el último
 * botón visible (para que el foco no se "escape" del diálogo mientras está
 * abierto).
 *
 * @param {HTMLElement} modalElement - Contenedor del modal.
 * @param {() => void} closeFn - Función a llamar para cerrar el modal.
 */
function attachModalKeyboardTrap(modalElement, closeFn) {
    modalElement.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeFn();
            return;
        }

        if (event.key === 'Tab') {
            const focusableButtons = modalElement.querySelectorAll('button');
            const firstButton = focusableButtons[0];
            const lastButton = focusableButtons[focusableButtons.length - 1];

            if (event.shiftKey && document.activeElement === firstButton) {
                event.preventDefault();
                lastButton.focus();
            } else if (!event.shiftKey && document.activeElement === lastButton) {
                event.preventDefault();
                firstButton.focus();
            }
        }
    });
}

/**
 * Conecta todos los listeners de ambos modales (botones que los abren/cierran,
 * click fuera del contenido, teclado accesible). Debe llamarse una única vez
 * al arrancar la aplicación.
 */
export function initModals() {
    feedbackModal.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
    attachModalKeyboardTrap(feedbackModal, closeFeedbackModal);

    dataActionsBtn.addEventListener('click', openDataActionsModal);
    dataActionsCancel.addEventListener('click', closeDataActionsModal);
    dataActionsModal.addEventListener('click', (event) => {
        if (event.target === dataActionsModal) {
            closeDataActionsModal();
        }
    });
    attachModalKeyboardTrap(dataActionsModal, closeDataActionsModal);
}
