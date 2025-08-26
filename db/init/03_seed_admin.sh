#!/bin/bash
set -euo pipefail

: "${POSTGRES_USER:=flaguser}"
: "${POSTGRES_DB:=flagdb}"
: "${INIT_ADMIN_EMAIL:=admin@example.com}"
: "${INIT_ADMIN_PASSWORD:=ChangeMe123}"

echo "Seeding admin user: $INIT_ADMIN_EMAIL"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  INSERT INTO users (email, password_hash, role)
  VALUES ('$INIT_ADMIN_EMAIL', crypt('$INIT_ADMIN_PASSWORD', gen_salt('bf')), 'admin')
  ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      updated_at = NOW();
SQL
