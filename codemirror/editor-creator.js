// editor-creator.js

function createEditor(selector = '#container', options = {}) {
  const mode = options.mode || 'javascript';
  const configBase = mode === 'python'
    ? window.pythonEditorConfig || {}
    : window.javascriptEditorConfig || {};

  const config = {
    ...configBase,
    ...options,
    content: options.content || ''
  };

  if (typeof CodeMirror !== 'object') {
    console.error('CodeMirror no está disponible');
    return null;
  }

  const parent = document.querySelector(selector);
  if (!parent) {
    console.error(`Contenedor no encontrado: ${selector}`);
    return null;
  }

  try {
    const extensions = [CodeMirror.basicSetup];
    if (mode === 'python' && typeof CodeMirror.python === 'function') {
      extensions.push(CodeMirror.python());
    } else if (typeof CodeMirror.javascript === 'function') {
      extensions.push(CodeMirror.javascript());
    }

    const state = CodeMirror.EditorState.create({
      doc: config.content,
      extensions
    });

    const view = new CodeMirror.EditorView({
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
  } catch (e) {
    console.error('Error al crear el editor:', e);
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.createEditor = createEditor;
}

export { createEditor };
