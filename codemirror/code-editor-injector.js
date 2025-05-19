(function () {
  const tag = 'code-editor';

  // Verificar si ya está definido
  if (!customElements.get(tag)) {
    class CodeEditor extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        // Esperar que createEditor esté disponible
        const tryInject = (retries = 10) => {
          if (typeof createEditor === 'function') {
            // Inserta un contenedor interno si no hay nada
            if (!this.innerHTML.trim()) {
              const inner = document.createElement('div');
              inner.style.minHeight = '150px';
              this.appendChild(inner);
            }
            const selector = `#${this.firstElementChild.id || this.firstElementChild.tagName.toLowerCase()}`;
            createEditor(selector);
            console.log('🟦 Editor inyectado en <code-editor>');
          } else if (retries > 0) {
            setTimeout(() => tryInject(retries - 1), 300);
          } else {
            console.warn('🟥 createEditor no disponible para <code-editor>');
          }
        };

        tryInject();
      }
    }

    customElements.define(tag, CodeEditor);
    console.log('✅ Componente <code-editor> registrado');
  }

  // Observar el DOM por inserciones futuras
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.tagName.toLowerCase() === tag) {
          // Si ya está conectado, no necesitamos esperar a connectedCallback
          if (typeof node.connectedCallback === 'function') {
            node.connectedCallback();
          }
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
