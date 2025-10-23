from __future__ import annotations

import os
from pathlib import Path

import psycopg

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"
SCHEMA_TABLE = "schema_version"


def _database_url() -> str:
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://hospital_user:hospital_pass@localhost:5434/hospital_db",
    )
    return url.replace("+psycopg", "")


def ensure_schema_table(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {SCHEMA_TABLE} (
                version VARCHAR(150) PRIMARY KEY,
                description TEXT,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
    conn.commit()


def migration_version(path: Path) -> tuple[str, str]:
    name = path.stem  # V1.0.0_001__Create_Users_Table
    prefix, description = name.split("__", 1)
    return prefix, description.replace("_", " ")


def has_migration(conn: psycopg.Connection, version: str) -> bool:
    with conn.cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA_TABLE} WHERE version = %s", (version,))
        return cur.fetchone() is not None


def register_migration(conn: psycopg.Connection, version: str, description: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO {SCHEMA_TABLE} (version, description) VALUES (%s, %s)",
            (version, description),
        )
    conn.commit()


def apply_sql(conn: psycopg.Connection, sql: str) -> None:
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()


def run() -> None:
    database_url = _database_url()
    migrations = sorted(MIGRATIONS_DIR.glob("**/*.sql"))

    if not migrations:
        print("No migrations found", flush=True)
        return

    with psycopg.connect(database_url, autocommit=False) as conn:
        ensure_schema_table(conn)

        for path in migrations:
            version, description = migration_version(path)
            if has_migration(conn, version):
                continue

            sql = path.read_text(encoding="utf-8")
            print(f"Applying migration {version}: {description}", flush=True)
            apply_sql(conn, sql)
            register_migration(conn, version, description)

        print("Migrations complete", flush=True)


if __name__ == "__main__":
    run()
