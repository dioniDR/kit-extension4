from utils.file_manager import read_file, write_file, remove_file, cargar_configuracion
from config.config import COMPONENTES_DIR, EXTENSION_DIR, SYSTEM_FILES, BASE_DIR
import os
import time
import re
import shutil

def generar_extension_files():
    """Genera los archivos de la extensión basados en la configuración actual"""
    try:
        print("Iniciando generación de archivos de extensión...")

        # Cargar configuración
        config = cargar_configuracion()

        # Asegurar que existe el directorio de componentes de la extensión
        components_js_dir = os.path.join(EXTENSION_DIR, "js", "components")
        if not os.path.exists(components_js_dir):
            os.makedirs(components_js_dir)
            print(f"Directorio creado: {components_js_dir}")

        # Limpiar archivos JS de componentes antiguos
        archivos_componentes_actuales = [comp["archivo"] for comp in config["componentes"]]

        # Eliminar archivos de componentes que ya no existen
        for archivo in os.listdir(components_js_dir):
            ruta_archivo = os.path.join(components_js_dir, archivo)
            if archivo.endswith('.js') and archivo not in archivos_componentes_actuales:
                try:
                    os.remove(ruta_archivo)
                    print(f"Archivo eliminado de la extensión: {archivo}")
                except Exception as e:
                    print(f"Error al eliminar archivo {archivo}: {e}")

        # Recorrer todos los archivos .js, incluyendo subcarpetas
        for root, _, files in os.walk(COMPONENTES_DIR):
            for file in files:
                if file.endswith('.js'):
                    ruta_origen = os.path.join(root, file)
                    ruta_relativa = os.path.relpath(ruta_origen, COMPONENTES_DIR)
                    ruta_destino = os.path.join(components_js_dir, ruta_relativa)

                    # Crear directorios necesarios en el destino
                    os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)

                    try:
                        with open(ruta_origen, 'r', encoding='utf-8') as f_origen:
                            contenido = f_origen.read()

                        with open(ruta_destino, 'w', encoding='utf-8') as f_destino:
                            f_destino.write(contenido)
                        print(f"Archivo copiado exitosamente: {ruta_relativa}")
                    except Exception as e:
                        print(f"Error al copiar {ruta_relativa}: {e}")

        # Generar archivos de la extensión
        if not generar_popup_html(config):
            print("Error: Falló la generación de popup.html")
            return False
        if not generar_manifest_json():
            print("Error: Falló la generación de manifest.json")
            return False
        if not generar_archivos_script():
            print("Error: Falló la generación de archivos de script")
            return False

        # Eliminar carpetas __pycache__ que pueden causar problemas
        limpiar_pycache()

        print("Archivos de extensión generados con éxito")
        return True
    except Exception as e:
        print(f"Error generando archivos de extensión: {e}")
        return False

def generar_popup_html(config):
    """Genera el archivo popup.html a partir de las plantillas"""
    try:
        # Validar existencia de COMPONENTES_DIR
        if not os.path.exists(COMPONENTES_DIR) or not os.path.isdir(COMPONENTES_DIR):
            print(f"Error: El directorio de componentes {COMPONENTES_DIR} no existe o no es válido")
            return False
        
        # Rutas de plantillas
        templates_dir = os.path.join(BASE_DIR, "templates")
        popup_template_path = os.path.join(templates_dir, "popup_template.html")
        component_template_path = os.path.join(templates_dir, "component_template.html")
        
        # Verificar si existen las plantillas
        if not os.path.exists(popup_template_path) or not os.path.exists(component_template_path):
            print(f"Error: Plantillas necesarias no encontradas. Asegúrate de que existan:")
            print(f"- {popup_template_path}")
            print(f"- {component_template_path}")
            return False
        
        # Leer plantillas
        popup_template = read_file(popup_template_path)
        component_template = read_file(component_template_path)
        
        if not popup_template or not component_template:
            print("Error: No se pudieron leer las plantillas HTML")
            return False
        
        # MODIFICACIÓN: Escanear directamente la carpeta de componentes
        componentes_detectados = []
        for archivo in os.listdir(COMPONENTES_DIR):
            if archivo.endswith('.js'):
                ruta_completa = os.path.join(COMPONENTES_DIR, archivo)
                tag = extraer_nombre_componente(ruta_completa)
                if tag:
                    componentes_detectados.append({
                        "archivo": archivo,
                        "tag": tag
                    })
                    print(f"Componente detectado para extensión: {archivo} - Tag: {tag}")
                else:
                    print(f"Advertencia: No se pudo extraer el tag del archivo {archivo}")
        
        # Generar HTML para cada componente
        componentes_html = ""
        for comp in componentes_detectados:
            if comp.get("tag"):  # Solo incluir si se detectó la etiqueta
                nombre_visible = comp["tag"].replace("-", " ").title()
                descripcion = "Un componente web personalizado"
                
                # Reemplazar placeholders en la plantilla del componente
                comp_html = component_template
                comp_html = comp_html.replace("{{TAG}}", comp["tag"])
                comp_html = comp_html.replace("{{SCRIPT}}", comp["archivo"])
                comp_html = comp_html.replace("{{TITLE}}", nombre_visible)
                comp_html = comp_html.replace("{{DESCRIPTION}}", descripcion)
                
                componentes_html += comp_html
        
        # Reemplazar placeholders en la plantilla principal
        popup_html = popup_template
        popup_html = popup_html.replace("{{COMPONENTS}}", componentes_html)
        popup_html = popup_html.replace("{{VERSION}}", time.strftime("%Y.%m.%d"))
        
        # Escribir el archivo popup.html
        write_file(os.path.join(EXTENSION_DIR, "popup.html"), popup_html)
        
        # Copiar CSS si existe
        css_src = os.path.join(templates_dir, "popup.css")
        if os.path.exists(css_src):
            css_dir = os.path.join(EXTENSION_DIR, "css")
            if not os.path.exists(css_dir):
                os.makedirs(css_dir)
            css_dest = os.path.join(css_dir, "popup.css")
            css_content = read_file(css_src)
            if css_content:
                write_file(css_dest, css_content)
        
        print(f"Archivo popup.html generado correctamente con {len(componentes_detectados)} componentes")
        return True
    except Exception as e:
        print(f"Error al generar popup.html: {e}")
        return False

