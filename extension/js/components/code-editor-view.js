/**
 * code-editor-view.js
 * Componente <code-editor> con <pre><code><textarea> y ID único
 */
(function () {
  if (customElements.get('code-editor')) return;

  let contadorEditor = 0;

  class CodeEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.id = this.id || `code-editor-${++contadorEditor}`;
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            background: #fff;
            border: 1px solid #ccc;
            padding: 10px;
            margin: 10px;
            max-width: 100%;
          }
          pre {
            background: #f4f4f4;
            border: 1px solid #999;
            padding: 10px;
            white-space: pre-wrap;
            overflow-x: auto;
          }
          textarea {
            width: 100%;
            min-height: 100px;
            font-family: monospace;
            border: none;
            background: transparent;
            resize: vertical;
          }
        </style>
        <pre><code><textarea></textarea></code></pre>
      `;
    }

    insertarTexto(texto) {
      const area = this.shadowRoot.querySelector('textarea');
      if (area) {
        area.value = texto;
      }
    }
  }

  try {
    customElements.define('code-editor', CodeEditor);
    console.log('✅ Componente <code-editor> registrado');
  } catch (err) {
    console.warn('❌ No se pudo registrar <code-editor>:', err);
  }
})();
