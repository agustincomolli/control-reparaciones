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

/** Tipografía usada en toda la app (ver styles/style.css), aplicada también al Excel exportado. */
const FONT_NAME = 'Segoe UI';

/**
 * Descarga un recurso estático del propio proyecto (por ejemplo un logo) y
 * lo devuelve codificado en base64, formato que ExcelJS puede insertar como
 * imagen incrustada en el archivo. Se usa fetch() en vez de leer un archivo
 * porque este código corre en el navegador, no en Node.
 *
 * @param {string} path - Ruta relativa del recurso (ej: 'assets/images/logo.png').
 * @returns {Promise<string>} Contenido del archivo codificado en base64.
 */
async function fetchAssetAsBase64(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`No se pudo cargar el recurso "${path}" (HTTP ${response.status}).`);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // btoa() no acepta bytes arbitrarios directamente, así que se arma el
    // string binario en bloques para no exceder el límite de argumentos de
    // String.fromCharCode con imágenes grandes.
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

/**
 * Construye y descarga un archivo Excel (.xlsx) con todas las reparaciones,
 * usando ExcelJS (cargado globalmente desde CDN, ver index.html). Reutiliza
 * la identidad visual de la app: mismo nombre, tipografía, ícono en el
 * título y la marca "Diseñado por Agustín Comolli" con logo circular al pie,
 * igual que el footer de la interfaz.
 */
async function exportToExcel() {
    const repairs = getRepairs();
    if (repairs.length === 0) {
        openFeedbackModal('No hay trabajos registrados para exportar.');
        return;
    }

    try {
        const [logoBase64, footerLogoBase64] = await Promise.all([
            fetchAssetAsBase64('assets/images/logo.png'),
            fetchAssetAsBase64('assets/images/logo-brand-circle.png')
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Control de Reparaciones';
        const worksheet = workbook.addWorksheet('Reparaciones');

        // La columna A queda como margen izquierdo reservado para el logo
        // del título; los datos van en B, C y D.
        worksheet.columns = [
            { key: 'margin', width: 11 },
            { key: 'fecha', width: 16 },
            { key: 'desc', width: 50 },
            { key: 'monto', width: 18 }
        ];

        // Una sola página de ancho al imprimir (la columna Descripción es
        // ancha y, sin esto, el archivo se parte en 2 páginas horizontales).
        worksheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0
        };

        // ---- Título con el logo de la app a la izquierda ----
        worksheet.getRow(1).height = 24;
        worksheet.getRow(2).height = 24;

        worksheet.mergeCells('B1:D2');
        const titleCell = worksheet.getCell('B1');
        titleCell.value = 'Control de Reparaciones';
        titleCell.font = { name: FONT_NAME, size: 18, bold: true, color: { argb: 'FF2D3748' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        const logoImageId = workbook.addImage({ base64: logoBase64, extension: 'png' });
        worksheet.addImage(logoImageId, {
            tl: { col: 0.15, row: 0.15 },
            ext: { width: 64, height: 64 }
        });

        // ---- Encabezados (fila 4, dejando una fila en blanco de separación) ----
        const headerRowIndex = 4;
        worksheet.getRow(headerRowIndex).values = ['', 'Fecha', 'Descripción', 'Monto ($)'];
        const headerRow = worksheet.getRow(headerRowIndex);
        headerRow.font = { name: FONT_NAME, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        // ---- Filas de datos ----
        // El alineado vertical se fija acá, por fila, en vez de con un
        // barrido global al final: ExcelJS reemplaza por completo el
        // "alignment" de cada celda de una fila cuando se asigna a nivel de
        // fila, así que un barrido posterior pisaría (y de hecho pisaba, en
        // una versión anterior de este export) el horizontal:'center' ya
        // fijado en el título y en el encabezado.
        let rowIndex = headerRowIndex + 1;
        repairs.forEach((repair) => {
            const row = worksheet.getRow(rowIndex);
            row.getCell(2).value = formatDateDMY(repair.date);
            row.getCell(3).value = repair.description;
            row.getCell(4).value = repair.amount;
            row.getCell(4).numFmt = '#,##0.00';
            row.font = { name: FONT_NAME };
            row.alignment = { vertical: 'middle' };
            rowIndex++;
        });

        for (let i = headerRowIndex; i < rowIndex; i++) {
            const row = worksheet.getRow(i);
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
            });
        }

        // ---- Pie de página: logo circular + "Diseñado por" / "Agustín Comolli" ----
        // Réplica del footer de la interfaz (ver .footer-brand en style.css):
        // avatar redondo a la izquierda, título chico arriba, nombre en
        // negrita abajo. Se ubica a partir de la columna C, que por ser la
        // más ancha de la tabla deja el bloque visualmente cerca del centro.
        const footerRowIndex = rowIndex + 2;

        worksheet.mergeCells(`C${footerRowIndex}:D${footerRowIndex}`);
        const footerTitleCell = worksheet.getCell(`C${footerRowIndex}`);
        footerTitleCell.value = 'Diseñado por';
        footerTitleCell.font = { name: FONT_NAME, size: 9, bold: true, color: { argb: 'FF718096' } };
        footerTitleCell.alignment = { horizontal: 'left', vertical: 'bottom', indent: 9 };

        worksheet.mergeCells(`C${footerRowIndex + 1}:D${footerRowIndex + 1}`);
        const footerNameCell = worksheet.getCell(`C${footerRowIndex + 1}`);
        footerNameCell.value = 'Agustín Comolli';
        footerNameCell.font = { name: FONT_NAME, size: 12, bold: true, color: { argb: 'FF2D3748' } };
        footerNameCell.alignment = { horizontal: 'left', vertical: 'top', indent: 9 };

        const footerLogoImageId = workbook.addImage({ base64: footerLogoBase64, extension: 'png' });
        worksheet.addImage(footerLogoImageId, {
            tl: { col: 2.05, row: footerRowIndex - 1 + 0.1 },
            ext: { width: 46, height: 46 }
        });

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
