// main.js - Punto de entrada para el bundle

// Importar las partes de CodeMirror 6
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";

// Exponer CodeMirror en window
if (typeof window !== 'undefined') {
  window.CodeMirror = {
    EditorState,
    EditorView,
    basicSetup,
    javascript,
    python
  };
}

// Importar los módulos que registran en window
import './python-config.js';
import './editor-creator.js';
