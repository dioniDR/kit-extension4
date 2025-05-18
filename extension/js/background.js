// Background script para la extensión
console.log("Background script inicializado");

// Escuchar a la instalación o actualización de la extensión
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensión Kit de Herramientas Web instalada o actualizada');
});

// No es necesario manejar la inserción de componentes aquí,
// ya que ahora usamos chrome.scripting.executeScript desde el popup