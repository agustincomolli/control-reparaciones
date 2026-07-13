/**
 * ==========================================================================
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * Registra el Service Worker, inicializa cada módulo de funcionalidad y
 * dispara el primer renderizado. Este archivo no contiene lógica de
 * negocio propia: solo conecta los módulos entre sí ("composition root").
 *
 * Cargado desde index.html como <script type="module">, por lo que todos
 * los imports de abajo se resuelven como módulos ES6 nativos del navegador
 * (sin necesidad de bundler). Importante: esto requiere servir la app desde
 * un servidor HTTP local (ver README) — abrir index.html con doble clic
 * (protocolo file://) hace que el navegador bloquee los módulos por CORS.
 * ==========================================================================
 */

import { initTheme } from './modules/theme.js';
import { initModals } from './modules/modals.js';
import { renderHistory, initHistoryDeletion } from './modules/repairs-history.js';
import { calculateStats } from './modules/stats.js';
import { initRepairForm } from './modules/repairs-form.js';
import { initDataTransfer } from './modules/data-transfer.js';

/**
 * Registra el Service Worker (habilita el funcionamiento offline y la
 * instalación como PWA). Si el navegador no lo soporta, no hace nada.
 */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('PWA lista de forma local.'))
        .catch((err) => console.log('Error al configurar PWA:', err));
}

/**
 * Orquestador global: vuelve a renderizar el historial y recalcular las
 * estadísticas. Se pasa como callback a los módulos que modifican los
 * datos (formulario, borrado, importación), así ninguno de ellos necesita
 * conocer la existencia de los demás.
 */
function updateApp() {
    renderHistory();
    calculateStats();
}

registerServiceWorker();
initTheme();
initModals();
initHistoryDeletion(updateApp);
initRepairForm(updateApp);
initDataTransfer(updateApp);

// Primer renderizado al cargar la página.
updateApp();
