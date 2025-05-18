/**
 * CodeInspector - Inspector de bloques <code> + Fábrica de editores flotantes
 */
(function () {
  if (customElements.get('code-inspector')) return;

  class CodeInspector extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.resultados = [];
    }

    connectedCallback() {
      this.resultados = this.obtenerTodosLosBloquesCodigo();
      this.render();
      this.setupListeners();
    }

    obtenerTodosLosBloquesCodigo() {
      const bloques = [...document.querySelectorAll('code')];
      return bloques
        .map(code => {
          const texto = code.innerText.trim();
          if (texto.length < 10 || !texto.includes('\n')) return null;

          let contenedor = code.closest('div[dir="ltr"]');
          let nodo = contenedor;
          let copy = null;
          let edit = null;

          while (nodo && nodo !== document.body) {
            copy = nodo.querySelector('button[aria-label="Copiar"]');
            edit = nodo.querySelector('button[aria-label="Editar"]');
            if (copy || edit) break;
            nodo = nodo.parentElement;
          }

          return { codigo: texto, elemento: code, copy, edit };
        })
        .filter(Boolean);
    }

    obtenerUltimoBloqueCodigo() {
      return this.resultados.length ? this.resultados.at(-1) : null;
    }

    render() {
      const style = `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            font-size: 13px;
            padding: 10px;
            background: #eef;
            border: 2px solid #00f;
            max-height: 300px;
            overflow-y: auto;
          }
          button {
            margin: 4px 2px;
          }
          pre {
            background: #f4f4f4;
            padding: 6px;
            border-radius: 4px;
            white-space: pre-wrap;
          }
        </style>
      `;

      const lista = this.resultados.map((b, i) => `
        <li>
          <button data-insertar="${i}">Insertar</button>
          <pre>#${i + 1}:\n${b.codigo.slice(0, 300)}</pre>
        </li>
      `).join('');

      const html = `
        ${style}
        <div>
          <strong>🔎 ${this.resultados.length} bloques de código detectados:</strong><br>
          <button id="crear">➕ Crear elemento</button>
          <button id="insertar-ultimo">📥 Insertar último bloque</button>
          <ul>${lista}</ul>
        </div>
      `;

      this.shadowRoot.innerHTML = html;
    }

    setupListeners() {
      this.shadowRoot.getElementById('crear')?.addEventListener('click', () => {
        const nuevo = document.createElement('editor-flotante');
        document.body.appendChild(nuevo);
      });

      this.shadowRoot.getElementById('insertar-ultimo')?.addEventListener('click', () => {
        const ultimo = this.obtenerUltimoBloqueCodigo();
        if (!ultimo) return;
        const editores = document.querySelectorAll('editor-flotante');
        const activo = editores[editores.length - 1];
        if (activo) activo.insertarTexto(ultimo.codigo);
      });

      this.shadowRoot.querySelectorAll('[data-insertar]')?.forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-insertar'));
          const bloque = this.resultados[index];
          const editores = document.querySelectorAll('editor-flotante');
          const activo = editores[editores.length - 1];
          if (activo) activo.insertarTexto(bloque.codigo);
        });
      });
    }
  }

  class EditorFlotante extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            top: 50px;
            left: 50px;
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
            resize: both;
            overflow: auto;
            z-index: 9999;
          }
          pre {
            min-width: 200px;
            min-height: 100px;
            background: #fdfdfd;
            border: 1px dashed #999;
            padding: 8px;
            white-space: pre-wrap;
          }
        </style>
        <pre contenteditable="true"></pre>
      `;
      this.mover();
    }

    insertarTexto(texto) {
      const pre = this.shadowRoot.querySelector('pre');
      pre.textContent = texto;
    }

    mover() {
      let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
      const el = this;
      el.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e.preventDefault();
        posX = mouseX - e.clientX;
        posY = mouseY - e.clientY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        el.style.top = (el.offsetTop - posY) + "px";
        el.style.left = (el.offsetLeft - posX) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }

  try {
    customElements.define('code-inspector', CodeInspector);
    customElements.define('editor-flotante', EditorFlotante);
    console.log('✅ <code-inspector> y <editor-flotante> registrados');
  } catch (e) {
    console.error('❌ Error al registrar los componentes:', e);
  }
})();
