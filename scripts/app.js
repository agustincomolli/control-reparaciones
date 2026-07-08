/**
 * ==========================================================================
 * LÓGICA DE NEGOCIO Y MANIPULACIÓN DEL DOM - CONTROL DE REPARACIONES
 * Aplicación cliente PWA que interactúa con LocalStorage y SheetJS (XLSX).
 * ==========================================================================
 */

// ==========================================
// REGISTRO DE SERVICE WORKER (CICLO PWA)
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('PWA lista de forma local.'))
        .catch(err => console.log('Error al configurar PWA:', err));
}

// ==========================================
// GESTIÓN DE TEMA INTERFAZ (DARK / LIGHT MODE)
// ==========================================
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

// Paths SVG optimizados para renderizado de íconos
const sunIcon = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.03 0-1.41zm-12.37 12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.03 0-1.41z"/>`;
const moonIcon = `<path d="M12.3 22c5.52 0 10-4.48 10-10 0-2.2-.72-4.24-1.93-5.91-.3-.41-.78-.51-1.19-.24-.4.26-.53.78-.29 1.21C20.1 9.26 20.7 11.08 20.7 13c0 4.8-3.9 8.7-8.7 8.7-3.4 0-6.35-1.95-7.8-4.8-.2-.39-.63-.59-1.05-.47-.43.12-.7.52-.64.97C3.51 20.2 7.57 22 12.3 22zM3.5 9.71c.42.14.88-.05 1.06-.46C5.64 6.83 7.64 5 10 5c.42 0 .82.04 1.21.13.44.1.88-.16.98-.6s-.16-.88-.6-.98C11.02 3.43 10.51 3.38 10 3.38c-3.43 0-6.37 2.45-7.1 5.76-.11.45.15.9.6 1.01z"/>`;

// Inicializa el tema basado en las preferencias persistidas del usuario
let currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.innerHTML = moonIcon;
} else {
    themeIcon.innerHTML = sunIcon;
}

/**
 * Escucha el evento click para alternar entre el modo claro y oscuro,
 * modificando el DOM y actualizando el LocalStorage.
 */
themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        themeIcon.innerHTML = sunIcon;
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        themeIcon.innerHTML = moonIcon;
        localStorage.setItem('theme', 'dark');
    }
});

// ==========================================
// PERSISTENCIA DE DATOS Y FLUJO PRINCIPAL
// ==========================================

// Setea por defecto el campo date del HTML con la fecha de hoy en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').value = today;

// Carga inicial del array de reparaciones desde LocalStorage
let repairs = JSON.parse(localStorage.getItem('repairs')) || [];

// Elementos del DOM requeridos para el flujo
const form = document.getElementById('repairForm');
const historyList = document.getElementById('historyList');
const historyFeedback = document.getElementById('historyFeedback');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const feedbackMessage = document.getElementById('feedbackMessage');
const feedbackModal = document.getElementById('feedbackModal');
const feedbackModalTitle = document.getElementById('feedbackModalTitle');
const feedbackModalMessage = document.getElementById('feedbackModalMessage');
const feedbackModalCancel = document.getElementById('feedbackModalCancel');
const feedbackModalConfirm = document.getElementById('feedbackModalConfirm');
let pendingDeleteId = null;

/**
 * Listener de exportación a archivo Excel (.xlsx) de manera puramente local.
 * Convierte el array de objetos de reparación en una hoja de datos tabulada mediante SheetJS.
 */
