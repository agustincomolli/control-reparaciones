/**
 * ==========================================================================
 * TEMA DE INTERFAZ (MODO CLARO / OSCURO)
 * Gestiona el ícono de sol/luna, la clase CSS "dark-mode" en <body> y la
 * persistencia de la preferencia elegida por el usuario.
 * ==========================================================================
 */

import { themeBtn, themeIcon } from './dom.js';
import { safeThemeSet } from './storage.js';

// Paths SVG de los íconos de sol y luna. Se inyectan como innerHTML del
// <svg id="themeIcon">, que en el HTML está definido vacío.
const SUN_ICON = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.03 0-1.41zm-12.37 12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.03 0-1.41z"/>`;
const MOON_ICON = `<path d="M12.3 22c5.52 0 10-4.48 10-10 0-2.2-.72-4.24-1.93-5.91-.3-.41-.78-.51-1.19-.24-.4.26-.53.78-.29 1.21C20.1 9.26 20.7 11.08 20.7 13c0 4.8-3.9 8.7-8.7 8.7-3.4 0-6.35-1.95-7.8-4.8-.2-.39-.63-.59-1.05-.47-.43.12-.7.52-.64.97C3.51 20.2 7.57 22 12.3 22zM3.5 9.71c.42.14.88-.05 1.06-.46C5.64 6.83 7.64 5 10 5c.42 0 .82.04 1.21.13.44.1.88-.16.98-.6s-.16-.88-.6-.98C11.02 3.43 10.51 3.38 10 3.38c-3.43 0-6.37 2.45-7.1 5.76-.11.45.15.9.6 1.01z"/>`;

/** Tema actualmente aplicado ('light' o 'dark'), en memoria. */
let currentTheme = 'light';

/**
 * Aplica visualmente un tema (clase en <body> + ícono), sin persistirlo.
 * @param {'light'|'dark'} theme - Tema a aplicar.
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.innerHTML = MOON_ICON;
    } else {
        document.body.classList.remove('dark-mode');
        themeIcon.innerHTML = SUN_ICON;
    }
    currentTheme = theme;
}

/**
 * Inicializa el sistema de temas: aplica el tema guardado (o "light" por
 * defecto) y conecta el botón de alternancia. Debe llamarse una única vez
 * al arrancar la aplicación.
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        safeThemeSet(nextTheme);
    });
}
