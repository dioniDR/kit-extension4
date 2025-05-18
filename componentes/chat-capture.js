/**
 * PreguntasMenu - Componente Web para navegar por tus preguntas en el chat
 */
(function () {
    if (customElements.get('preguntas-menu')) return;
  
    class PreguntasMenu extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.punteros = [];
      }
  
      connectedCallback() {
        this.punteros = this.crearPunteros();
        this.render();
        this.setupEventListeners();
        this.observeCambios();
      }
  
      crearPunteros() {
        const preguntas = [...document.querySelectorAll('.text-base:has(.whitespace-pre-wrap)')];
        const respuestas = [...document.querySelectorAll('.markdown')];
  
        const textosYaAgregados = new Set();
  
        return preguntas.map((preguntaNodo, i) => {
          const texto = preguntaNodo.querySelector('.whitespace-pre-wrap')?.innerText.trim().slice(0, 50);
          if (!texto || textosYaAgregados.has(texto)) return null;
  
          textosYaAgregados.add(texto);
          const respuestaNodo = respuestas[i] || null;
  
          return {
            id: `pregunta-${i}`,
            nodoPregunta: preguntaNodo,
            nodoRespuesta: respuestaNodo,
            scroll: () => {
              preguntaNodo.scrollIntoView({ behavior: 'smooth', block: 'start' });
              preguntaNodo.style.outline = '2px solid #007bff';
              setTimeout(() => preguntaNodo.style.outline = '', 1500);
            },
            obtenerTexto: () => texto || `Pregunta ${i + 1}`
          };
        }).filter(Boolean);
      }
  
      render() {
        const style = `
          <style>
            :host {
              background: white;
              border: 1px solid #ccc;
              padding: 10px;
              height: 200px;
              overflow-y: auto;
              font-family: sans-serif;
              font-size: 13px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            ul {
              list-style: none;
              padding: 0;
              margin: 10px 0 0 0;
            }
            li {
              margin: 5px 0;
            }
            a {
              color: #333;
              text-decoration: none;
              padding: 4px 6px;
              display: block;
            }
            a:hover {
              background-color: #f0f0f0;
            }
            input {
              width: 100%;
              padding: 6px;
              margin-bottom: 10px;
              box-sizing: border-box;
            }
            button {
              margin-top: 10px;
              width: 100%;
              padding: 6px;
            }
          </style>
        `;
  
        let html = `
          ${style}
          <div>
            <strong>📋 Preguntas:</strong>
            <input type="text" placeholder="Buscar pregunta...">
            <ul>
              ${this.punteros.map(p => `
                <li><a href="#" data-id="${p.id}">🔹 ${p.obtenerTexto()}</a></li>
              `).join('')}
            </ul>
            <button id="copiar">📄 Copiar preguntas</button>
          </div>
        `;
  
        this.shadowRoot.innerHTML = html;
      }
  
      setupEventListeners() {
        const links = this.shadowRoot.querySelectorAll('a[data-id]');
        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const puntero = this.punteros.find(p => p.id === id);
            if (puntero) puntero.scroll();
          });
        });
  
        const input = this.shadowRoot.querySelector('input');
        input?.addEventListener('input', (e) => {
          const filtro = e.target.value.toLowerCase();
          const items = this.shadowRoot.querySelectorAll('li');
          items.forEach((li, i) => {
            const texto = this.punteros[i].obtenerTexto().toLowerCase();
            li.style.display = texto.includes(filtro) ? '' : 'none';
          });
        });
  
        this.shadowRoot.querySelector('#copiar')?.addEventListener('click', () => {
          const texto = this.punteros.map(p => p.obtenerTexto()).join('\n');
          navigator.clipboard.writeText(texto);
        });
      }
  
      observeCambios() {
        const observer = new MutationObserver(() => {
          const nuevos = this.crearPunteros();
          if (nuevos.length !== this.punteros.length) {
            this.punteros = nuevos;
            this.render();
            this.setupEventListeners();
          }
        });
  
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }
  
    try {
        customElements.define('preguntas-menu', PreguntasMenu);
        console.log('✅ Componente preguntas-menu registrado');
      } catch (e) {
        console.error('Error al registrar preguntas-menu:', e);
      }
      
  })();
  