#!/usr/bin/env python3
"""
Script para convertir el padrón RUC a Parquet en chunks
- Procesa archivo de 3.2GB en chunks manejables
- Filtra solo personas jurídicas (RUC empieza con 2)
- Guarda en formato Parquet comprimido
"""

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
import os

# Configuración
INPUT_FILE = Path("/home/jimmy/Descargas/PadronRUC_202601.csv")
OUTPUT_DIR = Path("/home/jimmy/sueldos-organigrama/data")
OUTPUT_DIR.mkdir(exist_ok=True)

CHUNK_SIZE = 500_000  # 500k registros por chunk

def convert_to_parquet():
    print("=" * 60)
    print("CONVERSIÓN CSV A PARQUET - PADRÓN RUC")
    print("=" * 60)
    
    output_file = OUTPUT_DIR / "padron_ruc_juridicas.parquet"
    
    # Schema para PyArrow
    schema = pa.schema([
        ('RUC', pa.string()),
        ('Estado', pa.string()),
        ('Condicion', pa.string()),
        ('Tipo', pa.string()),
        ('Actividad_CIIU3_Principal', pa.string()),
        ('Actividad_CIIU3_Secundaria', pa.string()),
        ('Actividad_CIIU4_Principal', pa.string()),
        ('NroTrab', pa.string()),
        ('TipoFacturacion', pa.string()),
        ('TipoContabilidad', pa.string()),
        ('ComercioExterior', pa.string()),
        ('UBIGEO', pa.string()),
        ('Departamento', pa.string()),
        ('Provincia', pa.string()),
        ('Distrito', pa.string()),
        ('PERIODO_PUBLICACION', pa.string()),
    ])
    
    # Nombres de columnas para mapear
    col_names = [
        'RUC', 'Estado', 'Condicion', 'Tipo',
        'Actividad_CIIU3_Principal', 'Actividad_CIIU3_Secundaria',
        'Actividad_CIIU4_Principal', 'NroTrab', 'TipoFacturacion',
        'TipoContabilidad', 'ComercioExterior', 'UBIGEO',
        'Departamento', 'Provincia', 'Distrito', 'PERIODO_PUBLICACION'
    ]
    
    writer = None
    total_rows = 0
    juridicas_rows = 0
    chunk_num = 0
    
    print(f"\nLeyendo archivo en chunks de {CHUNK_SIZE:,} registros...")
    print(f"Filtrando solo personas jurídicas (RUC empieza con 2)...\n")
    
    try:
        for chunk in pd.read_csv(
            INPUT_FILE,
            dtype=str,
            encoding='latin-1',  # Archivo tiene tildes y Ñ
            on_bad_lines='skip',
            chunksize=CHUNK_SIZE,
            low_memory=False
        ):
            chunk_num += 1
            total_rows += len(chunk)
            
            # Renombrar columnas
            chunk.columns = col_names
            
            # Filtrar solo personas jurídicas (RUC empieza con 2)
            chunk_juridicas = chunk[chunk['RUC'].str.startswith('2', na=False)].copy()
            juridicas_rows += len(chunk_juridicas)
            
            if len(chunk_juridicas) > 0:
                # Convertir a PyArrow Table
                table = pa.Table.from_pandas(chunk_juridicas, schema=schema, preserve_index=False)
                
                if writer is None:
                    writer = pq.ParquetWriter(output_file, schema, compression='snappy')
                
                writer.write_table(table)
            
            print(f"  Chunk {chunk_num}: {total_rows:,} procesados | {juridicas_rows:,} jurídicas")
    
    finally:
        if writer:
            writer.close()
    
    # Verificar archivo creado
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    
    print("\n" + "=" * 60)
    print("CONVERSIÓN COMPLETADA")
    print("=" * 60)
    print(f"Total registros procesados: {total_rows:,}")
    print(f"Personas jurídicas guardadas: {juridicas_rows:,}")
    print(f"Archivo de salida: {output_file}")
    print(f"Tamaño: {file_size:.1f} MB")
    
    return output_file

if __name__ == "__main__":
    convert_to_parquet()
