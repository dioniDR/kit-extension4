import os
import json
from config.config import COMPONENTES_DIR

def read_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error leyendo archivo {filepath}: {e}")
        return None

def write_file(filepath, content):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error escribiendo archivo {filepath}: {e}")
        return False

def remove_file(filepath):
    try:
        os.remove(filepath)
        print(f"Archivo eliminado: {filepath}")
        return True
    except Exception as e:
        print(f"Error eliminando archivo {filepath}: {e}")
        return False

def cargar_configuracion():
    config_path = os.path.join(COMPONENTES_DIR, "config.json")
    try:
        # Escanear la carpeta de componentes para detectar archivos existentes
        componentes_detectados = []
        for archivo in os.listdir(COMPONENTES_DIR):
            if archivo.endswith('.js'):
                componentes_detectados.append({"archivo": archivo, "tag": archivo.split('.')[0]})
        
        # Si el archivo no existe, crearlo con los componentes detectados
        if not os.path.exists(config_path):
            print(f"Creando archivo de configuración por defecto en {config_path}")
            config_default = {"componentes": componentes_detectados}
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config_default, f, indent=4)
            return config_default
        
        # Leer configuración existente
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Validar y actualizar la configuración si los componentes han cambiado
        componentes_actualizados = []
        for comp in config.get("componentes", []):
            ruta_componente = os.path.join(COMPONENTES_DIR, comp["archivo"])
            if os.path.exists(ruta_componente):
                componentes_actualizados.append(comp)
            else:
                print(f"Advertencia: El archivo {comp['archivo']} no existe. Eliminándolo de la configuración.")
        
        # Agregar nuevos componentes detectados que no están en la configuración
        nuevos_componentes = [
            comp for comp in componentes_detectados
            if comp["archivo"] not in [c["archivo"] for c in componentes_actualizados]
        ]
        if nuevos_componentes:
            print(f"Detectados nuevos componentes: {[comp['archivo'] for comp in nuevos_componentes]}")
            componentes_actualizados.extend(nuevos_componentes)
        
        # Actualizar el archivo de configuración si hubo cambios
        if len(componentes_actualizados) != len(config.get("componentes", [])):
            config["componentes"] = componentes_actualizados
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4)
            print(f"Archivo de configuración actualizado en {config_path}")
        
        return config
    except Exception as e:
        print(f"Error cargando configuración: {e}")
        return {"componentes": []}