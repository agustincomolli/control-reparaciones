# Control de Reparaciones

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge)

Control de Reparaciones es una aplicación web progresiva (PWA) pensada para registrar, organizar y consultar trabajos técnicos o servicios prestados de forma rápida, simple y local.

## ✨ Características principales

- Registro de trabajos con monto, descripción y fecha
- Cálculo automático de ingresos del mes actual y promedio histórico
- Historial de los últimos trabajos registrados
- Eliminación de registros con confirmación previa
- Exportación de datos a Excel (.xlsx)
- Respaldo y restauración de datos en formato JSON
- Funciona de forma local y con soporte básico offline mediante PWA
- Tema claro y oscuro

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript vanilla, organizado en módulos ES6 (sin frameworks ni bundler)
- LocalStorage para persistencia local
- ExcelJS para exportación a Excel, cargado desde CDN con Subresource Integrity (SRI)
- Service Worker para soporte offline básico

## 📁 Estructura del proyecto

- `index.html`: estructura principal de la interfaz
- `styles/style.css`: estilos visuales, tema y animaciones
- `scripts/app.js`: punto de entrada; conecta los módulos entre sí
- `scripts/modules/dom.js`: referencias centralizadas a los elementos del HTML
- `scripts/modules/storage.js`: envoltorios seguros sobre localStorage
- `scripts/modules/theme.js`: modo claro/oscuro
- `scripts/modules/repairs-store.js`: capa de datos (fuente de verdad de las reparaciones)
- `scripts/modules/repairs-form.js`: alta de trabajos desde el formulario
- `scripts/modules/repairs-history.js`: listado y eliminación de trabajos
- `scripts/modules/stats.js`: cálculo de estadísticas mensuales
- `scripts/modules/modals.js`: diálogos de confirmación/aviso y menú de datos
- `scripts/modules/data-transfer.js`: exportación a Excel y respaldo/restauración en JSON
- `scripts/modules/utils.js`: utilidades genéricas (formato de fechas)
- `service-worker.js`: caché y comportamiento offline
- `manifest.json`: configuración de la PWA

## ▶️ Cómo usarla

> ⚠️ **Importante:** la app usa módulos de JavaScript (ES6), por lo que **no funciona abriendo `index.html` con doble clic** (el navegador bloquea los módulos cargados desde `file://` por seguridad). Es necesario servirla desde un servidor local.

1. Servís la carpeta del proyecto con un servidor local. Cualquiera de estas opciones funciona:
   - `npx serve .`
   - `python3 -m http.server 8080`
   - La extensión "Live Server" de Visual Studio Code
2. Abrí en tu navegador la URL que te indique el servidor (por ejemplo, `http://localhost:8080`).
3. Completa el formulario con el monto, la descripción y la fecha del trabajo.
4. Guarda el registro y revisa el historial.
5. Si lo deseas, exporta los datos a Excel o generá un respaldo en JSON desde el botón de gestión de datos.

## ✅ Requisitos

No requiere dependencias adicionales para funcionar de forma básica, más que un servidor HTTP local para servir los archivos estáticos (ver sección anterior). La exportación a Excel utiliza la librería ExcelJS cargada desde CDN.

## 🔐 Almacenamiento de datos

Los datos se guardan localmente en el navegador mediante LocalStorage, por lo que permanecen en el dispositivo y navegador donde se usó la app.

## 📌 Nota

La aplicación está pensada para uso práctico y rápido, especialmente en dispositivos móviles.
