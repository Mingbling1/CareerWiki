#!/usr/bin/env python3
"""
============================================
EMPLIQ — Data Migration Script (Python)
============================================

Migra datos de empresas desde empliq_dev (Oracle server)
a empliq o empliq_pre_prod (PostgreSQL local via Docker).

Features:
  - Incremental: solo migra empresas no existentes en el destino
  - Tracking: registra cada migración en _migration_log
  - Idempotente: seguro para ejecutar múltiples veces
  - Logo-aware: mapea logo_bucket_url cuando está disponible
  - Genera slugs desde nombres de empresa
  - Conexión SSH directa (sin shells anidados)

Uso:
  python3 migrate_companies.py                       # → empliq_pre_prod (default)
  python3 migrate_companies.py --target=empliq       # → producción
  python3 migrate_companies.py --limit=100           # primeras 100 empresas
  python3 migrate_companies.py --dry-run             # preview, sin escritura
  python3 migrate_companies.py --update-logos        # solo actualizar logos
  python3 migrate_companies.py --stats               # mostrar estadísticas

Dependencias:
  pip install psycopg2-binary sshtunnel
"""

import argparse
import json
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime

import psycopg2
import psycopg2.extras

# ============================================
# Configuration
# ============================================
ORACLE_HOST = os.getenv("ORACLE_HOST", "163.176.250.185")
ORACLE_SSH_USER = "ubuntu"
ORACLE_SSH_KEY = os.path.expanduser(os.getenv("ORACLE_SSH_KEY", "~/.ssh/oracle_instance_key"))
ORACLE_DB_NAME = "empliq_dev"
ORACLE_DB_USER = "postgres"
ORACLE_DB_PASS = "postgres123"
ORACLE_PG_PORT = 5432  # Port inside the Docker container
ORACLE_DOCKER_IP = "172.19.0.2"  # musuq-postgres container IP on Docker network

# Local Docker PostgreSQL (exposed on host)
LOCAL_DB_USER = os.getenv("LOCAL_DB_USER", "empliq")
LOCAL_DB_PASS = os.getenv("LOCAL_DB_PASS", "empliq_dev_password")
LOCAL_DB_HOST = os.getenv("LOCAL_DB_HOST", "localhost")
LOCAL_DB_PORT = int(os.getenv("LOCAL_DB_PORT", "5432"))

BATCH_SIZE = 500


