# 🧩 CodeMirror Embebido – Componente `<code-editor>` para Extensiones

Este proyecto permite insertar editores CodeMirror directamente en cualquier sitio web mediante una extensión de navegador. Utiliza una arquitectura modular con soporte automático para componentes personalizados como `<code-editor>`.

---

## 📁 Estructura del Proyecto

codemirror/
├── editor-creator.js # Lógica de createEditor()
├── editor-embed-entry.js # Script autocontenible para compilar como extensión
├── editor-bundle.js # Compilado desde main.js (uso manual o integración externa)
├── main.js # Define y expone CodeMirror + createEditor
├── python-config.js # Configuración visual para Python y JavaScript
├── blank.html # Página de prueba local
├── README.md # Esta documentación
├── package.json / lock # Dependencias y build tools

yaml
Copy
Edit

---

## 🧠 ¿Qué hace?

- Define la función global `createEditor(selector, options)` para insertar editores dinámicamente.
- Registra el componente `<code-editor>` que, al insertarse en el DOM, **inyecta automáticamente un editor** dentro.
- Expone una función auxiliar `cargarEditor()` para pruebas desde consola.
- El archivo `editor-embed.js` puede ser cargado como **content script en una extensión de navegador**.

---

## 🚀 Cómo preparar el entorno

### 1. Instalar dependencias

```bash
npm install
2. Compilar archivos
🟩 Compilar editor base (uso manual):
bash
Copy
Edit
npx esbuild main.js --bundle --outfile=editor-bundle.js --format=iife
🟦 Compilar editor embebido para extensión:
bash
Copy
Edit
npx esbuild editor-embed-entry.js --bundle --outfile=../componentes/editor-embed.js --format=iife
📦 Esto generará el archivo editor-embed.js dentro de la carpeta componentes/, ubicada una carpeta por encima (útil para proyectos tipo kit-extencion).

🧪 Uso desde consola del navegador
js
Copy
Edit
// Insertar un <code-editor> automáticamente
cargarEditor()

// Insertar múltiples editores
for (let i = 0; i < 3; i++) cargarEditor();
🧩 Integración en tu extensión (ej: kit-extencion/componentes/editor-embed.js)
Ejemplo de manifest.json
json
Copy
Edit
{
  "name": "CodeMirror Embebido",
  "version": "1.0",
  "manifest_version": 3,
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["componentes/editor-embed.js"],
      "run_at": "document_idle"
    }
  ]
}
⚠️ Asegúrate de colocar el editor-embed.js generado en componentes/ como indica tu configuración.

🧩 Funciones disponibles en window
createEditor(selector, options) – Inserta un editor dentro de un contenedor específico.

cargarEditor() – Inserta automáticamente un <code-editor> y lo inicializa.