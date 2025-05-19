// python-config.js - Versión 100% global, sin export

(function () {
  const pythonEditorConfig = {
    mode: "python",
    theme: "monokai",
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    indentWithTabs: false,
    lineWrapping: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    autoCloseTags: true
  };

  const javascriptEditorConfig = {
    mode: "javascript",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 2
  };

  window.pythonEditorConfig = pythonEditorConfig;
  window.javascriptEditorConfig = javascriptEditorConfig;
})();
