// Plantilla del script de popup - Enfoque de inyección directa con chrome.scripting
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔷 Popup inicializado");
    
    // Encontrar todos los botones de inserción
    const insertButtons = document.querySelectorAll('.insert-btn');
    console.log("🔷 Botones encontrados:", insertButtons.length);
    
    const statusMessage = document.getElementById('status-message');
    
    // Comprobar que los botones se han encontrado
    if (insertButtons.length === 0) {
        mostrarError("No se encontraron componentes disponibles");
        return;
    }
    
    // Agregar eventos a los botones de inserción
    insertButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("🔷 Botón presionado");
            
            const componentItem = this.closest('.component-item');
            if (!componentItem) {
                mostrarError("Error: No se pudo encontrar información del componente");
                return;
            }
            
            const tagName = componentItem.dataset.tag;
            const scriptSrc = componentItem.dataset.script;
            
            if (!tagName || !scriptSrc) {
                mostrarError("Error: Información de componente incompleta");
                return;
            }
            
            console.log(`🔷 Componente a insertar: ${tagName} (${scriptSrc})`);
            
            statusMessage.textContent = "Procesando...";
            statusMessage.className = "status-message";
            statusMessage.style.display = "block";
            
            // Usar chrome.scripting para insertar directamente
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (!tabs || tabs.length === 0) {
                    mostrarError("Error: No se pudo obtener la pestaña activa");
                    return;
                }
                
                const activeTab = tabs[0];
                console.log("🔷 Pestaña activa:", activeTab.url);
                
                // Verificar si podemos inyectar en esta pestaña
                try {
                    const url = new URL(activeTab.url);
                    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                        mostrarError(`No se puede insertar en páginas ${url.protocol}`);
                        return;
                    }
                } catch (e) {
                    console.warn("🔶 Error al verificar URL:", e);
                    // Continuar de todos modos
                }
                
                // Usar executeScript para inyectar el componente
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    func: injectComponent,
                    args: [tagName, scriptSrc]
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("🔴 Error:", chrome.runtime.lastError);
                        mostrarError(`Error: ${chrome.runtime.lastError.message}`);
                        return;
                    }
                    
                    if (results && results[0] && results[0].result === true) {
                        mostrarExito("Componente insertado correctamente");
                    } else {
                        const errorMsg = results && results[0] && results[0].result ? 
                            results[0].result.error : "Error desconocido";
                        mostrarError(`Error al insertar: ${errorMsg}`);
                    }
                });
            });
        });
    });
    
    // Función que se inyectará en la página
    function injectComponent(tagName, scriptSrc) {
        try {
            console.log(`Inyectando componente: ${tagName}, script: ${scriptSrc}`);
            
            // 1. Cargar el script del componente
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(`js/components/${scriptSrc}`);
            document.head.appendChild(script);
            
            // 2. Esperar a que se cargue el script y luego crear el componente
            script.onload = () => {
                console.log(`Script cargado: ${scriptSrc}`);
                
                // 3. Crear un contenedor para el componente
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    z-index: 9999999;
                    background-color: white;
                    border: 2px solid #4285f4;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    padding: 16px;
                    width: 300px;
                `;
                
                // 4. Crear la barra de título
                const header = document.createElement('div');
                header.style.cssText = `
                    background-color: #4285f4;
                    color: white;
                    padding: 8px;
                    margin: -16px -16px 16px -16px;
                    border-radius: 6px 6px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: move;
                `;
                
                const title = document.createElement('span');
                title.textContent = tagName.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                title.style.fontWeight = 'bold';
                
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '✕';
                closeBtn.style.cssText = `
                    background: none;
                    border: none;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                `;
                
                closeBtn.addEventListener('click', () => wrapper.remove());
                
                header.appendChild(title);
                header.appendChild(closeBtn);
                wrapper.appendChild(header);
                
                // 5. Crear el componente web
                const component = document.createElement(tagName);
                wrapper.appendChild(component);
                document.body.appendChild(wrapper);
                
                // 6. Hacer el componente arrastrable
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                header.onmousedown = function(e) {
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                };
                
                function elementDrag(e) {
                    e.preventDefault();
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    wrapper.style.top = (wrapper.offsetTop - pos2) + "px";
                    wrapper.style.left = (wrapper.offsetLeft - pos1) + "px";
                }
                
                function closeDragElement() {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
                
                console.log(`Componente ${tagName} insertado correctamente`);
            };
            
            script.onerror = (error) => {
                console.error(`Error al cargar el script: ${error}`);
                throw new Error(`No se pudo cargar el script: ${scriptSrc}`);
            };
            
            return true;
        } catch (error) {
            console.error(`Error al insertar componente: ${error.message}`);
            return { error: error.message };
        }
    }
    
    function mostrarExito(mensaje) {
        console.log("🔷 Éxito:", mensaje);
        statusMessage.textContent = mensaje;
        statusMessage.className = "status-message status-success";
        statusMessage.style.display = "block";
    }
    
    function mostrarError(mensaje) {
        console.error("🔴 Error:", mensaje);
        statusMessage.textContent = mensaje;
        statusMessage.className = "status-message status-error";
        statusMessage.style.display = "block";
    }
});