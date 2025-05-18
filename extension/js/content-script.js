// Content script - Versión optimizada para evitar problemas de CSP
console.log("🟢 Content script modificado para evitar CSP - v3");

// Escuchar mensajes desde el popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("🟢 Mensaje recibido:", message);
    
    if (message.action === "insertComponent") {
        console.log("🟢 Intentando insertar componente:", message.tagName, message.scriptSrc);
        
        try {
            insertStaticComponent(message.tagName);
            console.log("🟢 Componente insertado con éxito");
            sendResponse({success: true});
        } catch (error) {
            console.error("🔴 Error al insertar componente:", error);
            sendResponse({success: false, error: error.message});
        }
        
        return true; // Mantener canal abierto
    }
});

// Función para insertar componentes estáticos (sin scripts dinámicos)
function insertStaticComponent(tagName) {
    // Crear el contenedor principal con todo el contenido pre-creado
    // para evitar ejecutar scripts dinámicos
    const container = document.createElement('div');
    container.id = 'ext-component-' + Math.floor(Math.random() * 100000);
    container.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999999;
        background-color: white;
        border: 2px solid #4285f4;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        width: 300px;
        font-family: Arial, sans-serif;
        overflow: hidden;
    `;
    
    // Definir el contenido basado en el tipo de componente
    if (tagName === "simple-alert") {
        container.innerHTML = `
            <div style="background-color: #4285f4; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                <span style="font-weight: bold;">Simple Alert</span>
                <button id="${container.id}-close" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 20px;">&times;</button>
            </div>
            <div style="padding: 16px;">
                <h1 style="color: #1a73e8; font-size: 24px; margin-top: 0; margin-bottom: 16px; text-align: center;">Componente Simple Alert</h1>
                <button id="${container.id}-alert" style="background-color: #1a73e8; color: white; border: none; border-radius: 4px; padding: 10px 16px; font-size: 16px; cursor: pointer; display: block; margin: 0 auto;">¡Haz clic aquí!</button>
            </div>
        `;
    } 
    else if (tagName === "hola-mundo-extension") {
        container.innerHTML = `
            <div style="background-color: #4285f4; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                <span style="font-weight: bold;">Hola Mundo Extension</span>
                <button id="${container.id}-close" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 20px;">&times;</button>
            </div>
            <div style="padding: 16px;">
                <p style="color: #4CAF50; font-size: 20px; text-align: center; margin-bottom: 16px;">¡Hola, Mundo desde la extensión!</p>
                <div id="${container.id}-counter" style="font-size: 28px; font-weight: bold; text-align: center; margin: 16px 0;">0</div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="${container.id}-increment" style="background-color: #4CAF50; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer;">Incrementar</button>
                    <button id="${container.id}-alert" style="background-color: #2196F3; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer;">Mostrar alerta</button>
                </div>
            </div>
        `;
    }
    else {
        container.innerHTML = `
            <div style="background-color: #4285f4; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                <span style="font-weight: bold;">${formatTagName(tagName)}</span>
                <button id="${container.id}-close" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 20px;">&times;</button>
            </div>
            <div style="padding: 16px;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h3 style="margin-top: 0; color: #333;">Componente Genérico</h3>
                    <p style="color: #666;">Este es un componente web personalizado</p>
                </div>
                <button id="${container.id}-action" style="background-color: #4285f4; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; display: block; margin: 0 auto;">Ejecutar acción</button>
            </div>
        `;
    }
    
    // Añadir al DOM
    document.body.appendChild(container);
    
    // Configurar eventos después de añadir al DOM
    setTimeout(() => {
        setupEvents(container, tagName);
        // Hacer el componente arrastrable
        makeElementDraggable(container, container.querySelector('div'));
    }, 0);
    
    return container;
}

// Función para configurar los eventos del componente
function setupEvents(container, tagName) {
    // Botón de cierre (común para todos los componentes)
    const closeBtn = document.getElementById(`${container.id}-close`);
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            container.remove();
        });
    }
    
    if (tagName === "simple-alert") {
        const alertBtn = document.getElementById(`${container.id}-alert`);
        if (alertBtn) {
            alertBtn.addEventListener('click', () => {
                alert('¡Alerta desde el componente SimpleAlert!');
            });
        }
    } 
    else if (tagName === "hola-mundo-extension") {
        const incrementBtn = document.getElementById(`${container.id}-increment`);
        const counterEl = document.getElementById(`${container.id}-counter`);
        const alertBtn = document.getElementById(`${container.id}-alert`);
        
        let count = 0;
        
        if (incrementBtn && counterEl) {
            incrementBtn.addEventListener('click', () => {
                count++;
                counterEl.textContent = count;
            });
        }
        
        if (alertBtn) {
            alertBtn.addEventListener('click', () => {
                alert('¡Hola desde el componente!');
            });
        }
    }
    else {
        const actionBtn = document.getElementById(`${container.id}-action`);
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                alert(`Componente ${formatTagName(tagName)} funcionando!`);
            });
        }
    }
}

// Función para convertir kebab-case a Título Estándar
function formatTagName(tagName) {
    return tagName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Función para hacer el elemento arrastrable
function makeElementDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    if (handle) {
        handle.style.cursor = 'move';
        handle.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Obtener posición del cursor
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calcular nueva posición
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Establecer nueva posición
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

console.log("🟢 Content script cargado correctamente");