# ============================================
# Helpers
# ============================================
def generate_slug(name: str) -> str:
    """Generate URL-safe slug from company name."""
    slug = name.lower().strip()
    replacements = {
        "áàäâ": "a", "éèëê": "e", "íìïî": "i",
        "óòöô": "o", "úùüû": "u", "ñ": "n",
    }
    for chars, repl in replacements.items():
        for c in chars:
            slug = slug.replace(c, repl)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def connect_oracle_via_ssh():
    """Create SSH tunnel to Oracle server and return (tunnel_process, connection).
    
    Uses subprocess SSH tunnel instead of paramiko for Python 3.14 compatibility.
    """
    import time
    import socket

    # Find a free local port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        local_port = s.getsockname()[1]

    # Start SSH tunnel in background
    tunnel_cmd = [
        "ssh", "-N", "-L", f"{local_port}:{ORACLE_DOCKER_IP}:{ORACLE_PG_PORT}",
        "-i", ORACLE_SSH_KEY,
        "-o", "StrictHostKeyChecking=no",
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=10",
        f"{ORACLE_SSH_USER}@{ORACLE_HOST}",
    ]
    tunnel_proc = subprocess.Popen(tunnel_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    # Wait for tunnel to be ready
    for attempt in range(20):
        time.sleep(0.5)
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                s.connect(("127.0.0.1", local_port))
                break
        except (ConnectionRefusedError, OSError):
            if tunnel_proc.poll() is not None:
                stderr = tunnel_proc.stderr.read().decode()
                raise ConnectionError(f"SSH tunnel died: {stderr}")
    else:
        tunnel_proc.terminate()
        raise ConnectionError("SSH tunnel timeout after 10s")

    conn = psycopg2.connect(
        host="127.0.0.1",
        port=local_port,
        dbname=ORACLE_DB_NAME,
        user=ORACLE_DB_USER,
        password=ORACLE_DB_PASS,
        connect_timeout=10,
    )
    return tunnel_proc, conn


def connect_local(db_name: str):
    """Connect to local Docker PostgreSQL."""
    return psycopg2.connect(
        host=LOCAL_DB_HOST,
        port=LOCAL_DB_PORT,
        dbname=db_name,
        user=LOCAL_DB_USER,
        password=LOCAL_DB_PASS,
    )


# ============================================
# Stats
# ============================================
def show_stats(oracle_conn, target_db: str):
    print("\n📊 Migration Stats")
    print("=" * 55)

    with oracle_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM companies_raw")
        total = cur.fetchone()[0]

        cur.execute("SELECT count(*) FROM companies_raw WHERE data->>'scrape_status' = 'enriched'")
        enriched = cur.fetchone()[0]

        cur.execute("SELECT count(*) FROM companies_raw WHERE logo_bucket_url IS NOT NULL AND logo_bucket_url != ''")
        with_logo = cur.fetchone()[0]

    print(f"\n📦 Source (empliq_dev @ Oracle):")
    print(f"   Total companies_raw:     {total:,}")
    print(f"   Enriched (migratable):   {enriched:,}")
    print(f"   With logo:               {with_logo}")

    for db in ["empliq", "empliq_pre_prod"]:
        try:
            local_conn = connect_local(db)
            with local_conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM companies")
                companies = cur.fetchone()[0]

                cur.execute(f"SELECT count(*) FROM _migration_log WHERE target_db = %s AND status = 'success'", (db,))
                migrated = cur.fetchone()[0]

                cur.execute(f"SELECT count(*) FROM _migration_log WHERE target_db = %s AND status = 'failed'", (db,))
                failed = cur.fetchone()[0]

                cur.execute("SELECT count(*) FROM companies WHERE logo_url IS NOT NULL AND logo_url != ''")
                logos = cur.fetchone()[0]

            local_conn.close()

            print(f"\n🎯 Target ({db}):")
            print(f"   Companies:    {companies:,}")
            print(f"   Migrated:     {migrated:,}")
            print(f"   Failed:       {failed}")
            print(f"   With logo:    {logos}")
        except Exception as e:
            print(f"\n🎯 Target ({db}): ❌ Error connecting — {e}")

    # Pending
    try:
        local_conn = connect_local(target_db)
        with local_conn.cursor() as cur:
            cur.execute("SELECT array_agg(ruc) FROM _migration_log WHERE status = 'success'")
            migrated_rucs = cur.fetchone()[0] or []
        local_conn.close()

        with oracle_conn.cursor() as cur:
            if migrated_rucs:
                cur.execute(
                    "SELECT count(*) FROM companies_raw WHERE data->>'scrape_status' = 'enriched' AND ruc != ALL(%s)",
                    (migrated_rucs,)
                )
            else:
                cur.execute("SELECT count(*) FROM companies_raw WHERE data->>'scrape_status' = 'enriched'")
            pending = cur.fetchone()[0]

        print(f"\n⏳ Pending migration → {target_db}: {pending:,} companies")
    except Exception as e:
        print(f"\n⏳ Could not calculate pending: {e}")

    print()


# ============================================
# Update Logos Only
# ============================================
def update_logos(oracle_conn, target_db: str, dry_run: bool):
    print(f"\n🖼️  Updating logos in {target_db}...\n")

    with oracle_conn.cursor() as cur:
        cur.execute("""
            SELECT ruc, logo_bucket_url
            FROM companies_raw
            WHERE logo_bucket_url IS NOT NULL
              AND logo_bucket_url != ''
              AND data->>'scrape_status' = 'enriched'
        """)
        rows = cur.fetchall()

    if not rows:
        print("   No companies with logos found.")
        return

    local_conn = connect_local(target_db)
    updated = 0

    try:
        with local_conn.cursor() as cur:
            for ruc, logo_url in rows:
                if dry_run:
                    print(f"   [DRY] Would update logo for RUC {ruc}: {logo_url}")
                    updated += 1
                else:
                    cur.execute("""
                        UPDATE companies SET logo_url = %s, updated_at = NOW()
                        WHERE ruc = %s AND (logo_url IS NULL OR logo_url = '')
                        RETURNING ruc
                    """, (logo_url, ruc))
                    if cur.fetchone():
                        updated += 1
                        print(f"   ✅ Updated logo for {ruc}")

            if not dry_run:
                local_conn.commit()
    finally:
        local_conn.close()

    prefix = "[DRY RUN] " if dry_run else ""
    print(f"\n{prefix}Updated {updated}/{len(rows)} logos\n")


# ============================================
# Main Migration
# ============================================
def migrate(oracle_conn, target_db: str, limit: int | None, dry_run: bool):
    print(f"\n🚀 Migrating empliq_dev → {target_db}")
    print(f"   {'🔍 DRY RUN MODE' if dry_run else '💾 LIVE MODE'}")
    if limit:
        print(f"   Limit: {limit} companies")
    print()

    # Step 1: Get already-migrated RUCs from target DB
    local_conn = connect_local(target_db)

    try:
        with local_conn.cursor() as cur:
            cur.execute("SELECT ruc FROM _migration_log WHERE target_db = %s AND status = 'success'", (target_db,))
            migrated_rucs = {row[0] for row in cur.fetchall()}
    except Exception:
        migrated_rucs = set()

    print(f"   Already migrated: {len(migrated_rucs):,} companies")

    # Step 2: Fetch enriched companies from Oracle (ALL fields)
    with oracle_conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        query = """
            SELECT
                ruc,
                razon_social,
                COALESCE(logo_bucket_url, '') as logo_bucket_url,
                data
            FROM companies_raw
            WHERE data->>'scrape_status' = 'enriched'
            ORDER BY (data->>'nro_trabajadores')::int DESC NULLS LAST
        """
        if limit:
            query += f" LIMIT {limit}"

        print("   Fetching data from Oracle...")
        cur.execute(query)
        rows = cur.fetchall()

    # Filter out already migrated
    rows = [r for r in rows if r["ruc"] not in migrated_rucs]
    print(f"   Found {len(rows):,} companies to migrate\n")

    if not rows:
        print("   ✅ No new companies to migrate!")
        local_conn.close()
        return

    # Step 3: Process companies
    success_count = 0
    skip_count = 0
    fail_count = 0

    # Get existing slugs from target for dedup
    with local_conn.cursor() as cur:
        cur.execute("SELECT slug FROM companies")
        existing_slugs = {row[0] for row in cur.fetchall()}

    with local_conn.cursor() as cur:
        for i, row in enumerate(rows):
            ruc = row["ruc"]
            razon_social = row["razon_social"] or ""
            logo_url = row["logo_bucket_url"].strip() or None

            # Parse the full JSONB data
            data = row["data"] or {}
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except (json.JSONDecodeError, TypeError):
                    data = {}

            def safe_str(val):
                """Safely get a stripped string, handling None."""
                if val is None:
                    return ""
                return str(val).strip()

            # Extract main fields
            company_name = (safe_str(data.get("name")) or razon_social.strip() or "Sin Nombre")
            description = safe_str(data.get("description")) or None
            website = safe_str(data.get("website")) or None

            # Industry: prefer sector_economico (rich), fallback to industry
            industry = safe_str(data.get("sector_economico")) or safe_str(data.get("industry")) or None

            # Employee count
            emp_str = safe_str(data.get("nro_trabajadores"))
            employee_count = int(emp_str) if emp_str and emp_str.isdigit() else None

            # Founded year: extract from fecha_inicio (format: DD/MM/YYYY)
            fecha_inicio = safe_str(data.get("fecha_inicio"))
            founded_year = None
            if fecha_inicio:
                # Try DD/MM/YYYY format
                parts = fecha_inicio.split("/")
                if len(parts) == 3 and parts[2].isdigit() and len(parts[2]) == 4:
                    founded_year = int(parts[2])
            if not founded_year:
                fy_str = safe_str(data.get("founded_year"))
                founded_year = int(fy_str) if fy_str and fy_str.isdigit() else None

            # Location: build from distrito, provincia, departamento
            distrito = safe_str(data.get("distrito"))
            provincia = safe_str(data.get("provincia"))
            departamento = safe_str(data.get("departamento"))
            location_parts = [p for p in [distrito, provincia, departamento] if p and p != "-"]
            location = ", ".join(location_parts) if location_parts else None

            # Generate slug, handle duplicates
            slug = generate_slug(company_name)
            if not slug:
                slug = f"empresa-{ruc}"

            if slug in existing_slugs:
                slug = f"{slug}-{ruc}"

            if dry_run:
                emp_display = f"{employee_count:,}" if employee_count else "-"
                print(f"   [DRY] {ruc} | {company_name[:45]:<45} | {slug[:35]:<35} | emp: {emp_display:>8} | {location or '-'}")
                success_count += 1
                existing_slugs.add(slug)
                continue

            # Build rich metadata with ALL available source data
            metadata_dict = {
                "razon_social": razon_social,
                "source": "empliq_dev",
                "migrated_at": datetime.now(tz=__import__('datetime').timezone.utc).isoformat(),
            }

            # Add all rich fields if present
            rich_fields = [
                "direccion", "distrito", "provincia", "departamento",
                "sector_economico", "actividad_ciiu", "tipo_empresa",
                "condicion", "estado", "fecha_inicio", "fecha_inscripcion",
                "telefonos", "ejecutivos",
                "historial_trabajadores", "historial_condiciones",
                "historial_direcciones", "establecimientos_anexos",
                "comercio_exterior", "referencia",
                "proveedor_estado", "tier",
            ]
            for field in rich_fields:
                val = data.get(field)
                if val is not None and val != "" and val != []:
                    metadata_dict[field] = val

            metadata = json.dumps(metadata_dict, default=str)

            company_id = str(uuid.uuid4())

            try:
                cur.execute("""
                    INSERT INTO companies (id, ruc, name, slug, description, industry, employee_count,
                                           location, website, logo_url, founded_year, is_verified, metadata,
                                           created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, false, %s::jsonb, NOW(), NOW())
                    ON CONFLICT (ruc) DO NOTHING
                    RETURNING id
                """, (company_id, ruc, company_name, slug, description, industry,
                      employee_count, location, website, logo_url, founded_year, metadata))

                result = cur.fetchone()

                if result:
                    inserted_id = result[0]
                    # Log success
                    cur.execute("""
                        INSERT INTO _migration_log (ruc, source_db, target_db, company_id, status)
                        VALUES (%s, 'empliq_dev', %s, %s::uuid, 'success')
                        ON CONFLICT (ruc, target_db) DO NOTHING
                    """, (ruc, target_db, inserted_id))

                    success_count += 1
                    existing_slugs.add(slug)
                else:
                    skip_count += 1

                # Commit in batches
                if success_count % BATCH_SIZE == 0 and success_count > 0:
                    local_conn.commit()
                    print(f"   ✅ Progress: {success_count:,}/{len(rows):,} migrated...")

            except Exception as e:
                local_conn.rollback()
                fail_count += 1
                # Log failure
                try:
                    cur.execute("""
                        INSERT INTO _migration_log (ruc, source_db, target_db, status, error_message)
                        VALUES (%s, 'empliq_dev', %s, 'failed', %s)
                        ON CONFLICT (ruc, target_db)
                        DO UPDATE SET status = 'failed', error_message = %s, migrated_at = NOW()
                    """, (ruc, target_db, str(e)[:500], str(e)[:500]))
                    local_conn.commit()
                except Exception:
                    local_conn.rollback()

                print(f"   ❌ Failed: {ruc} | {company_name[:40]} — {str(e)[:80]}")

        # Final commit
        if not dry_run:
            local_conn.commit()

    local_conn.close()

    # Summary
    print(f"\n{'=' * 55}")
    print(f"📊 Migration Summary → {target_db}")
    print(f"   ✅ Migrated:   {success_count:,}")
    print(f"   ⏭️  Skipped:    {skip_count:,}")
    print(f"   ❌ Failed:     {fail_count}")
    print(f"   Total:         {len(rows):,}")
    if dry_run:
        print(f"   🔍 DRY RUN — no data was written")
    print()


# ============================================
# Entry Point
# ============================================
def main():
    parser = argparse.ArgumentParser(
        description="EMPLIQ — Data Migration (empliq_dev → local Postgres)"
    )
    parser.add_argument("--target", default="empliq_pre_prod",
                        choices=["empliq", "empliq_pre_prod"],
                        help="Target database (default: empliq_pre_prod)")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limit number of companies to migrate")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview migration without writing data")
    parser.add_argument("--update-logos", action="store_true",
                        help="Only update logo URLs for existing companies")
    parser.add_argument("--stats", action="store_true",
                        help="Show migration statistics")
    parser.add_argument("--reset", action="store_true",
                        help="Clear all companies and migration log before migrating")
    args = parser.parse_args()

    print()
    print("╔══════════════════════════════════════════════╗")
    print("║  EMPLIQ — Data Migration Tool (Python)       ║")
    print("║  empliq_dev (Oracle) → local Postgres        ║")
    print("╚══════════════════════════════════════════════╝")

    # Connect to Oracle via SSH tunnel
    print("\n🔌 Connecting to Oracle server via SSH tunnel...")
    try:
        tunnel, oracle_conn = connect_oracle_via_ssh()
    except Exception as e:
        print(f"❌ Could not connect to Oracle: {e}")
        sys.exit(1)
    print("   ✅ Connected to empliq_dev")

    try:
        if args.stats:
            show_stats(oracle_conn, args.target)
        elif args.update_logos:
            update_logos(oracle_conn, args.target, args.dry_run)
        else:
            if args.reset:
                print(f"\n🗑️  Resetting {args.target}...")
                local_conn = connect_local(args.target)
                with local_conn.cursor() as cur:
                    cur.execute("DELETE FROM benefits")
                    cur.execute("DELETE FROM salaries")
                    cur.execute("DELETE FROM reviews")
                    cur.execute("DELETE FROM interviews")
                    cur.execute("DELETE FROM positions")
                    cur.execute("DELETE FROM companies")
                    cur.execute(f"DELETE FROM _migration_log WHERE target_db = %s", (args.target,))
                    local_conn.commit()
                local_conn.close()
                print(f"   ✅ Cleared all data in {args.target}")
            migrate(oracle_conn, args.target, args.limit, args.dry_run)
    finally:
        oracle_conn.close()
        tunnel.terminate()
        tunnel.wait()
        print("🔌 SSH tunnel closed.\n")


if __name__ == "__main__":
    main()
