#!/usr/bin/env python3
"""
Script para analizar el padrón RUC y preparar datos para Empliq
- Filtrar personas jurídicas (RUC empieza con 2)
- Aplicar Pareto (20% empresas más grandes = 80% del impacto)
- Convertir a Parquet
"""

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path

# Configuración
INPUT_FILE = Path("/home/jimmy/Descargas/PadronRUC_202601.csv")
OUTPUT_DIR = Path("/home/jimmy/sueldos-organigrama/data")
OUTPUT_DIR.mkdir(exist_ok=True)

def main():
    print("=" * 60)
    print("ANÁLISIS DEL PADRÓN RUC PARA EMPLIQ")
    print("=" * 60)
    
    # 1. Leer archivo CSV
    print("\n1. Leyendo archivo CSV...")
    df = pd.read_csv(
        INPUT_FILE,
        dtype=str,
        encoding='utf-8',
        on_bad_lines='skip',
        low_memory=False
    )
    print(f"   Total registros: {len(df):,}")
    print(f"   Columnas: {list(df.columns)}")
    
    # 2. Filtrar personas jurídicas (RUC empieza con 2)
    print("\n2. Filtrando personas jurídicas...")
    df_juridicas = df[df['RUC'].str.startswith('2', na=False)].copy()
    print(f"   Personas jurídicas: {len(df_juridicas):,}")
    
    # 3. Filtrar solo ACTIVAS
    print("\n3. Filtrando solo ACTIVAS...")
    df_activas = df_juridicas[df_juridicas['Estado'] == 'ACTIVO'].copy()
    print(f"   Activas: {len(df_activas):,}")
    
    # 4. Analizar NroTrab
    print("\n4. Analizando número de trabajadores...")
    print(df_activas['NroTrab'].value_counts().head(20))
    
    # Convertir NroTrab a numérico (los que no tienen son "NO DISPONIBLE")
    df_activas['NroTrab_num'] = pd.to_numeric(df_activas['NroTrab'], errors='coerce')
    
    # Empresas con trabajadores registrados
    df_con_trab = df_activas[df_activas['NroTrab_num'].notna() & (df_activas['NroTrab_num'] > 0)].copy()
    print(f"\n   Empresas con trabajadores registrados: {len(df_con_trab):,}")
    
    # Estadísticas de trabajadores
    print(f"\n   Estadísticas de trabajadores:")
    print(df_con_trab['NroTrab_num'].describe())
    
    # 5. Aplicar Pareto - top 20% de empresas por trabajadores
    print("\n5. Aplicando Pareto (top 20% empresas más grandes)...")
    df_sorted = df_con_trab.sort_values('NroTrab_num', ascending=False)
    
    # Calcular acumulado
    total_trabajadores = df_sorted['NroTrab_num'].sum()
    df_sorted['trabajadores_acum'] = df_sorted['NroTrab_num'].cumsum()
    df_sorted['porcentaje_acum'] = df_sorted['trabajadores_acum'] / total_trabajadores * 100
    
    # Top 20% de empresas
    top_20_count = int(len(df_sorted) * 0.20)
    df_top20 = df_sorted.head(top_20_count)
    
    print(f"   Total empresas con trabajadores: {len(df_sorted):,}")
    print(f"   Top 20% empresas: {top_20_count:,}")
    print(f"   Trabajadores cubiertos por top 20%: {df_top20['porcentaje_acum'].iloc[-1]:.1f}%")
    
    # 6. Diferentes niveles de empresas
    print("\n6. Segmentación de empresas:")
    
    # Grandes (>500 trabajadores)
    grandes = df_sorted[df_sorted['NroTrab_num'] >= 500]
    print(f"   Grandes (>=500 trab): {len(grandes):,}")
    
    # Medianas (100-499 trabajadores)  
    medianas = df_sorted[(df_sorted['NroTrab_num'] >= 100) & (df_sorted['NroTrab_num'] < 500)]
    print(f"   Medianas (100-499 trab): {len(medianas):,}")
    
    # Pequeñas (10-99 trabajadores)
    pequenas = df_sorted[(df_sorted['NroTrab_num'] >= 10) & (df_sorted['NroTrab_num'] < 100)]
    print(f"   Pequeñas (10-99 trab): {len(pequenas):,}")
    
    # 7. Guardar datasets
    print("\n7. Guardando datasets...")
    
    # Dataset completo de jurídicas activas
    output_all = OUTPUT_DIR / "ruc_juridicas_activas.parquet"
    df_activas.to_parquet(output_all, engine='pyarrow', index=False)
    print(f"   Guardado: {output_all}")
    
    # Dataset con trabajadores
    output_trab = OUTPUT_DIR / "ruc_con_trabajadores.parquet"
    df_con_trab.to_parquet(output_trab, engine='pyarrow', index=False)
    print(f"   Guardado: {output_trab}")
    
    # Top 20% (Pareto)
    output_pareto = OUTPUT_DIR / "ruc_pareto_top20.parquet"
    df_top20.to_parquet(output_pareto, engine='pyarrow', index=False)
    print(f"   Guardado: {output_pareto}")
    
    # Empresas grandes y medianas (para scrapear primero)
    df_prioridad = df_sorted[df_sorted['NroTrab_num'] >= 100].copy()
    output_prioridad = OUTPUT_DIR / "ruc_empresas_prioridad.parquet"
    df_prioridad.to_parquet(output_prioridad, engine='pyarrow', index=False)
    print(f"   Guardado: {output_prioridad} ({len(df_prioridad):,} empresas)")
    
    # También exportar a CSV para revisión
    output_csv = OUTPUT_DIR / "ruc_empresas_prioridad.csv"
    df_prioridad.to_csv(output_csv, index=False)
    print(f"   Guardado: {output_csv}")
    
    # 8. Resumen final
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"Total registros originales: {len(df):,}")
    print(f"Personas jurídicas activas: {len(df_activas):,}")
    print(f"Con trabajadores registrados: {len(df_con_trab):,}")
    print(f"Empresas prioridad (>=100 trab): {len(df_prioridad):,}")
    print(f"Top 20% Pareto: {top_20_count:,}")
    
    # Mostrar top 50 empresas por trabajadores
    print("\n" + "=" * 60)
    print("TOP 50 EMPRESAS POR NÚMERO DE TRABAJADORES")
    print("=" * 60)
    top50 = df_sorted.head(50)[['RUC', 'NroTrab_num', 'Actividad_Economica_CIIU_revision3_Principal', 'Departamento']]
    print(top50.to_string())

if __name__ == "__main__":
    main()
