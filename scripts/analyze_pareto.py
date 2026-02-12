#!/usr/bin/env python3
"""
Script para analizar el padrón RUC y aplicar Pareto
- Lee el archivo Parquet ya filtrado
- Analiza distribución de trabajadores
- Aplica Pareto 20/80
- Genera datasets priorizados para scraping
"""

import pandas as pd
import pyarrow.parquet as pq
from pathlib import Path
import json

# Configuración
DATA_DIR = Path("/home/jimmy/sueldos-organigrama/data")
INPUT_FILE = DATA_DIR / "padron_ruc_juridicas.parquet"

def main():
    print("=" * 70)
    print("ANÁLISIS PARETO - PADRÓN RUC PERSONAS JURÍDICAS")
    print("=" * 70)
    
    # 1. Leer archivo Parquet
    print("\n1. Leyendo archivo Parquet...")
    df = pd.read_parquet(INPUT_FILE)
    print(f"   Total personas jurídicas: {len(df):,}")
    print(f"   Columnas: {list(df.columns)}")
    
    # 2. Análisis de Estado y Condición
    print("\n2. Análisis de Estado:")
    print(df['Estado'].value_counts())
    
    # 3. Filtrar solo ACTIVAS
    print("\n3. Filtrando solo empresas ACTIVAS...")
    df_activas = df[df['Estado'] == 'ACTIVO'].copy()
    print(f"   Empresas activas: {len(df_activas):,}")
    
    # 4. Análisis de tipos de empresa
    print("\n4. Tipos de empresa:")
    print(df_activas['Tipo'].value_counts().head(15))
    
    # 5. Análisis de número de trabajadores
    print("\n5. Análisis de NroTrab:")
    print(df_activas['NroTrab'].value_counts().head(20))
    
    # Convertir NroTrab a numérico
    df_activas['NroTrab_num'] = pd.to_numeric(df_activas['NroTrab'], errors='coerce')
    
    # Empresas con trabajadores registrados
    df_con_trab = df_activas[df_activas['NroTrab_num'].notna() & (df_activas['NroTrab_num'] > 0)].copy()
    print(f"\n   Empresas con trabajadores registrados: {len(df_con_trab):,}")
    print(f"   Empresas sin dato de trabajadores: {len(df_activas) - len(df_con_trab):,}")
    
    # Estadísticas
    print("\n   Estadísticas de trabajadores:")
    print(df_con_trab['NroTrab_num'].describe())
    
    # 6. Segmentación por tamaño
    print("\n6. Segmentación por tamaño de empresa:")
    
    def clasificar_tamano(x):
        if pd.isna(x): return 'Sin dato'
        if x >= 1000: return 'Gran empresa (>=1000)'
        if x >= 500: return 'Grande (500-999)'
        if x >= 100: return 'Mediana (100-499)'
        if x >= 50: return 'Pequeña (50-99)'
        if x >= 10: return 'Micro-mediana (10-49)'
        return 'Micro (<10)'
    
    df_con_trab['Tamano'] = df_con_trab['NroTrab_num'].apply(clasificar_tamano)
    print(df_con_trab['Tamano'].value_counts())
    
    # 7. Aplicar Pareto
    print("\n7. APLICANDO PARETO 20/80...")
    df_sorted = df_con_trab.sort_values('NroTrab_num', ascending=False).reset_index(drop=True)
    
    # Calcular acumulados
    total_trabajadores = df_sorted['NroTrab_num'].sum()
    df_sorted['trabajadores_acum'] = df_sorted['NroTrab_num'].cumsum()
    df_sorted['porcentaje_trab_acum'] = df_sorted['trabajadores_acum'] / total_trabajadores * 100
    df_sorted['empresa_num'] = range(1, len(df_sorted) + 1)
    df_sorted['porcentaje_empresas'] = df_sorted['empresa_num'] / len(df_sorted) * 100
    
    # Encontrar punto Pareto
    pareto_80 = df_sorted[df_sorted['porcentaje_trab_acum'] <= 80]
    pareto_empresas_pct = len(pareto_80) / len(df_sorted) * 100
    
    print(f"\n   Total empresas con trabajadores: {len(df_sorted):,}")
    print(f"   Total trabajadores: {total_trabajadores:,.0f}")
    print(f"\n   PARETO: {len(pareto_80):,} empresas ({pareto_empresas_pct:.1f}%) tienen el 80% de trabajadores")
    
    # 8. Crear datasets priorizados
    print("\n8. Creando datasets priorizados...")
    
    # Tier 1: Empresas MEGA (>=1000 trabajadores)
    tier1 = df_sorted[df_sorted['NroTrab_num'] >= 1000].copy()
    print(f"\n   Tier 1 (>=1000 trab): {len(tier1):,} empresas")
    
    # Tier 2: Empresas Grandes (500-999)
    tier2 = df_sorted[(df_sorted['NroTrab_num'] >= 500) & (df_sorted['NroTrab_num'] < 1000)].copy()
    print(f"   Tier 2 (500-999 trab): {len(tier2):,} empresas")
    
    # Tier 3: Empresas Medianas (100-499)
    tier3 = df_sorted[(df_sorted['NroTrab_num'] >= 100) & (df_sorted['NroTrab_num'] < 500)].copy()
    print(f"   Tier 3 (100-499 trab): {len(tier3):,} empresas")
    
    # Combinados para scraping prioritario
    df_prioridad = pd.concat([tier1, tier2, tier3])
    print(f"\n   TOTAL PRIORIDAD (>=100 trab): {len(df_prioridad):,} empresas")
    
    # 9. Guardar datasets
    print("\n9. Guardando datasets...")
    
    # Dataset completo activas
    df_activas.to_parquet(DATA_DIR / "ruc_activas.parquet", index=False)
    print(f"   Guardado: ruc_activas.parquet ({len(df_activas):,} registros)")
    
    # Dataset con trabajadores
    df_sorted.to_parquet(DATA_DIR / "ruc_con_trabajadores.parquet", index=False)
    print(f"   Guardado: ruc_con_trabajadores.parquet ({len(df_sorted):,} registros)")
    
    # Pareto 80%
    pareto_80.to_parquet(DATA_DIR / "ruc_pareto_80.parquet", index=False)
    print(f"   Guardado: ruc_pareto_80.parquet ({len(pareto_80):,} registros)")
    
    # Prioridad para scraping
    df_prioridad.to_parquet(DATA_DIR / "ruc_prioridad_scraping.parquet", index=False)
    df_prioridad.to_csv(DATA_DIR / "ruc_prioridad_scraping.csv", index=False)
    print(f"   Guardado: ruc_prioridad_scraping.parquet/csv ({len(df_prioridad):,} registros)")
    
    # Tiers individuales
    tier1.to_parquet(DATA_DIR / "tier1_mega.parquet", index=False)
    tier2.to_parquet(DATA_DIR / "tier2_grandes.parquet", index=False)
    tier3.to_parquet(DATA_DIR / "tier3_medianas.parquet", index=False)
    
    tier1.to_csv(DATA_DIR / "tier1_mega.csv", index=False)
    tier2.to_csv(DATA_DIR / "tier2_grandes.csv", index=False)
    tier3.to_csv(DATA_DIR / "tier3_medianas.csv", index=False)
    
    print(f"   Guardado: tier1_mega.parquet/csv ({len(tier1):,} registros)")
    print(f"   Guardado: tier2_grandes.parquet/csv ({len(tier2):,} registros)")
    print(f"   Guardado: tier3_medianas.parquet/csv ({len(tier3):,} registros)")
    
    # 10. Mostrar TOP empresas
    print("\n" + "=" * 70)
    print("TOP 30 EMPRESAS POR NÚMERO DE TRABAJADORES")
    print("=" * 70)
    
    top30 = tier1.head(30)[['RUC', 'NroTrab_num', 'Tipo', 'Actividad_CIIU3_Principal', 'Departamento']]
    pd.set_option('display.max_colwidth', 50)
    pd.set_option('display.width', 200)
    print(top30.to_string())
    
    # 11. Análisis por sector (CIIU)
    print("\n" + "=" * 70)
    print("TOP 15 SECTORES ECONÓMICOS (Empresas prioridad)")
    print("=" * 70)
    print(df_prioridad['Actividad_CIIU3_Principal'].value_counts().head(15))
    
    # 12. Análisis por departamento
    print("\n" + "=" * 70)
    print("DISTRIBUCIÓN POR DEPARTAMENTO (Empresas prioridad)")
    print("=" * 70)
    print(df_prioridad['Departamento'].value_counts())
    
    # 13. Resumen para n8n
    print("\n" + "=" * 70)
    print("RESUMEN PARA AUTOMATIZACIÓN n8n")
    print("=" * 70)
    
    resumen = {
        "total_personas_juridicas": int(len(df)),
        "total_activas": int(len(df_activas)),
        "con_trabajadores": int(len(df_con_trab)),
        "pareto_80_empresas": int(len(pareto_80)),
        "tier1_mega": int(len(tier1)),
        "tier2_grandes": int(len(tier2)),
        "tier3_medianas": int(len(tier3)),
        "total_prioridad": int(len(df_prioridad)),
        "archivos_generados": [
            "ruc_prioridad_scraping.csv",
            "tier1_mega.csv",
            "tier2_grandes.csv", 
            "tier3_medianas.csv"
        ]
    }
    
    # Guardar resumen JSON
    with open(DATA_DIR / "resumen_analisis.json", "w") as f:
        json.dump(resumen, f, indent=2)
    
    print(json.dumps(resumen, indent=2))
    
    print("\n✅ Análisis completado!")
    print(f"   Archivos guardados en: {DATA_DIR}")

if __name__ == "__main__":
    main()
