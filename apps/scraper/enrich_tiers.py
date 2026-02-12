#!/usr/bin/env python3
"""
Mapea los RUCs de los archivos tier con los nombres del padrón SUNAT.
Genera archivos CSV enriquecidos con nombre de empresa.
"""

import csv
import os
from typing import Dict, Set

# Rutas
PADRON_PATH = "/home/jimmy/Descargas/padron_reducido_ruc.txt"
DATA_DIR = "/home/jimmy/sueldos-organigrama/data"

TIER_FILES = [
    "tier1_mega.csv",
    "tier2_grandes.csv", 
    "tier3_medianas.csv",
]


def load_tier_rucs() -> Set[str]:
    """Carga todos los RUCs de los archivos tier."""
    rucs = set()
    
    for filename in TIER_FILES:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rucs.add(row['RUC'])
            print(f"✅ Cargados {len(rucs)} RUCs de {filename}")
    
    return rucs


def extract_names_from_padron(rucs_to_find: Set[str]) -> Dict[str, str]:
    """Extrae nombres del padrón para los RUCs especificados."""
    ruc_names = {}
    found = 0
    
    print(f"\n📖 Leyendo padrón SUNAT ({PADRON_PATH})...")
    print(f"   Buscando {len(rucs_to_find)} RUCs...")
    
    with open(PADRON_PATH, 'r', encoding='latin-1') as f:
        # Saltar header
        next(f)
        
        for i, line in enumerate(f, 1):
            if i % 1000000 == 0:
                print(f"   Procesadas {i:,} líneas... encontrados {found}")
            
            parts = line.strip().split('|')
            if len(parts) >= 2:
                ruc = parts[0]
                if ruc in rucs_to_find:
                    nombre = parts[1]
                    ruc_names[ruc] = nombre
                    found += 1
                    
                    # Si ya encontramos todos, terminar
                    if found >= len(rucs_to_find):
                        break
    
    print(f"\n✅ Encontrados {found} de {len(rucs_to_find)} RUCs")
    return ruc_names


def enrich_tier_files(ruc_names: Dict[str, str]):
    """Enriquece los archivos tier con los nombres de empresa."""
    
    for filename in TIER_FILES:
        input_path = os.path.join(DATA_DIR, filename)
        output_path = os.path.join(DATA_DIR, filename.replace('.csv', '_enriched.csv'))
        
        if not os.path.exists(input_path):
            continue
        
        print(f"\n📝 Procesando {filename}...")
        
        with open(input_path, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            fieldnames = ['RUC', 'RazonSocial'] + [f for f in reader.fieldnames if f != 'RUC']
            
            with open(output_path, 'w', encoding='utf-8', newline='') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                
                count = 0
                for row in reader:
                    ruc = row['RUC']
                    new_row = {
                        'RUC': ruc,
                        'RazonSocial': ruc_names.get(ruc, 'NO ENCONTRADO'),
                    }
                    new_row.update({k: v for k, v in row.items() if k != 'RUC'})
                    writer.writerow(new_row)
                    count += 1
        
        print(f"   ✅ Guardado {output_path} ({count} registros)")


def main():
    print("=" * 60)
    print("🏢 EMPLIQ - Enriquecimiento de datos SUNAT")
    print("=" * 60)
    
    # 1. Cargar RUCs de los tiers
    rucs_to_find = load_tier_rucs()
    print(f"\n📊 Total RUCs únicos a buscar: {len(rucs_to_find)}")
    
    # 2. Extraer nombres del padrón
    ruc_names = extract_names_from_padron(rucs_to_find)
    
    # 3. Enriquecer archivos
    enrich_tier_files(ruc_names)
    
    print("\n" + "=" * 60)
    print("✅ Proceso completado!")
    print("=" * 60)


if __name__ == '__main__':
    main()