function showFeedback(message, type = 'success') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message ${type}`;
    clearTimeout(showFeedback.timeoutId);
    showFeedback.timeoutId = setTimeout(() => {
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
    }, 4000);
}

function showHistoryFeedback(message, type = 'error') {
    historyFeedback.textContent = message;
    historyFeedback.className = `history-feedback is-visible ${type}`;
    clearTimeout(showHistoryFeedback.timeoutId);
    showHistoryFeedback.timeoutId = setTimeout(() => {
        historyFeedback.textContent = '';
        historyFeedback.className = 'history-feedback';
    }, 4000);
}

function closeFeedbackModal() {
    feedbackModal.classList.add('is-closing');
    feedbackModal.classList.remove('is-open');
    window.setTimeout(() => {
        feedbackModal.classList.remove('is-closing');
        feedbackModal.setAttribute('aria-hidden', 'true');
        feedbackModalConfirm.onclick = null;
        feedbackModalCancel.onclick = null;
        pendingDeleteId = null;
    }, 180);
}

function openFeedbackModal(message, options = {}) {
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
            const idToDelete = pendingDeleteId;
            closeFeedbackModal();
            if (action) {
                action(idToDelete);
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
}

feedbackModal.addEventListener('click', (event) => {
    if (event.target === feedbackModal) {
        closeFeedbackModal();
    }
});

exportExcelBtn.addEventListener('click', () => {
    if (repairs.length === 0) {
        openFeedbackModal('No hay trabajos registrados para exportar.');
        return;
    }

    // Mapea la estructura interna a un formato con cabeceras amigables y legibles para el reporte Excel
    const dataForExcel = repairs.map(repair => {
        const [year, month, day] = repair.date.split('-');
        return {
            "Fecha": `${day}/${month}/${year}`,
            "Descripción": repair.description,
            "Monto ($)": repair.amount
        };
    });

    // Genera el binario del libro de Excel (.xlsx) en memoria
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reparaciones");

    // Configura el ancho por defecto de las columnas en Excel para evitar que el texto se corte
    worksheet['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }];

    // Dispara la descarga del navegador nativo
    XLSX.writeFile(workbook, "control_reparaciones.xlsx");
    showFeedback('Archivo Excel descargado correctamente.', 'success');
});

/**
 * Manejador del evento Submit del formulario.
 * Captura, valida las entradas del usuario y añade el nuevo objeto al inicio del array.
 */
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amountValue = document.getElementById('amount').value.trim();
    const amount = parseFloat(amountValue);
    const description = document.getElementById('description').value.trim() || 'Reparación';
    const date = document.getElementById('date').value;

    if (!amountValue || Number.isNaN(amount) || amount <= 0) {
        showFeedback('El monto debe ser un número mayor a cero.', 'error');
        document.getElementById('amount').focus();
        return;
    }

    if (!date) {
        showFeedback('Selecciona una fecha válida.', 'error');
        document.getElementById('date').focus();
        return;
    }

    // Estructura interna de la entidad reparación
    const newRepair = {
        id: Date.now(), // ID único basado en timestamp de JS
        amount,
        description,
        date
    };

    // Añade al principio de la lista para mantener orden cronológico descendente en la UI
    repairs.unshift(newRepair);
    localStorage.setItem('repairs', JSON.stringify(repairs));

    // Limpieza de inputs y reseteo al estado inicial por defecto
    form.reset();
    document.getElementById('date').value = today;
    updateApp();
    showFeedback('Trabajo guardado correctamente.', 'success');
});

/**
 * Orquestador global de actualizaciones de la interfaz de usuario.
 */
function updateApp() {
    renderHistory();
    calculateStats();
}

/**
 * Renderiza dinámicamente en el DOM los últimos 10 trabajos agregados al array de reparaciones.
 */
function renderHistory() {
    historyList.classList.add('is-updating');
    historyList.innerHTML = '';

    if (repairs.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:1.1rem; padding: 10px;">No hay registros aún.</p>';
        requestAnimationFrame(() => {
            historyList.classList.remove('is-updating');
        });
        return;
    }

    // Secciona solo los primeros 10 elementos para no sobrecargar el renderizado del DOM en móviles
    repairs.slice(0, 10).forEach(repair => {
        const [year, month, day] = repair.date.split('-');
        const formattedDate = `${day}/${month}/${year}`;

        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
        <div class="item-info">
            <span class="item-desc">${repair.description}</span>
            <span class="item-date">${formattedDate}</span>
        </div>
        <div class="item-actions">
            <div class="item-amount">$${repair.amount.toLocaleString('es-AR')}</div>
            <button type="button" class="delete-btn" data-id="${repair.id}" title="Eliminar trabajo" aria-label="Eliminar trabajo">
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;
        historyList.appendChild(item);
    });

    requestAnimationFrame(() => {
        historyList.classList.remove('is-updating');
    });
}

historyList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-btn');
    if (!deleteButton) return;

    const id = Number(deleteButton.dataset.id);
    pendingDeleteId = id;

    openFeedbackModal('¿Seguro que querés eliminar este trabajo?', {
        title: 'Confirmar eliminación',
        type: 'confirm',
        onConfirm: (idToDelete) => {
            repairs = repairs.filter(repair => repair.id !== idToDelete);
            localStorage.setItem('repairs', JSON.stringify(repairs));
            updateApp();
            showHistoryFeedback('Trabajo eliminado.');
        }
    });
});

/**
 * Procesa el total facturado del mes calendario en curso, así como el promedio mensual general histórico.
 */
function calculateStats() {
    if (repairs.length === 0) {
        document.getElementById('monthTotal').innerText = '$0';
        document.getElementById('monthlyAverage').innerText = '$0';
        return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`; // Formato de control "YYYY-MM"

    let currentMonthTotal = 0;
    let monthlyTotals = {}; // Diccionario acumulador por mes

    repairs.forEach(repair => {
        const yearMonth = repair.date.substring(0, 7); // Extrae "YYYY-MM" del registro

        // Acumula si pertenece exactamente al mes calendario actual
        if (yearMonth === currentYearMonth) {
            currentMonthTotal += repair.amount;
        }

        // Agrupa en el diccionario general histórico para calcular promedios posteriores
        if (!monthlyTotals[yearMonth]) {
            monthlyTotals[yearMonth] = 0;
        }
        monthlyTotals[yearMonth] += repair.amount;
    });

    // Métrica analítica: Cantidad de meses únicos con actividad registrados
    const monthsTracked = Object.keys(monthlyTotals).length;
    const totalEarnedAllTime = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
    const average = monthsTracked > 0 ? (totalEarnedAllTime / monthsTracked) : 0;

    // Pintado en pantalla formateado con la configuración regional de Argentina (es-AR)
    document.getElementById('monthTotal').innerText = `$${currentMonthTotal.toLocaleString('es-AR')}`;
    document.getElementById('monthlyAverage').innerText = `$${Math.round(average).toLocaleString('es-AR')}`;
}

// Disparo del flujo inicial al cargar la aplicación por primera vez en el navegador
updateApp();