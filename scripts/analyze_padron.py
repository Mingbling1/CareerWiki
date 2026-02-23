#!/usr/bin/env python3
"""Analyze PadronRUC to create tier 4/5 CSVs for n8n enrichment."""
import csv
import sys
import os

PADRON = "/home/jimmy/Descargas/PadronRUC_202601.csv"
EXISTING = "/home/jimmy/sueldos-organigrama/data/all_companies.csv"
OUT_DIR = "/home/jimmy/sueldos-organigrama/data"

def load_existing_rucs():
    rucs = set()
    with open(EXISTING, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rucs.add(row['RUC'].strip())
    print(f"Already processed: {len(rucs)} RUCs")
    return rucs

def analyze_and_export():
    existing = load_existing_rucs()
    
    # Stats
    total = 0
    tiers = {
        'tier1': [], 'tier2': [], 'tier3': [],
        'tier4': [], 'tier5': [],
        'no_data': 0, 'tiny': 0, 'inactive': 0, 'persona_natural': 0
    }
    
    print(f"Reading {PADRON}...")
    with open(PADRON, 'r', encoding='latin-1') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ruc = row['RUC'].strip()
            
            # Only juridical entities (start with 2)
            if not ruc.startswith('2'):
                tiers['persona_natural'] += 1
                continue
            
            total += 1
            
            # Only active
            if row['Estado'].strip() != 'ACTIVO':
                tiers['inactive'] += 1
                continue
            
            # Skip already processed
            if ruc in existing:
                continue
            
            nro_str = row.get('NroTrab', 'NO DISPONIBLE').strip()
            if nro_str in ('NO DISPONIBLE', '', '0'):
                tiers['no_data'] += 1
                continue
            
            try:
                n = int(nro_str)
            except ValueError:
                tiers['no_data'] += 1
                continue
            
            # Classify
            entry = {
                'RUC': ruc,
                'RazonSocial': '',  # Not in padron
                'Estado': row['Estado'].strip(),
                'Condicion': row['Condicion'].strip(),
                'Tipo': row['Tipo'].strip(),
                'Actividad_CIIU3_Principal': row.get('Actividad_Economica_CIIU_revision3_Principal', '').strip(),
                'NroTrab': nro_str,
                'NroTrab_num': n,
                'Departamento': row.get('Departamento', '').strip(),
                'Provincia': row.get('Provincia', '').strip(),
                'Distrito': row.get('Distrito', '').strip(),
            }
            
            if n >= 1000:
                tiers['tier1'].append(entry)  # should be mostly in existing
            elif n >= 500:
                tiers['tier2'].append(entry)
            elif n >= 100:
                tiers['tier3'].append(entry)
            elif n >= 50:
                tiers['tier4'].append(entry)
            elif n >= 20:
                tiers['tier5'].append(entry)
            elif n >= 5:
                tiers['tiny'] += 1  # too small for now
            else:
                tiers['tiny'] += 1
    
    print(f"\n{'='*60}")
    print(f"PADRON ANALYSIS")
    print(f"{'='*60}")
    print(f"Total juridicas: {total:,}")
    print(f"Persona natural (skipped): {tiers['persona_natural']:,}")
    print(f"Inactive (skipped): {tiers['inactive']:,}")
    print(f"No employee data: {tiers['no_data']:,}")
    print(f"Too small (<5): {tiers['tiny']:,}")
    print(f"")
    print(f"NEW companies not yet in DB:")
    print(f"  tier1 (>=1000): {len(tiers['tier1']):,}")
    print(f"  tier2 (500-999): {len(tiers['tier2']):,}")
    print(f"  tier3 (100-499): {len(tiers['tier3']):,}")
    print(f"  tier4 (50-99): {len(tiers['tier4']):,}")
    print(f"  tier5 (20-49): {len(tiers['tier5']):,}")
    
    new_total = len(tiers['tier4']) + len(tiers['tier5'])
    all_new = sum(len(tiers[f'tier{i}']) for i in range(1,6))
    print(f"\n  Total new tier4+5: {new_total:,}")
    print(f"  Total all new: {all_new:,}")
    print(f"  Already done: {len(existing):,}")
    print(f"  Grand total after: {len(existing) + all_new:,}")
    
    # Export tier4
    fields = ['RUC','RazonSocial','Estado','Condicion','Tipo','Actividad_CIIU3_Principal','NroTrab','NroTrab_num','Departamento','Provincia','Distrito']
    
    t4_path = os.path.join(OUT_DIR, 'tier4_50_99.csv')
    with open(t4_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for entry in sorted(tiers['tier4'], key=lambda x: -x['NroTrab_num']):
            writer.writerow(entry)
    print(f"\nExported: {t4_path} ({len(tiers['tier4']):,} rows)")
    
    t5_path = os.path.join(OUT_DIR, 'tier5_20_49.csv')
    with open(t5_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for entry in sorted(tiers['tier5'], key=lambda x: -x['NroTrab_num']):
            writer.writerow(entry)
    print(f"Exported: {t5_path} ({len(tiers['tier5']):,} rows)")
    
    # Also export any new tier1-3 that weren't in our original CSV
    if len(tiers['tier1']) + len(tiers['tier2']) + len(tiers['tier3']) > 0:
        extra_path = os.path.join(OUT_DIR, 'tier123_new.csv')
        with open(extra_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for t in ['tier1', 'tier2', 'tier3']:
                for entry in sorted(tiers[t], key=lambda x: -x['NroTrab_num']):
                    writer.writerow(entry)
        total_extra = len(tiers['tier1']) + len(tiers['tier2']) + len(tiers['tier3'])
        print(f"Exported: {extra_path} ({total_extra:,} rows - NEW tier1/2/3 not in original CSV)")

if __name__ == '__main__':
    analyze_and_export()
