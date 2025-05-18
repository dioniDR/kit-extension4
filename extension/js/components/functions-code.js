/**
 * <functions-code> - Componente invisible que registra funciones globales
 */
(function () {
  if (customElements.get('functions-code')) return;

  class FunctionsCode extends HTMLElement {
    constructor() {
      super();
      this.registrarFunciones();
    }

    registrarFunciones() {
      if (window.obtenerTodosLosBloquesCodigo) return;

      function crearObjetoBloque(code) {
        const texto = code.innerText.trim();
        if (texto.length < 10 || !texto.includes('\n')) return null;

        const objeto = {
          codigo: texto,
          elemento: code,
          insertarEn(destino) {
            let el = null;
            if (typeof destino === 'string') {
              el = document.getElementById(destino);
            } else if (destino instanceof HTMLElement) {
              el = destino;
            }

            if (!el) {
              console.warn('Destino no encontrado para insertar:', destino);
              return;
            }

            if (typeof el.insertarTexto === 'function') {
              el.insertarTexto(this.codigo);
            } else {
              const area = el.querySelector('textarea, pre, code');
              if (area) area.textContent = this.codigo;
            }
          }
        };

        return objeto;
      }

      window.obtenerTodosLosBloquesCodigo = function () {
        const bloques = [...document.querySelectorAll('code')];
        return bloques.map(crearObjetoBloque).filter(Boolean);
      };

      window.obtenerUltimoBloqueCodigo = function (destino = null) {
        const todos = window.obtenerTodosLosBloquesCodigo();
        const ultimo = todos.at(-1);
        if (!ultimo) {
          console.warn('No se encontró ningún bloque <code> válido');
          return null;
        }
        if (destino) ultimo.insertarEn(destino);
        return ultimo;
      };

      console.log('✅ <functions-code>: Funciones globales registradas');
    }
  }

  try {
    customElements.define('functions-code', FunctionsCode);
    const nodo = document.createElement('functions-code');
    document.body.appendChild(nodo);
  } catch (err) {
    console.warn('❌ No se pudo registrar <functions-code>:', err);
  }
})();
