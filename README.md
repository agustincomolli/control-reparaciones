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
- Funciona de forma local y con soporte básico offline mediante PWA
- Tema claro y oscuro

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript vanilla
- LocalStorage para persistencia local
- SheetJS para exportación a Excel
- Service Worker para soporte offline básico

## 📁 Estructura del proyecto

- index.html: estructura principal de la interfaz
- styles/style.css: estilos visuales, tema y animaciones
- scripts/app.js: lógica de negocio y manipulación del DOM
- service-worker.js: caché y comportamiento offline
- manifest.json: configuración de la PWA

## ▶️ Cómo usarla

1. Abre el archivo index.html en tu navegador o sirve la carpeta con un servidor local.
2. Completa el formulario con el monto, la descripción y la fecha del trabajo.
3. Guarda el registro y revisa el historial.
4. Si lo deseas, exporta los datos a Excel.

## ✅ Requisitos

No requiere dependencias adicionales para funcionar de forma básica. La exportación a Excel utiliza la librería SheetJS cargada desde CDN.

## 🔐 Almacenamiento de datos

Los datos se guardan localmente en el navegador mediante LocalStorage, por lo que permanecen en el dispositivo y navegador donde se usó la app.

## 📌 Nota

La aplicación está pensada para uso práctico y rápido, especialmente en dispositivos móviles.
