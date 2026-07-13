/**
 * ==========================================================================
 * PERSISTENCIA EN LOCALSTORAGE
 * Envoltorios (wrappers) seguros sobre la API de localStorage. Nunca se
 * accede a localStorage directamente desde el resto de la app: siempre a
 * través de estas funciones, que capturan errores (cuota excedida, modo
 * privado/incógnito que bloquea el storage, etc.) sin romper la interfaz.
 * ==========================================================================
 */

/**
 * Lee y parsea un valor JSON guardado en localStorage.
 *
 * @param {string} key - Clave de localStorage a leer.
 * @param {*} fallbackValue - Valor a devolver si la clave no existe o falla la lectura.
 * @returns {*} El valor parseado, o fallbackValue si no se pudo leer.
 */
export function safeStorageGet(key, fallbackValue) {
    try {
        const rawValue = localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (error) {
        console.error(`No se pudo leer ${key}:`, error);
        return fallbackValue;
    }
}

/**
 * Serializa y guarda un valor en localStorage.
 *
 * @param {string} key - Clave bajo la cual guardar el valor.
 * @param {*} value - Valor a serializar con JSON.stringify.
 * @returns {boolean} true si se guardó correctamente, false si falló.
 */
export function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`No se pudo guardar ${key}:`, error);
        return false;
    }
}

/**
 * Guarda la preferencia de tema (claro/oscuro) del usuario.
 * Se mantiene separada de safeStorageSet porque el tema se guarda como
 * texto plano ("light"/"dark"), no como JSON.
 *
 * @param {'light'|'dark'} theme - Tema a persistir.
 * @returns {boolean} true si se guardó correctamente, false si falló.
 */
export function safeThemeSet(theme) {
    try {
        localStorage.setItem('theme', theme);
        return true;
    } catch (error) {
        console.error('No se pudo persistir el tema:', error);
        return false;
    }
}