def extraer_nombre_componente(ruta_archivo):
    """Extrae el nombre del componente web definido en un archivo JavaScript"""
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            
        # Buscar definición de Web Component
        match = re.search(r'customElements\.define\([\'"]([a-zA-Z0-9-]+)[\'"]', contenido)
        if match:
            return match.group(1)
        return None
    except Exception as e:
        print(f"Error al analizar {ruta_archivo}: {e}")
        return None

def generar_manifest_json():
    """Genera el archivo manifest.json para la extensión dinámicamente"""
    try:
        # Usar plantilla externa para manifest.json
        manifest_template_path = os.path.join(BASE_DIR, "templates", "manifest_template.json")

        if not os.path.exists(manifest_template_path):
            print(f"Error: Plantilla manifest_template.json no encontrada en {manifest_template_path}")
            return False

        manifest_json = read_file(manifest_template_path)
        if not manifest_json:
            print("Error: No se pudo leer la plantilla de manifest.json")
            return False

        # Escanear componentes disponibles para información dinámica
        componentes_detectados = []
        for root, _, files in os.walk(COMPONENTES_DIR):
            for archivo in files:
                if archivo.endswith('.js'):
                    ruta_completa = os.path.join(root, archivo)
                    tag = extraer_nombre_componente(ruta_completa)
                    if tag:
                        componentes_detectados.append({
                            "archivo": os.path.relpath(ruta_completa, COMPONENTES_DIR),
                            "tag": tag
                        })

        # Actualizar dinámicamente la versión basada en la fecha y cantidad de componentes
        import json
        manifest_data = json.loads(manifest_json)

        # Actualizar versión con formato año.mes.día.cantidad_componentes
        version_base = time.strftime("%Y.%m.%d")
        manifest_data["version"] = f"{version_base}.{len(componentes_detectados)}"

        # Actualizar descripción con la cantidad de componentes
        manifest_data["description"] = f"Colección de {len(componentes_detectados)} componentes web personalizados"

        # Convertir de vuelta a JSON con formato legible
        manifest_json_actualizado = json.dumps(manifest_data, indent=2)

        # Escribir el archivo manifest.json
        write_file(os.path.join(EXTENSION_DIR, "manifest.json"), manifest_json_actualizado)
        print(f"Archivo manifest.json generado dinámicamente con información de {len(componentes_detectados)} componentes")
        return True
    except Exception as e:
        print(f"Error al generar manifest.json: {e}")
        return False

def generar_archivos_script():
    """Genera los archivos de script necesarios para la extensión"""
    try:
        js_dir = os.path.join(EXTENSION_DIR, "js")
        if not os.path.exists(js_dir):
            os.makedirs(js_dir)
        
        # Lista de scripts que deben generarse con sus plantillas
        scripts = [
            ("content_script_template.js", "content-script.js"),
            ("background_script_template.js", "background.js"),
            ("popup_script_template.js", "popup.js")
        ]
        
        templates_js_dir = os.path.join(BASE_DIR, "templates", "js")
        
        if not os.path.exists(templates_js_dir):
            print(f"Error: Directorio de plantillas JS no encontrado en {templates_js_dir}")
            return False
        
        for template_name, output_name in scripts:
            output_path = os.path.join(js_dir, output_name)
            
            # Verificar si el archivo ya existe
            if not os.path.exists(output_path):
                template_path = os.path.join(templates_js_dir, template_name)
                
                if not os.path.exists(template_path):
                    print(f"Error: Plantilla {template_name} no encontrada")
                    continue
                
                script_content = read_file(template_path)
                if script_content:
                    write_file(output_path, script_content)
                    print(f"Archivo {output_name} generado desde plantilla")
                else:
                    print(f"Error: No se pudo leer la plantilla {template_name}")
        
        return True
    except Exception as e:
        print(f"Error al generar archivos script: {e}")
        return False

def limpiar_pycache():
    """Elimina carpetas __pycache__ que pueden causar problemas con la extensión"""
    try:
        for root, dirs, files in os.walk(EXTENSION_DIR):
            if '__pycache__' in dirs:
                pycache_path = os.path.join(root, '__pycache__')
                try:
                    shutil.rmtree(pycache_path)
                    print(f"Carpeta __pycache__ eliminada: {pycache_path}")
                except Exception as e:
                    print(f"Error al eliminar {pycache_path}: {e}")
        return True
    except Exception as e:
        print(f"Error al limpiar carpetas __pycache__: {e}")
        return False