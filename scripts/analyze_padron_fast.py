#!/usr/bin/env python3
"""
Genera UN solo CSV con tier4 + tier5 excluyendo los 6123 ya procesados.
- tier4: 50-99 trabajadores
- tier5: 20-49 trabajadores
- Solo jurídicas activas (RUC empieza con 2, Estado=ACTIVO)
"""
import os

PADRON = "/home/jimmy/Descargas/PadronRUC_202601.csv"
EXISTING = "/home/jimmy/sueldos-organigrama/data/all_companies.csv"
OUTPUT = "/home/jimmy/sueldos-organigrama/data/tier4_5_companies.csv"k

# 1. Cargar RUCs existentes
existing = set()
with open(EXISTING, 'r') as f:
    next(f)
    for line in f:k
        existing.add(line.split(',')[0].strip())
print(f"Ya procesados: {len(existing)}")

# 2. Leer padron y filtrar
HEADER = "RUC,RazonSocial,Estado,Condicion,Tipo,Actividad_CIIU3_Principal,NroTrab,NroTrab_num,Departamento,Provincia,Distrito\n"

rows = []
stats = {'total_jur': 0, 'activas': 0, 'ya_tenemos': 0, 'sin_data': 0, 'tier4': 0, 'tier5': 0, 'otros': 0}

print(f"Leyendo {PADRON} (~13M líneas, toma ~2min)...")
with open(PADRON, 'r', encoding='latin-1') as f:
    next(f)
    for i, line in enumerate(f):
        if i % 3_000_000 == 0 and i > 0:
            print(f"  ...{i:,} líneas")

        parts = line.split(',')
        if len(parts) < 16:
            continue

        ruc = parts[0]
        if not ruc.startswith('2'):
            continue
        stats['total_jur'] += 1

        if parts[1] != 'ACTIVO':
            continue
        stats['activas'] += 1

        if ruc in existing:
            stats['ya_tenemos'] += 1
            continue

        nro = parts[7].strip()
        if nro in ('NO DISPONIBLE', '', '0'):
            stats['sin_data'] += 1
            continue
        try:
            n = int(nro)
        except ValueError:
            stats['sin_data'] += 1
            continue

        if n >= 50:
            tier = 'tier4'
            stats['tier4'] += 1
        elif n >= 20:
            tier = 'tier5'
            stats['tier5'] += 1
        else:
            stats['otros'] += 1
            continue

        rows.append((n, f"{ruc},,ACTIVO,{parts[2]},{parts[3]},{parts[4]},{nro},{n},{parts[12]},{parts[13]},{parts[14]}"))

# 3. Ordenar por trabajadores desc y escribir UN solo CSV
rows.sort(key=lambda x: -x[0])
with open(OUTPUT, 'w') as f:
    f.write(HEADER)
    for _, row in rows:
        f.write(row + '\n')

print(f"\n{'='*50}")
print(f"RESULTADO")
print(f"{'='*50}")
print(f"Jurídicas totales: {stats['total_jur']:,}")
print(f"Activas: {stats['activas']:,}")
print(f"Ya en DB: {stats['ya_tenemos']:,}")
print(f"Sin dato empleados: {stats['sin_data']:,}")
print(f"Muy chicas (<20): {stats['otros']:,}")
print(f"")
print(f"NUEVO CSV: {OUTPUT}")
print(f"  tier4 (50-99): {stats['tier4']:,}")
print(f"  tier5 (20-49): {stats['tier5']:,}")
print(f"  TOTAL: {stats['tier4'] + stats['tier5']:,}")
