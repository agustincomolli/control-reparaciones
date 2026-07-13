/**
 * ==========================================================================
 * TRANSFERENCIA DE DATOS (RESPALDO JSON Y EXPORTACIÓN A EXCEL)
 * Todo lo relacionado con sacar datos de la app (Excel, respaldo JSON) o
 * traerlos de vuelta (importar respaldo JSON). Usa la librería ExcelJS,
 * cargada globalmente desde CDN en index.html (por eso no se importa acá:
 * se accede a través de la variable global `ExcelJS`).
 * ==========================================================================
 */

import { exportExcelBtn, exportJsonBtn, importJsonBtn, importBackupInput } from './dom.js';
import { getRepairs, persistRepairs } from './repairs-store.js';
import { showFeedback, openFeedbackModal, closeDataActionsModal } from './modals.js';
import { formatDateDMY } from './utils.js';

/**
 * Dispara la descarga de un archivo en el navegador a partir de su
 * contenido (texto o buffer binario).
 *
 * @param {BlobPart} content - Contenido del archivo.
 * @param {string} filename - Nombre sugerido para la descarga.
 * @param {string} mimeType - Tipo MIME del contenido.
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Exporta todas las reparaciones a un archivo .json de respaldo, que luego
 * puede volver a importarse con importBackup().
 */
function exportBackup() {
    const repairs = getRepairs();
    if (repairs.length === 0) {
        openFeedbackModal('No hay trabajos registrados para exportar.');
        return;
    }

    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        repairs
    };

    downloadFile(JSON.stringify(backup, null, 2), 'control-reparaciones-backup.json', 'application/json;charset=utf-8');
    showFeedback('Respaldo exportado correctamente.', 'success');
}

/**
 * Normaliza y valida un array crudo (proveniente de un JSON importado) para
 * asegurarse de que cada reparación tenga los campos correctos. Los
 * registros inválidos (fecha mal formada, monto no positivo, etc.) se
 * descartan silenciosamente en vez de romper toda la importación.
 *
 * @param {Array<Object>} rawRepairs - Datos crudos leídos del archivo.
 * @returns {import('./repairs-store.js').Repair[]} Reparaciones válidas y normalizadas.
 */
function normalizeImportedRepairs(rawRepairs) {
    return rawRepairs
        .filter(Boolean)
        .map((repair) => {
            const amount = Number(repair.amount);
            const description = typeof repair.description === 'string' ? repair.description.trim() : '';
            const date = typeof repair.date === 'string' ? repair.date.slice(0, 10) : '';
            const id = Number.isFinite(repair.id) ? repair.id : Date.now() + Math.random();

            return { id, amount, description, date };
        })
        .filter((repair) => {
            return repair.description
                && repair.date
                && repair.amount > 0
                && /^\d{4}-\d{2}-\d{2}$/.test(repair.date)
                && !Number.isNaN(Date.parse(repair.date));
        });
}

/**
 * Lee un archivo .json de respaldo elegido por el usuario y reemplaza todas
 * las reparaciones actuales por las del archivo (tras validarlas).
 *
 * @param {Event} event - Evento "change" del <input type="file">.
 * @param {() => void} onImported - Callback ejecutado tras importar con éxito.
 */
function importBackup(event, onImported) {
    const [file] = event.target.files || [];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            const importedRepairs = Array.isArray(parsed) ? parsed : parsed.repairs;

            if (!Array.isArray(importedRepairs)) {
                throw new Error('El archivo no tiene un formato de respaldo válido.');
            }

            const normalizedRepairs = normalizeImportedRepairs(importedRepairs);

            if (normalizedRepairs.length === 0) {
                throw new Error('No se encontraron registros válidos para importar.');
            }

            if (!persistRepairs(normalizedRepairs)) {
                throw new Error('No se pudo guardar el respaldo importado.');
            }

            onImported();
            showFeedback('Respaldo importado correctamente.', 'success');
        } catch (error) {
            console.error('Import backup failed:', error);
            showFeedback('No se pudo importar el respaldo. Verificá el archivo.', 'error');
        } finally {
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}

/**
 * Construye y descarga un archivo Excel (.xlsx) con todas las reparaciones,
 * usando ExcelJS (cargado globalmente desde CDN, ver index.html).
 */
async function exportToExcel() {
    const repairs = getRepairs();
    if (repairs.length === 0) {
        openFeedbackModal('No hay trabajos registrados para exportar.');
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Control de Reparaciones';
        const worksheet = workbook.addWorksheet('Reparaciones');

        // Título grande, combinado sobre las primeras dos filas.
        worksheet.mergeCells('A1:C2');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'Control de Reparaciones';
        titleCell.font = { size: 18, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Encabezados estilados (fila 4, dejando una fila en blanco de separación).
        const headerRowIndex = 4;
        worksheet.getRow(headerRowIndex).values = ['Fecha', 'Descripción', 'Monto ($)'];
        const headerRow = worksheet.getRow(headerRowIndex);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        worksheet.columns = [
            { key: 'fecha', width: 16 },
            { key: 'desc', width: 50 },
            { key: 'monto', width: 18 }
        ];

        let rowIndex = headerRowIndex + 1;
        repairs.forEach((repair) => {
            const row = worksheet.getRow(rowIndex);
            row.getCell(1).value = formatDateDMY(repair.date);
            row.getCell(2).value = repair.description;
            row.getCell(3).value = repair.amount;
            row.getCell(3).numFmt = '#,##0.00';
            rowIndex++;
        });

        worksheet.eachRow({ includeEmpty: false }, (row) => {
            row.alignment = { vertical: 'middle' };
        });

        // Pie de página, dejando una fila en blanco de separación tras los datos.
        const footerRowIndex = rowIndex + 2;
        worksheet.mergeCells(`A${footerRowIndex}:C${footerRowIndex}`);
        const footerCell = worksheet.getCell(`A${footerRowIndex}`);
        footerCell.value = 'Diseñado por Agustín Comolli';
        footerCell.font = { italic: true, color: { argb: 'FF6B7280' } };
        footerCell.alignment = { horizontal: 'left' };

        for (let i = headerRowIndex; i < rowIndex; i++) {
            const row = worksheet.getRow(i);
            row.eachCell((cell) => {
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        downloadFile(
            buffer,
            'control_reparaciones.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        showFeedback('Archivo Excel descargado correctamente.', 'success');
    } catch (err) {
        console.error('Export ExcelJS failed:', err);
        showFeedback('No se pudo generar el archivo Excel.', 'error');
    }
}

/**
 * Conecta los listeners de los tres botones de import/export dentro del
 * modal de datos. Debe llamarse una única vez al arrancar la aplicación.
 *
 * @param {() => void} onDataChanged - Callback ejecutado cuando cambian los
 *   datos (solo relevante tras una importación exitosa).
 */
export function initDataTransfer(onDataChanged) {
    exportJsonBtn.addEventListener('click', () => {
        closeDataActionsModal();
        exportBackup();
    });

    importJsonBtn.addEventListener('click', () => {
        closeDataActionsModal();
        importBackupInput.click();
    });

    importBackupInput.addEventListener('change', (event) => importBackup(event, onDataChanged));

    exportExcelBtn.addEventListener('click', () => {
        closeDataActionsModal();
        exportToExcel();
    });
}
