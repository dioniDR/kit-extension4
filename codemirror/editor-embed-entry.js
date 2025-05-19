// editor-embed-entry.js
(function () {
  console.log('📦 editor-embed cargado');

  // Exponer CodeMirror manualmente
  import('@codemirror/state').then(({ EditorState }) => window.EditorState = EditorState);
  import('@codemirror/view').then(({ EditorView }) => window.EditorView = EditorView);
  import('@codemirror/basic-setup').then(({ basicSetup }) => window.basicSetup = basicSetup);
  import('@codemirror/lang-javascript').then(({ javascript }) => window.javascript = javascript);
  import('@codemirror/lang-python').then(({ python }) => window.python = python);

  // Configs
  window.pythonEditorConfig = {
    mode: "python",
    theme: "monokai",
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    indentWithTabs: false,
    lineWrapping: false
  };

  window.javascriptEditorConfig = {
    mode: "javascript",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 2
  };

  // Define la función global
  window.createEditor = function (selector = '#container', options = {}) {
    const mode = options.mode || 'javascript';
    const configBase = mode === 'python'
      ? window.pythonEditorConfig
      : window.javascriptEditorConfig;

    const config = {
      ...configBase,
      ...options,
      content: options.content || ''
    };

    const parent = document.querySelector(selector);
    if (!parent) {
      console.error(`Contenedor no encontrado: ${selector}`);
      return null;
    }

    const extensions = [window.basicSetup];
    if (mode === 'python') extensions.push(window.python());
    else extensions.push(window.javascript());

    const state = window.EditorState.create({
      doc: config.content,
      extensions
    });

    const view = new window.EditorView({
      state,
      parent
    });

    return {
      view,
      getValue: () => view.state.doc.toString(),
      setValue: (text) =>
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: text }
        })
    };
  };

  // Define componente <code-editor>
  if (!customElements.get('code-editor')) {
    class CodeEditor extends HTMLElement {
      connectedCallback() {
        const inner = document.createElement('div');
        inner.style.minHeight = '150px';
        inner.id = `editor-${Date.now()}`;
        this.appendChild(inner);

        const wait = setInterval(() => {
          if (window.createEditor && window.EditorView) {
            clearInterval(wait);
            window.createEditor(`#${inner.id}`);
            console.log('🟩 Editor insertado automáticamente en <code-editor>');
          }
        }, 300);
      }
    }

    customElements.define('code-editor', CodeEditor);
    console.log('✅ Componente <code-editor> registrado');
  }
})();
